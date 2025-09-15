import { Client } from 'pg';
import * as fs from 'fs/promises';
import * as path from 'path';

// Database configuration (replace with your actual config)
const dbConfig = {
    user: process.env.DB_USER || 'postgres',
    host: process.env.DB_HOST || 'localhost',
    database: process.env.DB_NAME || 'manuscope_db',
    password: process.env.DB_PASSWORD || 'postgres',
    port: parseInt(process.env.DB_PORT || '5432', 10),
};

console.log('Using dbConfig:', dbConfig);

// Base directory for progress files (configurable via environment variable)
const PROGRESS_FILES_BASE_DIR = process.env.MANUSCOPE_DATA_DIR
    ? path.join(process.env.MANUSCOPE_DATA_DIR, 'student_progress')
    : path.join(__dirname, '../../data/student_progress'); // Default to backend/data/student_progress

async function migrateProgress() {
    const client = new Client(dbConfig);
    try {
        await client.connect();
        console.log('Connected to PostgreSQL database.');

        // Ensure the progress files directory exists
        await fs.mkdir(PROGRESS_FILES_BASE_DIR, { recursive: true });
        console.log(`Ensured directory exists: ${PROGRESS_FILES_BASE_DIR}`);

        // 1. Fetch all records from old_progress
        const res = await client.query(`SELECT student_id, word_id, level, notes, for_review FROM old_progress;`);
        const oldProgressRecords = res.rows;
        console.log(`Fetched ${oldProgressRecords.length} records from old_progress.`);

        // Group progress by student_id
        const studentProgressMap: Record<string, Record<string, { level: string; notes?: string; for_review?: boolean }>> = {};
        oldProgressRecords.forEach(record => {
            if (!studentProgressMap[record.student_id]) {
                studentProgressMap[record.student_id] = {};
            }
            studentProgressMap[record.student_id][record.word_id] = {
                level: record.level,
                notes: record.notes,
                for_review: record.for_review,
            };
        });
        console.log(`Grouped progress for ${Object.keys(studentProgressMap).length} students.`);

        // 2. Process each student's progress
        for (const studentId in studentProgressMap) {
            const studentProgress = studentProgressMap[studentId];
            const fileName = `${studentId}.json`;
            const filePath = path.join(PROGRESS_FILES_BASE_DIR, fileName);

            // Write JSON to file
            await fs.writeFile(filePath, JSON.stringify(studentProgress, null, 2), 'utf8');
            console.log(`Wrote progress for student ${studentId} to ${filePath}`);

            // Insert/Update record in the new progress table
            await client.query(
                `INSERT INTO progress (student_id, progress_file_path, last_updated)
                 VALUES ($1, $2, NOW())
                 ON CONFLICT (student_id) DO UPDATE SET progress_file_path = EXCLUDED.progress_file_path, last_updated = NOW();`,
                [studentId, filePath]
            );
            console.log(`Updated progress table for student ${studentId}.`);
        }

        console.log('Migration complete!');

    } catch (err) {
        console.error('Migration failed:', err);
    } finally {
        await client.end();
        console.log('Disconnected from PostgreSQL database.');
    }
}

migrateProgress();