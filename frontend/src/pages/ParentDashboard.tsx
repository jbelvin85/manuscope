import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext'; // Import useAuth

// Word interface is still needed if we display assigned words later
interface Word {
  id: string;
  category: string;
  word: string;
}

const ParentDashboard: React.FC = () => {
  const { students, userRole } = useAuth(); // Get students from AuthContext
  const [error, setError] = useState<string | null>(null); // Keep error state for other potential errors
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [assignedWords, setAssignedWords] = useState<Word[]>([]); // Keep assigned words state

  useEffect(() => {
    if (students && students.length > 0 && !selectedStudent) {
      setSelectedStudent(students[0]); // Automatically select the first student
    }
  }, [students, selectedStudent]);

  useEffect(() => {
    const fetchAssignedWords = async () => {
      if (selectedStudent) {
        try {
          // Use the token from local storage for authorization
          const token = localStorage.getItem('token');
          if (!token) {
            setError('Authentication token not found.');
            return;
          }

          const assignedWordsResponse = await fetch(`${import.meta.env.VITE_API_BASE_URL}/students/${selectedStudent.id}/words`, {
            headers: {
              'Authorization': `Bearer ${token}`,
            },
            cache: 'no-store' // Ensure fresh data is fetched
          });
          if (!assignedWordsResponse.ok) throw new Error('Failed to fetch assigned words');
          const assignedWordIds: string[] = await assignedWordsResponse.json();

          const allWordsResponse = await fetch(`${import.meta.env.VITE_API_BASE_URL}/words`, {
            headers: {
              'Authorization': `Bearer ${token}`,
            },
            cache: 'no-store' // Ensure fresh data is fetched
          });
          if (!allWordsResponse.ok) throw new Error('Failed to fetch all words');
          const allWords: Word[] = await allWordsResponse.json();

          const filteredWords = allWords.filter(word => assignedWordIds.includes(word.id));
          setAssignedWords(filteredWords);
        } catch (err: any) {
          setError(err.message);
        }
      }
    };

    fetchAssignedWords();
  }, [selectedStudent]); // Refetch when selected student changes

  if (userRole !== 'parent') {
    return <p style={{ color: 'red' }}>Access Denied: This page is for parents only.</p>;
  }

  if (error) return <p style={{ color: 'red' }}>Error: {error}</p>;
  if (!students) return <p>Loading students...</p>; // Show loading for students

  if (students.length === 0) {
    return (
      <div style={{ fontFamily: 'sans-serif', padding: '2rem' }}>
        <h1>Parent Dashboard</h1>
        <p>No students are associated with your account. Please ask a teacher to add students and provide you with a claim code, or <Link to="/claim-student">claim a student</Link> if you have a code.</p>
      </div>
    );
  }

  return (
    <div style={{ fontFamily: 'sans-serif', padding: '2rem' }}>
      <h1>Parent Dashboard</h1>

      {/* Student Selector */}
      {students.length > 1 && (
        <div style={{ marginBottom: '1.5rem' }}>
          <label htmlFor="student-select" style={{ marginRight: '1rem', fontWeight: 'bold' }}>Select Student:</label>
          <select
            id="student-select"
            value={selectedStudent?.id || ''}
            onChange={(e) => {
              const studentId = e.target.value;
              const student = students.find(s => s.id === studentId);
              setSelectedStudent(student || null);
            }}
            style={{ padding: '0.5rem', borderRadius: '4px', border: '1px solid #ddd' }}
          >
            {students.map(s => (
              <option key={s.id} value={s.id}>{s.first_name} {s.last_name}</option>
            ))}
          </select>
        </div>
      )}

      {selectedStudent && (
        <>
          <h2>{selectedStudent.first_name} {selectedStudent.last_name}'s Learning Journey</h2>
          <div style={{
            border: '1px solid #e0e0e0',
            borderRadius: '8px',
            padding: '1.5rem',
            marginBottom: '2rem',
            backgroundColor: '#f9f9f9'
          }}>
            <h3 style={{ marginTop: 0 }}>Progress Summary:</h3>
            <p>Overall progress: <span style={{ fontWeight: 'bold', color: '#28a745' }}>Good</span></p>
            <p>Words mastered: <span style={{ fontWeight: 'bold' }}>X</span></p> {/* Placeholder */}
            <p>Words in progress: <span style={{ fontWeight: 'bold' }}>Y</span></p> {/* Placeholder */}
            <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
              <Link to={`/student-profile/${selectedStudent.id}`} style={{ textDecoration: 'none' }}>
                <button style={{
                  padding: '0.75rem 1.5rem',
                  fontSize: '1rem',
                  backgroundColor: '#007bff',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer'
                }}>
                  View Full Profile
                </button>
              </Link>
              <Link to={`/progress-reports/${selectedStudent.id}`} style={{ textDecoration: 'none' }}>
                <button style={{
                  padding: '0.75rem 1.5rem',
                  fontSize: '1rem',
                  backgroundColor: '#6c757d', // A neutral color for reports
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer'
                }}>
                  View Progress Report
                </button>
              </Link>
            </div>
          </div>

          {assignedWords.length > 0 ? (
            <>
              <p>Assigned Words: {assignedWords.length}</p>
              <Link to={`/flashcards/${selectedStudent.id}`}>
                <button style={{
                  padding: '0.75rem 1.5rem',
                  fontSize: '1rem',
                  backgroundColor: '#28a745',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer'
                }}>
                  Start Flashcards
                </button>
              </Link>
              <h3 style={{ marginTop: '2rem' }}>Assigned Word List:</h3>
              <ul>
                {assignedWords.map(word => (
                  <li key={word.id}>{word.word} ({word.category})</li>
                ))}
              </ul>
            </>
          ) : (
            <p>No vocabulary goals assigned for {selectedStudent.first_name} {selectedStudent.last_name}.</p>
          )}
        </>
      )}
    </div>
  );
};

export default ParentDashboard;