import express, { Request, Response } from 'express';
import cors from 'cors';
import { Pool } from 'pg';
import bcrypt from 'bcrypt';

const app = express();
const port = 4001;
const saltRounds = 10;

app.use(cors());
app.use(express.json());

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

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
    const result = await pool.query('SELECT * FROM words ORDER BY category, word');
    res.json(result.rows);
  } catch (err: any) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// Endpoint to record student progress
app.post('/progress', async (req: Request, res: Response) => {
  const { studentId, wordId, level } = req.body;

  if (!studentId || !wordId || !level) {
    return res.status(400).json({ error: 'Student ID, word ID, and level are required' });
  }

  try {
    // Check if a progress entry already exists for this student and word
    const existingProgress = await pool.query(
      'SELECT * FROM progress WHERE student_id = $1 AND word_id = $2',
      [studentId, wordId]
    );

    if (existingProgress.rows.length > 0) {
      // Update existing progress
      await pool.query(
        'UPDATE progress SET level = $1, updated_at = CURRENT_TIMESTAMP WHERE student_id = $2 AND word_id = $3',
        [level, studentId, wordId]
      );
    } else {
      // Insert new progress
      await pool.query(
        'INSERT INTO progress (student_id, word_id, level) VALUES ($1, $2, $3)',
        [studentId, wordId, level]
      );
    }
    res.status(201).json({ message: 'Progress recorded successfully' });
  } catch (err: any) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.listen(port, () => {
  console.log(`Backend running on port ${port}`);
});