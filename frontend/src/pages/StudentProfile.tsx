import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { levelColors, Level } from '../constants'; // Assuming Level and levelColors are still needed for display
import { PieChart, Pie, Cell, BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

// Interfaces
interface Student { id: string; first_name: string; last_name: string; school?: string; date_of_birth?: string; avatar_url?: string; }
interface Word { id: string; category: string; word: string; }
interface ProgressEntry { level: Level; }
interface ProgressData { [word_id: string]: ProgressEntry; }

// New Interfaces for Progress Summary
interface OverallProgress {
  masteredCount: number;
  inProgressCount: number;
  totalWords: number;
}

interface ProgressOverTimeEntry {
  date: string;
  wordsMastered: number;
  wordsMovedUpLevel: number;
}

interface LevelDistributionEntry {
  level: Level;
  count: number;
}

interface CategoryBreakdownEntry {
  category: string;
  masteredCount: number;
  inProgressCount: number;
  totalCount: number;
}

interface ProgressSummary {
  studentId: string;
  overallProgress: OverallProgress;
  progressOverTime: ProgressOverTimeEntry[];
  levelDistribution: LevelDistributionEntry[];
  categoryBreakdown: CategoryBreakdownEntry[];
  lastActivityDate: string;
}

const StudentProfile: React.FC = () => {
  const { studentId } = useParams<{ studentId: string }>();
  const [student, setStudent] = useState<Student | null>(null);
  const [words, setWords] = useState<Word[]>([]);
  const [progress, setProgress] = useState<Record<string, Level>>({});
  const [progressSummary, setProgressSummary] = useState<ProgressSummary | null>(null); // New state for summary
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          setError('Authentication token not found.');
          setLoading(false);
          return;
        }

        const [studentRes, wordsRes, progressRes, progressSummaryRes] = await Promise.all([ // Added progressSummaryRes
          fetch(`${import.meta.env.VITE_API_BASE_URL}/students/${studentId}`, {
            headers: { 'Authorization': `Bearer ${token}` },
            cache: 'no-store' // Ensure fresh data is fetched
          }),
          fetch(`${import.meta.env.VITE_API_BASE_URL}/words`, {
            headers: { 'Authorization': `Bearer ${token}` },
            cache: 'no-store' // Ensure fresh data is fetched
          }),
          fetch(`${import.meta.env.VITE_API_BASE_URL}/students/${studentId}/progress`, {
            headers: { 'Authorization': `Bearer ${token}` },
            cache: 'no-store' // Ensure fresh data is fetched
          }),
          fetch(`${import.meta.env.VITE_API_BASE_URL}/students/${studentId}/progress-summary`, {
            headers: { 'Authorization': `Bearer ${token}` },
            cache: 'no-store' // Ensure fresh data is fetched
          }),
        ]);

        if (!studentRes.ok) throw new Error('Failed to fetch student details');
        if (!wordsRes.ok) throw new Error('Failed to fetch words');
        if (!progressRes.ok) throw new Error('Failed to fetch progress');
        if (!progressSummaryRes.ok) throw new Error('Failed to fetch progress summary'); // Error check for new fetch

        const studentData = await studentRes.json();
        const wordsData = await wordsRes.json();
        const progressData: ProgressData = await progressRes.json();
        const progressSummaryData: ProgressSummary = await progressSummaryRes.json(); // Parse new data

        setStudent(studentData);
        setWords(wordsData);
        setProgressSummary(progressSummaryData);

        const progressMap: Record<string, Level> = {};
        for (const wordId in progressData) {
          progressMap[wordId] = progressData[wordId].level;
        }
        setProgress(progressMap);

      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [studentId]);

  const formatDate = (dateString?: string) => !dateString ? 'N/A' : new Date(dateString).toISOString().split('T')[0];
  const getWordStyle = (wordId: string) => ({
    padding: '0.25rem 0.5rem',
    borderRadius: '5px',
    backgroundColor: levelColors[progress[wordId] || ''],
    display: 'inline-block',
    marginBottom: '0.25rem',
    marginRight: '0.5rem',
    color: 'white', // Ensure text is visible on colored background
  });

  // Group words by category for display
  const groupedWords = words.reduce((acc, word) => {
    if (progress[word.id]) { // Only show words with progress
      if (!acc[word.category]) acc[word.category] = [];
      acc[word.category].push(word);
    }
    return acc;
  }, {} as Record<string, Word[]>);

  if (loading) return <p>Loading...</p>;
  if (error) return <p style={{ color: 'red' }}>Error: {error}</p>;
  if (!student) return <p>No student data found.</p>;

  return (
    <div style={{ fontFamily: 'sans-serif', padding: '2rem' }}>
      <header style={{
        paddingBottom: '1rem',
        borderBottom: '1px solid #eee',
        marginBottom: '2rem',
        display: 'flex',
        alignItems: 'center',
        gap: '1.5rem'
      }}>
        <img src={student.avatar_url || '/resources/img/default_user.png'} alt="Student Avatar" style={{ width: '80px', height: '80px', borderRadius: '50%', objectFit: 'cover' }} />
        <div>
          <h1 style={{ margin: 0, color: '#333' }}>{student.first_name} {student.last_name}</h1>
          <p style={{ margin: '0.5rem 0 0', color: '#555' }}><strong>DOB:</strong> {formatDate(student.date_of_birth)}</p>
          <p style={{ margin: '0 0 0.5rem', color: '#555' }}><strong>School:</strong> {student.school || 'N/A'}</p>
        </div>
      </header>

      <main>
        <div style={{ marginBottom: '2rem', padding: '1.5rem', border: '1px solid #e0e0e0', borderRadius: '8px', backgroundColor: '#f9f9f9' }}>
          <h2 style={{ marginTop: 0, color: '#333' }}>Learning Progress Overview</h2>
          <p>Here you can see a summary of {student.first_name}'s vocabulary acquisition.</p>

          {progressSummary && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem', marginTop: '2rem' }}>

              {/* Overall Progress Donut Chart */}
              <div style={{ border: '1px solid #eee', borderRadius: '8px', padding: '1rem', backgroundColor: 'white' }}>
                <h3 style={{ textAlign: 'center', marginBottom: '1rem', color: '#444' }}>Overall Progress</h3>
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie
                      data={[
                        { name: 'Mastered', value: progressSummary.overallProgress.masteredCount },
                        { name: 'In Progress', value: progressSummary.overallProgress.inProgressCount },
                      ]}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      fill="#8884d8"
                      paddingAngle={5}
                      dataKey="value"
                    >
                      <Cell key={`cell-mastered`} fill={'#28a745'} /> {/* Green for Mastered */}
                      <Cell key={`cell-in-progress`} fill={'#007bff'} /> {/* Blue for In Progress */}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
                <p style={{ textAlign: 'center', marginTop: '1rem', color: '#555' }}>
                  Total Words: <span style={{ fontWeight: 'bold' }}>{progressSummary.overallProgress.totalWords}</span>
                </p>
              </div>

              {/* Acquisition Level Distribution Bar Chart */}
              <div style={{ border: '1px solid #eee', borderRadius: '8px', padding: '1rem', backgroundColor: 'white' }}>
                <h3 style={{ textAlign: 'center', marginBottom: '1rem', color: '#444' }}>Words by Acquisition Level</h3>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart
                    data={progressSummary.levelDistribution.map(entry => ({
                      name: entry.level,
                      count: entry.count,
                      fill: levelColors[entry.level] // Use levelColors for consistency
                    }))}
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="count" fill="#8884d8">
                      {progressSummary.levelDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={levelColors[entry.level]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Progress Over Time Line Chart */}
              <div style={{ border: '1px solid #eee', borderRadius: '8px', padding: '1rem', backgroundColor: 'white' }}>
                <h3 style={{ textAlign: 'center', marginBottom: '1rem', color: '#444' }}>Progress Over Time</h3>
                <ResponsiveContainer width="100%" height={200}>
                  <LineChart
                    data={progressSummary.progressOverTime}
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="wordsMastered" stroke="#28a745" name="Words Mastered" />
                    {/* <Line type="monotone" dataKey="wordsMovedUpLevel" stroke="#007bff" name="Words Moved Up Level" /> */}
                  </LineChart>
                </ResponsiveContainer>
              </div>

              {/* Category Breakdown (Simplified List) */}
              <div style={{ border: '1px solid #eee', borderRadius: '8px', padding: '1rem', backgroundColor: 'white' }}>
                <h3 style={{ textAlign: 'center', marginBottom: '1rem', color: '#444' }}>Category Breakdown</h3>
                <ul style={{ listStyleType: 'none', padding: 0 }}>
                  {progressSummary.categoryBreakdown.map((entry, index) => (
                    <li key={index} style={{ marginBottom: '0.5rem', borderBottom: '1px dashed #eee', paddingBottom: '0.5rem' }}>
                      <strong>{entry.category}:</strong> Mastered <span style={{ color: '#28a745', fontWeight: 'bold' }}>{entry.masteredCount}</span>, In Progress <span style={{ color: '#007bff', fontWeight: 'bold' }}>{entry.inProgressCount}</span>
                    </li>
                  ))}
                </ul>
              </div>

            </div>
          )}

          <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem', width: '100%' }}>
            <Link to={`/flashcards/${student.id}`} style={{ textDecoration: 'none', flexGrow: 1 }}>
              <button style={{
                padding: '0.75rem 1.5rem',
                fontSize: '1rem',
                backgroundColor: '#28a745',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                width: '100%'
              }}>
                Start Flashcards for {student.first_name}
              </button>
            </Link>
            <Link to={`/progress-reports/${student.id}`} style={{ textDecoration: 'none', flexGrow: 1 }}>
              <button style={{
                padding: '0.75rem 1.5rem',
                fontSize: '1rem',
                backgroundColor: '#6c757d', // A neutral color for reports
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                width: '100%'
              }}>
                View Progress Report
              </button>
            </Link>
          </div>
        </div>

        <h2 style={{ color: '#333', marginBottom: '1.5rem' }}>Assigned Vocabulary</h2>
        {Object.keys(groupedWords).length > 0 ? (
          Object.entries(groupedWords).map(([category, wordsInCategory]) => (
            <div key={category} style={{ marginBottom: '1.5rem', border: '1px solid #eee', borderRadius: '8px', padding: '1rem' }}>
              <h3 style={{ marginTop: 0, marginBottom: '1rem', color: '#444' }}>{category}</h3>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                {wordsInCategory.map(word => (
                  <span key={word.id} style={getWordStyle(word.id)}>
                    {word.word} ({progress[word.id]})
                  </span>
                ))}
              </div>
            </div>
          ))
        ) : (
          <p>No vocabulary assigned or progress recorded for {student.first_name}.</p>
        )}
      </main>
    </div>
  );
};

export default StudentProfile;