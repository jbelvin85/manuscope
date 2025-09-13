import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Flashcard from '../components/Flashcard'; // Import the new Flashcard component

interface Word {
  id: string; // Changed to string for UUID
  word: string;
  category: string;
  level?: string; // Optional, as it might not always be set
  image_link?: string;
  video_link?: string;
  custom_image_boolean?: boolean;
  custom_image_link?: string;
}

type Level = 'Input' | 'Comprehension' | 'Imitation' | 'Prompted' | 'Spontaneous' | '';

interface ProgressEntry {
  wordId: string; // Changed to string for UUID
  level: Level;
}

const StudentOnboarding: React.FC = () => {
  const { studentId } = useParams<{ studentId: string }>();
  const navigate = useNavigate();
  const [first100Words, setFirst100Words] = useState<Word[]>([]);
  const [currentWordIndex, setCurrentWordIndex] = useState<number>(0); // New state for current word index
  const [progress, setProgress] = useState<Record<string, Level>>({}); // Key is now string (UUID)
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const levels: Level[] = ['Input', 'Comprehension', 'Imitation', 'Prompted', 'Spontaneous'];

  useEffect(() => {
    const fetchWords = async () => {
      try {
        const response = await fetch('http://localhost:4001/words/first100');
        if (!response.ok) {
          throw new Error('Failed to fetch first 100 words');
        }
        const data: Word[] = await response.json();
        setFirst100Words(data);

        // Initialize progress with empty levels
        const initialProgress: Record<string, Level> = {};
        data.forEach(word => {
          initialProgress[word.id] = '';
        });
        setProgress(initialProgress);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchWords();
  }, []);

  const handleLevelChange = (wordId: string, level: Level) => {
    setProgress(prevProgress => ({
      ...prevProgress,
      [wordId]: level,
    }));
  };

  const handleNextWord = () => {
    if (currentWordIndex < first100Words.length - 1) {
      setCurrentWordIndex(prevIndex => prevIndex + 1);
    }
  };

  const handlePreviousWord = () => {
    if (currentWordIndex > 0) {
      setCurrentWordIndex(prevIndex => prevIndex - 1);
    }
  };

  const handleSubmitBaseline = async () => {
    setError(null);
    setLoading(true);
    try {
      const progressEntries: ProgressEntry[] = Object.entries(progress)
        .filter(([, level]) => level !== '') // Only send words with a selected level
        .map(([wordId, level]) => ({
          wordId: wordId, // wordId is already string (UUID)
          level: level,
        }));

      if (progressEntries.length === 0) {
        alert('Please select at least one level before saving.');
        setLoading(false);
        return;
      }

      const response = await fetch(`http://localhost:4001/students/${studentId}/baseline-progress`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ progressEntries }),
      });

      if (!response.ok) {
        throw new Error('Failed to save baseline progress');
      }

      alert('Baseline progress saved successfully!');
      navigate(`/student/${studentId}`); // Navigate back to student profile
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <p>Loading onboarding words...</p>;
  if (error) return <p style={{ color: 'red' }}>Error: {error}</p>;

  const currentWord = first100Words[currentWordIndex];

  return (
    <div style={{ fontFamily: 'sans-serif', padding: '2rem', maxWidth: '800px', margin: '0 auto' }}>
      <h1>Student Onboarding - Baseline Assessment</h1>
      <h2>Student ID: {studentId}</h2>
      <p>Review word {currentWordIndex + 1} of {first100Words.length}.</p>

      {currentWord && (
        <Flashcard
          word={currentWord}
          currentLevel={progress[currentWord.id] || ''}
          onLevelChange={handleLevelChange}
          levels={levels}
        />
      )}

      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1.5rem' }}>
        <button onClick={handlePreviousWord} disabled={currentWordIndex === 0 || loading}>
          Previous
        </button>
        {currentWordIndex < first100Words.length - 1 ? (
          <button onClick={handleNextWord} disabled={loading}>
            Next
          </button>
        ) : (
          <button onClick={handleSubmitBaseline} disabled={loading || Object.values(progress).filter(level => level !== '').length === 0}>
            {loading ? 'Saving...' : 'Submit Baseline'}
          </button>
        )}
      </div>
    </div>
  );
};

export default StudentOnboarding;
