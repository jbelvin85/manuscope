import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import { Pool } from 'pg';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import * as fs from 'fs/promises';
import * as path from 'path';
require('dotenv').config();

const app = express();
const port = 4001;
const saltRounds = 10;
const JWT_SECRET = process.env.JWT_SECRET || 'your-default-secret';

// Extend Express Request interface to include user
declare global {
    namespace Express {
        interface Request {
            user?: any; // You can define a more specific type for your user payload
        }
    }
}

app.use(cors());
app.use(express.json());

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

const PROGRESS_FILES_BASE_DIR = process.env.MANUSCOPE_DATA_DIR
    ? path.join(process.env.MANUSCOPE_DATA_DIR, 'student_progress')
    : path.join(__dirname, '../data/student_progress');

fs.mkdir(PROGRESS_FILES_BASE_DIR, { recursive: true })
    .then(() => console.log(`Ensured progress files directory exists: ${PROGRESS_FILES_BASE_DIR}`))
    .catch(err => console.error('Failed to create progress files directory:', err));

// Authentication Middleware
const authenticateToken = (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (token == null) return res.sendStatus(401); // if there isn't any token

    jwt.verify(token, JWT_SECRET, (err: any, user: any) => {
        if (err) return res.sendStatus(403); // if the token is no longer valid
        req.user = user;
        next(); // proceed to the next middleware or route handler
    });
};

app.get('/', (req: Request, res: Response) => {
  res.json({ message: 'Language Acquisition Monitor API is running' });
});

