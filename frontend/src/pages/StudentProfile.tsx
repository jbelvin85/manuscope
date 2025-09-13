import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';

interface Student {
  id: number;
  first_name: string;
  last_name: string;
  school?: string;
  date_of_birth?: string;
  claim_code: string;
  created_at: string;
}

interface Word {
  id: number;
  category: string;
  word: string;
}

const StudentProfile: React.FC = () => {
  const { studentId } = useParams<{ studentId: string }>();
  const [student, setStudent] = useState<Student | null>(null);
  const [words, setWords] = useState<Word[]>([]);
  const [first100Words, setFirst100Words] = useState<Word[]>([]); // New state for first 100 words
  const [assignedWords, setAssignedWords] = useState<Set<number>>(new Set());
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Fetch student details
    fetch(`http://localhost:4001/students/${studentId}`)
      .then(response => {
        if (!response.ok) throw new Error('Failed to fetch student details');
        return response.json();
      })
      .then(data => setStudent(data))
      .catch(err => setError(err.message));

    // Fetch all words
    fetch('http://localhost:4001/words')
      .then(response => {
        if (!response.ok) throw new Error('Failed to fetch words');
        return response.json();
      })
      .then(data => setWords(data))
      .catch(err => setError(err.message));

    // Fetch assigned words
    fetch(`http://localhost:4001/students/${studentId}/words`)
      .then(response => {
        if (!response.ok) throw new Error('Failed to fetch assigned words');
        return response.json();
      })
      .then(data => setAssignedWords(new Set(data)))
      .catch(err => setError(err.message));

    // Fetch first 100 words
    fetch('http://localhost:4001/words/first100')
      .then(response => {
        if (!response.ok) throw new Error('Failed to fetch first 100 words');
        return response.json();
      })
      .then(data => setFirst100Words(data))
      .catch(err => setError(err.message));

  }, [studentId]);

  const handleWordAssignmentChange = (wordId: number) => {
    setAssignedWords(prevAssignedWords => {
      const newAssignedWords = new Set(prevAssignedWords);
      if (newAssignedWords.has(wordId)) {
        newAssignedWords.delete(wordId);
      } else {
        newAssignedWords.add(wordId);
      }
      return newAssignedWords;
    });
  };

  const handleSaveChanges = () => {
    fetch(`http://localhost:4001/students/${studentId}/words`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ wordIds: Array.from(assignedWords) }),
    })
      .then(response => {
        if (!response.ok) throw new Error('Failed to save changes');
        alert('Changes saved successfully!');
      })
      .catch(err => setError(err.message));
  };

  const groupedWords = words.reduce((acc, word) => {
    if (!acc[word.category]) {
      acc[word.category] = [];
    }
    acc[word.category].push(word);
    return acc;
  }, {} as Record<string, Word[]>);

  if (error) return <p style={{color: 'red'}}>Error: {error}</p>;
  if (!student) return <p>Loading...</p>;

  return (
    <div style={{fontFamily: 'sans-serif', padding: '2rem'}}>
      <h1>{student.first_name} {student.last_name}</h1>
      <p>School: {student.school || 'N/A'}</p>
      <p>Date of Birth: {student.date_of_birth || 'N/A'}</p>
      <p>Claim Code: <strong>{student.claim_code}</strong></p>
      <Link to={`/student/${studentId}/onboarding`} style={{ display: 'inline-block', marginTop: '1rem', padding: '0.5rem 1rem', backgroundColor: '#007bff', color: 'white', textDecoration: 'none', borderRadius: '5px' }}>
        Start Onboarding Review
      </Link>

      <h2>Assign First 100 Words</h2>
      <button onClick={() => {
        const newAssignedWords = new Set(assignedWords);
        first100Words.forEach(word => newAssignedWords.add(word.id));
        setAssignedWords(newAssignedWords);
      }} style={{marginBottom: '1rem'}}>Assign All First 100 Words</button>
      <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '0.5rem', marginBottom: '2rem'}}>
        {first100Words.map(word => (
          <div key={word.id}>
            <input
              type="checkbox"
              id={`first100-word-${word.id}`}
              checked={assignedWords.has(word.id)}
              onChange={() => handleWordAssignmentChange(word.id)}
            />
            <label htmlFor={`first100-word-${word.id}`}>{word.word}</label>
          </div>
        ))}
      </div>

      <h2>Vocabulary Goals</h2>
      <button onClick={handleSaveChanges} style={{marginBottom: '1rem'}}>Save Changes</button>
      {Object.entries(groupedWords).map(([category, wordsInCategory]) => (
        <div key={category} style={{marginBottom: '1.5rem'}}>
          <h3>{category}</h3>
          <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '0.5rem'}}>
            {wordsInCategory.map(word => (
              <div key={word.id}>
                <input
                  type="checkbox"
                  id={`word-${word.id}`}
                  checked={assignedWords.has(word.id)}
                  onChange={() => handleWordAssignmentChange(word.id)}
                />
                <label htmlFor={`word-${word.id}`}>{word.word}</label>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

export default StudentProfile;
