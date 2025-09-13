import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

interface Student {
  id: string;
  first_name: string;
  last_name: string;
}

interface Word {
  id: string;
  category: string;
  word: string;
}

const ParentDashboard: React.FC = () => {
  const [student, setStudent] = useState<Student | null>(null);
  const [assignedWords, setAssignedWords] = useState<Word[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchParentData = async () => {
      try {
        // For now, fetch the first student to display assigned words
        const studentsResponse = await fetch(`${import.meta.env.VITE_API_BASE_URL}/students`);
        if (!studentsResponse.ok) throw new Error('Failed to fetch students');
        const studentsData: Student[] = await studentsResponse.json();

        if (studentsData.length > 0) {
          const firstStudent = studentsData[0];
          setStudent(firstStudent);

          const assignedWordsResponse = await fetch(`http://localhost:4001/students/${firstStudent.id}/words`);
          if (!assignedWordsResponse.ok) throw new Error('Failed to fetch assigned words');
          const assignedWordIds: string[] = await assignedWordsResponse.json();

          const allWordsResponse = await fetch('http://localhost:4001/words');
          if (!allWordsResponse.ok) throw new Error('Failed to fetch all words');
          const allWords: Word[] = await allWordsResponse.json();

          const filteredWords = allWords.filter(word => assignedWordIds.includes(word.id));
          setAssignedWords(filteredWords);
        } else {
          setError('No students found. Please ask a teacher to add students.');
        }
      } catch (err: any) {
        setError(err.message);
      }
    };

    fetchParentData();
  }, []);

  if (error) return <p style={{color: 'red'}}>Error: {error}</p>;
  if (!student) return <p>Loading...</p>;

  return (
    <div style={{fontFamily: 'sans-serif', padding: '2rem'}}>
      <h1>Parent Dashboard</h1>
      <h2>{student.first_name} {student.last_name}'s Vocabulary Goals</h2>
      {assignedWords.length > 0 ? (
        <>
          <p>Assigned Words: {assignedWords.length}</p>
          <Link to={`/flashcards/${student.id}`}>
            <button style={{padding: '0.75rem 1.5rem', fontSize: '1rem', backgroundColor: '#28a745', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer'}}>
              Start Flashcards
            </button>
          </Link>
          <h3 style={{marginTop: '2rem'}}>Assigned Word List:</h3>
          <ul>
            {assignedWords.map(word => (
              <li key={word.id}>{word.word} ({word.category})</li>
            ))}
          </ul>
        </>
      ) : (
        <p>No vocabulary goals assigned for {student.first_name} {student.last_name}. Please ask a teacher to assign words.</p>
      )}
    </div>
  );
}

export default ParentDashboard;