app.post('/login', async (req: Request, res: Response) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  try {
    const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const user = result.rows[0];
    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Generate a JWT
    const token = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, { expiresIn: '1h' });

    res.json({ message: 'Login successful', token, role: user.role });

  } catch (err: any) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/users', async (req: Request, res: Response) => {
  const { firstName, lastName, email, password, role } = req.body;

  if (!email || !password || !role) {
    return res.status(400).json({ error: 'Email, password, and role are required' });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    const result = await pool.query(
      'INSERT INTO users (first_name, last_name, email, password, role) VALUES ($1, $2, $3, $4, $5) RETURNING id, first_name, last_name, email, role',
      [firstName, lastName, email, hashedPassword, role]
    );
    res.status(201).json(result.rows[0]);
  } catch (err: any) {
    console.error(err);
    if (err.code === '23505') { // Unique violation
      return res.status(409).json({ error: 'User with this email already exists' });
    }
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET parent's students
app.get('/parent/students', authenticateToken, async (req: Request, res: Response) => {
    const parentId = req.user.id;

    try {
        const result = await pool.query(
            `SELECT s.id, s.first_name, s.last_name
             FROM students s
             JOIN student_parent_association spa ON s.id = spa.student_id
             WHERE spa.parent_id = $1`,
            [parentId]
        );
        res.json(result.rows);
    } catch (err: any) {
        console.error('Error fetching students for parent:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.post('/students/claim', authenticateToken, async (req: Request, res: Response) => {
    const parentId = req.user.id;
    const { claim_code } = req.body;

    if (!claim_code) {
        return res.status(400).json({ error: 'Claim code is required' });
    }

    try {
        // Find the student with the claim code
        const studentResult = await pool.query('SELECT id FROM students WHERE claim_code = $1', [claim_code]);
        if (studentResult.rows.length === 0) {
            return res.status(404).json({ error: 'Invalid claim code' });
        }
        const studentId = studentResult.rows[0].id;

        // Check if the association already exists
        const associationResult = await pool.query(
            'SELECT * FROM student_parent_association WHERE student_id = $1 AND parent_id = $2',
            [studentId, parentId]
        );
        if (associationResult.rows.length > 0) {
            return res.status(409).json({ error: 'Student already claimed' });
        }

        // Create the association
        await pool.query(
            'INSERT INTO student_parent_association (student_id, parent_id) VALUES ($1, $2)',
            [studentId, parentId]
        );

        res.status(201).json({ message: 'Student claimed successfully' });

    } catch (err: any) {
        console.error('Error claiming student:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.get('/students', async (req: Request, res: Response) => {
  try {
    const result = await pool.query('SELECT * FROM students');
    res.json(result.rows);
  } catch (err: any) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

app.get('/students/:studentId', async (req: Request, res: Response) => {
  const { studentId } = req.params;
  try {
    const result = await pool.query('SELECT * FROM students WHERE id = $1', [studentId]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Student not found' });
    }
    res.json(result.rows[0]);
  } catch (err: any) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

app.get('/students/:studentId/words', async (req: Request, res: Response) => {
  const { studentId } = req.params;
  try {
    const result = await pool.query('SELECT word_id FROM assignments WHERE student_id = $1', [studentId]);
    res.json(result.rows.map(row => row.word_id));
  } catch (err: any) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

app.get('/students/:studentId/progress', async (req: Request, res: Response) => {
    const { studentId } = req.params;
    try {
        const dbResult = await pool.query(
            `SELECT progress_file_path FROM progress WHERE student_id = $1`,
            [studentId]
        );

        if (dbResult.rows.length === 0 || !dbResult.rows[0].progress_file_path) {
            return res.json({});
        }

        const filePath = dbResult.rows[0].progress_file_path;
        const fileContent = await fs.readFile(filePath, 'utf8');

        if (fileContent.trim() === '') {
            return res.json({});
        }

        const studentProgress = JSON.parse(fileContent);
        res.json(studentProgress);

    } catch (err: any) {
        console.error(`Error fetching progress for student ${studentId}:`, err);

        if (err.code === 'ENOENT' || err instanceof SyntaxError) {
            return res.json({});
        }

        res.status(500).json({ error: 'Internal server error' });
    }
});

app.get('/students/:studentId/progress-summary', async (req: Request, res: Response) => {
    const { studentId } = req.params;
    try {
        const dbResult = await pool.query(
            `SELECT progress_file_path FROM progress WHERE student_id = $1`,
            [studentId]
        );

        if (dbResult.rows.length === 0 || !dbResult.rows[0].progress_file_path) {
            return res.json({ totalWords: 0, levels: {}, forReview: 0 });
        }

        const filePath = dbResult.rows[0].progress_file_path;
        const fileContent = await fs.readFile(filePath, 'utf8');

        if (fileContent.trim() === '') {
            return res.json({ totalWords: 0, levels: {}, forReview: 0 });
        }

        const studentProgress: any = JSON.parse(fileContent);
        
        const summary = {
            totalWords: Object.keys(studentProgress).length,
            levels: {} as { [level: string]: number },
            forReview: 0,
        };

        for (const wordId in studentProgress) {
            const entry = studentProgress[wordId];
            if (entry.level) {
                summary.levels[entry.level] = (summary.levels[entry.level] || 0) + 1;
            }
            if (entry.for_review) {
                summary.forReview += 1;
            }
        }

        res.json(summary);

    } catch (err: any) {
        console.error(`Error fetching progress summary for student ${studentId}:`, err);
        if (err.code === 'ENOENT' || err instanceof SyntaxError) {
            return res.json({ totalWords: 0, levels: {}, forReview: 0 });
        }
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.get('/students/:studentId/parents', async (req: Request, res: Response) => {
    const { studentId } = req.params;
    try {
        const result = await pool.query(
            `SELECT u.id, u.first_name, u.last_name, u.avatar_url
             FROM users u
             JOIN student_parent_association spa ON u.id = spa.parent_id
             WHERE spa.student_id = $1`,
            [studentId]
        );
        res.json(result.rows);
    } catch (err: any) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
});

app.post('/students/:studentId/words', async (req: Request, res: Response) => {
  const { studentId } = req.params;
  const { wordIds } = req.body;

  if (!Array.isArray(wordIds)) {
    return res.status(400).json({ error: 'wordIds must be an array' });
  }

  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    await client.query('DELETE FROM assignments WHERE student_id = $1', [studentId]);
    for (const wordId of wordIds) {
      await client.query('INSERT INTO assignments (student_id, word_id) VALUES ($1, $2)', [studentId, wordId]);
    }
    await client.query('COMMIT');
    res.status(201).json({ message: 'Assignments updated successfully' });
  } catch (err: any) {
    await client.query('ROLLBACK');
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  } finally {
    client.release();
  }
});

app.post('/students', async (req: Request, res: Response) => {
  const { school, firstName, lastName, dateOfBirth } = req.body;

  if (!firstName || !lastName) {
    return res.status(400).json({ error: 'Student first name and last name are required' });
  }

  const generateClaimCode = (): string => {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 8; i++) {
      result += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return result;
  };

  let claimCode = '';
  let isUnique = false;
  while (!isUnique) {
    claimCode = generateClaimCode();
    const existingStudent = await pool.query('SELECT id FROM students WHERE claim_code = $1', [claimCode]);
    if (existingStudent.rows.length === 0) {
      isUnique = true;
    }
  }

  try {
    const result = await pool.query(
      'INSERT INTO students (school, first_name, last_name, date_of_birth, claim_code) VALUES ($1, $2, $3, $4, $5) RETURNING * ',
      [school, firstName, lastName, dateOfBirth, claimCode]
    );
    res.status(201).json(result.rows[0]);
  } catch (err: any) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

app.get('/words', async (req: Request, res: Response) => {
  try {
    const result = await pool.query('SELECT id, category, word, level, image_link, video_link, custom_image_boolean, custom_image_link, created_at FROM words ORDER BY category, word');
    res.json(result.rows);
  } catch (err: any) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

app.get('/words/first100', async (req: Request, res: Response) => {
  try {
    const result = await pool.query('SELECT id, category, word, level, image_link, video_link, custom_image_boolean, custom_image_link, created_at FROM words ORDER BY id LIMIT 100');
    res.json(result.rows);
  } catch (err: any) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

interface WordProgressEntry {
    level: string;
    notes?: string;
    for_review?: boolean;
}

interface StudentProgressData {
    [wordId: string]: WordProgressEntry;
}

async function updateStudentProgressFile(
    studentId: string,
    updates: { wordId: string; level?: string; notes?: string; forReview?: boolean }[]
): Promise<void> {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        let filePath: string;
        const dbResult = await client.query(
            `SELECT progress_file_path FROM progress WHERE student_id = $1`,
            [studentId]
        );

        let currentProgress: StudentProgressData = {};

        if (dbResult.rows.length > 0) {
            filePath = dbResult.rows[0].progress_file_path;
            let fileContent = '';
            try {
                fileContent = await fs.readFile(filePath, 'utf8');
                if (fileContent.trim() === '') {
                    currentProgress = {};
                } else {
                    try {
                        currentProgress = JSON.parse(fileContent);
                    } catch (jsonErr: any) {
                        currentProgress = {};
                    }
                }
            } catch (readErr: any) {
                if (readErr.code === 'ENOENT') {
                    filePath = path.join(PROGRESS_FILES_BASE_DIR, `${studentId}.json`);
                    await client.query(
                        `UPDATE progress SET progress_file_path = $1 WHERE student_id = $2`,
                        [filePath, studentId]
                    );
                } else {
                    throw readErr;
                }
            }
        } else {
            filePath = path.join(PROGRESS_FILES_BASE_DIR, `${studentId}.json`);
            await client.query(
                `INSERT INTO progress (student_id, progress_file_path, last_updated) VALUES ($1, $2, NOW())`,
                [studentId, filePath]
            );
        }

        updates.forEach(update => {
            const { wordId, level, notes, forReview } = update;
            const existingEntry = currentProgress[wordId];

            currentProgress[wordId] = {
                level: level !== undefined ? level : (existingEntry ? existingEntry.level : 'Input'),
                notes: notes !== undefined ? notes : (existingEntry ? existingEntry.notes : undefined),
                for_review: forReview !== undefined ? forReview : (existingEntry ? existingEntry.for_review : true),
            };
        });

        try {
            await fs.writeFile(filePath, JSON.stringify(currentProgress, null, 2), 'utf8');
        } catch (writeErr: any) {
            throw writeErr;
        }

        await client.query(
            `UPDATE progress SET last_updated = NOW() WHERE student_id = $1`,
            [studentId]
        );

        await client.query('COMMIT');
    } catch (err) {
        await client.query('ROLLBACK');
        throw err;
    } finally {
        client.release();
    }
}

app.post('/progress', async (req: Request, res: Response) => {
  const { studentId, wordId, level, notes, forReview } = req.body;

  if (!studentId || !wordId) {
    return res.status(400).json({ error: 'Student ID and Word ID are required.' });
  }

  try {
    await updateStudentProgressFile(studentId, [{ wordId, level, notes, forReview }]);
    res.status(201).json({ message: 'Progress recorded successfully' });
  } catch (err: any) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/students/:studentId/baseline-progress', async (req: Request, res: Response) => {
  const { studentId } = req.params;
  const { progressEntries } = req.body;

  if (!Array.isArray(progressEntries)) {
    return res.status(400).json({ error: 'progressEntries must be an array' });
  }

  try {
    await updateStudentProgressFile(studentId, progressEntries);
    res.status(201).json({ message: 'Baseline progress recorded successfully' });
  } catch (err: any) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.listen(port, () => {
  console.log(`Backend running on port ${port}`);
});
