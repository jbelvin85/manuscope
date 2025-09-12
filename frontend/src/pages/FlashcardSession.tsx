import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

interface Word {
  id: number;
  category: string;
  word: string;
}

interface FlashcardProps {
  word: Word;
}

const Flashcard: React.FC<FlashcardProps> = ({ word }) => {
  return (
    <div style={{
      border: '1px solid #ccc',
      borderRadius: '8px',
      padding: '2rem',
      textAlign: 'center',
      minHeight: '200px',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      fontSize: '2rem',
      fontWeight: 'bold',
      backgroundColor: '#f9f9f9'
    }}>
      {word.word}
      {/* Placeholder for image/icon */}
      <div style={{marginTop: '1rem', fontSize: '1rem', color: '#666'}}>{word.category}</div>
    </div>
  );
};

const FlashcardSession: React.FC = () => {
  const { studentId } = useParams<{ studentId: string }>();
  const navigate = useNavigate();
  const [words, setWords] = useState<Word[]>([]);
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!studentId) {
      setError('Student ID is missing.');
      return;
    }

    fetch(`http://localhost:4001/students/${studentId}/words`)
      .then(response => {
        if (!response.ok) throw new Error('Failed to fetch assigned words');
        return response.json();
      })
      .then(assignedWordIds => {
        if (assignedWordIds.length === 0) {
          setError('No words assigned to this student.');
          return;
        }
        return fetch('http://localhost:4001/words')
          .then(response => {
            if (!response.ok) throw new Error('Failed to fetch all words');
            return response.json();
          })
          .then(allWords => {
            const filteredWords = allWords.filter((word: Word) => assignedWordIds.includes(word.id));
            setWords(filteredWords);
          });
      })
      .catch(err => setError(err.message));
  }, [studentId]);

  const handleProgress = async (level: string) => {
    if (!studentId || !words[currentWordIndex]) return;

    const wordId = words[currentWordIndex].id;

    try {
      const response = await fetch('http://localhost:4001/progress', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ studentId: parseInt(studentId), wordId, level }),
      });

      if (!response.ok) {
        throw new Error('Failed to record progress');
      }

      // Move to next word or end session
      if (currentWordIndex < words.length - 1) {
        setCurrentWordIndex(currentWordIndex + 1);
      } else {
        alert('Session complete!');
        navigate('/parent'); // Go back to parent dashboard
      }
    } catch (err: any) {
      setError(err.message);
    }
  };

  if (error) return <p style={{color: 'red'}}>Error: {error}</p>;
  if (words.length === 0) return <p>Loading flashcards...</p>;

  const currentWord = words[currentWordIndex];

  return (
    <div style={{fontFamily: 'sans-serif', padding: '2rem', maxWidth: '600px', margin: 'auto'}}>
      <h1>Flashcard Session</h1>
      <p>Word {currentWordIndex + 1} of {words.length}</p>
      <Flashcard word={currentWord} />
      <div style={{marginTop: '2rem', display: 'flex', justifyContent: 'space-around'}}>
        <button onClick={() => handleProgress("Didn't Know")} style={{padding: '0.75rem 1.5rem', backgroundColor: '#dc3545', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer'}}>Didn't Know</button>
        <button onClick={() => handleProgress('Practicing')} style={{padding: '0.75rem 1.5rem', backgroundColor: '#ffc107', color: 'black', border: 'none', borderRadius: '4px', cursor: 'pointer'}}>Practicing</button>
        <button onClick={() => handleProgress('Mastered')} style={{padding: '0.75rem 1.5rem', backgroundColor: '#28a745', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer'}}>Mastered</button>
      </div>
    </div>
  );
};

export default FlashcardSession;
