import express, { Request, Response } from 'express';
import cors from 'cors';
import { Pool } from 'pg';
import bcrypt from 'bcrypt';
import * as fs from 'fs/promises'; // New import
import * as path from 'path';     // New import
require('dotenv').config();

const app = express();
const port = 4001;
const saltRounds = 10;

app.use(cors());
app.use(express.json());

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

// Base directory for progress files (configurable via environment variable)
const PROGRESS_FILES_BASE_DIR = process.env.MANUSCOPE_DATA_DIR
    ? path.join(process.env.MANUSCOPE_DATA_DIR, 'student_progress')
    : path.join(__dirname, '../data/student_progress'); // Default to backend/data/student_progress

// Ensure the progress files directory exists on server startup
fs.mkdir(PROGRESS_FILES_BASE_DIR, { recursive: true })
    .then(() => console.log(`Ensured progress files directory exists: ${PROGRESS_FILES_BASE_DIR}`))
    .catch(err => console.error('Failed to create progress files directory:', err));

app.get('/', (req: Request, res: Response) => {
  res.json({ message: 'Language Acquisition Monitor API is running' });
});

// User login endpoint
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

    // In a real app, you'd generate a JWT here
    res.json({ message: 'Login successful', role: user.role, userId: user.id });

  } catch (err: any) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// User creation endpoint
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

// Example endpoint: get all students
app.get('/students', async (req: Request, res: Response) => {
  try {
    const result = await pool.query('SELECT * FROM students');
    res.json(result.rows);
  } catch (err: any) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// Endpoint to get a single student
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

// Endpoint to get a student's assigned words
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

// Endpoint to get a student's progress
app.get('/students/:studentId/progress', async (req: Request, res: Response) => {
    const { studentId } = req.params;
    try {
        // 1. Get the progress file path from the database
        const dbResult = await pool.query(
            `SELECT progress_file_path FROM progress WHERE student_id = $1`,
            [studentId]
        );

        if (dbResult.rows.length === 0) {
            // No progress file path found, return empty progress
            return res.json({});
        }

        const filePath = dbResult.rows[0].progress_file_path;

        // 2. Read the JSON file
        const fileContent = await fs.readFile(filePath, 'utf8');
        const studentProgress = JSON.parse(fileContent);

        res.json(studentProgress);
    } catch (err: any) {
        console.error(err);
        // If file not found, return empty progress
        if (err.code === 'ENOENT') {
            return res.json({});
        }
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Endpoint to get a student's associated parents
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

// Endpoint to update a student's assigned words
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

// Endpoint to add a new student
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

// Endpoint to get all words
app.get('/words', async (req: Request, res: Response) => {
  try {
    const result = await pool.query('SELECT id, category, word, level, image_link, video_link, custom_image_boolean, custom_image_link, created_at FROM words ORDER BY category, word');
    res.json(result.rows);
  } catch (err: any) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// Endpoint to get the first 100 vocabulary words
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

        // Get the progress file path
        let filePath: string;
        const dbResult = await client.query(
            `SELECT progress_file_path FROM progress WHERE student_id = $1`,
            [studentId]
        );

        let currentProgress: StudentProgressData = {};

        if (dbResult.rows.length > 0) {
            filePath = dbResult.rows[0].progress_file_path;
            try {
                const fileContent = await fs.readFile(filePath, 'utf8');
                currentProgress = JSON.parse(fileContent);
            } catch (err: any) {
                if (err.code === 'ENOENT') {
                    console.warn(`Progress file not found for student ${studentId} at ${filePath}. Creating new.`);
                    // File not found, start with empty progress
                    filePath = path.join(PROGRESS_FILES_BASE_DIR, `${studentId}.json`);
                } else {
                    throw err; // Re-throw other file errors
                }
            }
        } else {
            // No entry in DB, create new file path
            filePath = path.join(PROGRESS_FILES_BASE_DIR, `${studentId}.json`);
            // Insert new entry into the progress table
            await client.query(
                `INSERT INTO progress (student_id, progress_file_path, last_updated) VALUES ($1, $2, NOW())`,
                [studentId, filePath]
            );
        }

        // Apply updates
        updates.forEach(update => {
            const { wordId, level, notes, forReview } = update;
            const existingEntry = currentProgress[wordId];

            currentProgress[wordId] = {
                level: level !== undefined ? level : (existingEntry ? existingEntry.level : 'Input'),
                notes: notes !== undefined ? notes : (existingEntry ? existingEntry.notes : undefined),
                for_review: forReview !== undefined ? forReview : (existingEntry ? existingEntry.for_review : true),
            };
        });

        // Write updated JSON to file
        await fs.writeFile(filePath, JSON.stringify(currentProgress, null, 2), 'utf8');

        // Update last_updated timestamp in DB
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

// Endpoint to record student progress
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

// Endpoint to record baseline progress for multiple words
app.post('/students/:studentId/baseline-progress', async (req: Request, res: Response) => {
  const { studentId } = req.params;
  const { progressEntries } = req.body; // Array of { wordId, level, notes, forReview }

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