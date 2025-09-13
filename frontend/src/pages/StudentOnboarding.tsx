import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Flashcard from '../components/Flashcard';

interface Word {
  id: string;
  word: string;
  category: string;
  level?: string;
  image_link?: string;
  video_link?: string;
  custom_image_boolean?: boolean;
  custom_image_link?: string;
}

interface Student {
    id: string;
    first_name: string;
    last_name: string;
}

type Level = 'Input' | 'Comprehension' | 'Imitation' | 'Prompted' | 'Spontaneous' | '';

interface ProgressEntry {
  wordId: string;
  level: Level;
}

const StudentOnboarding: React.FC = () => {
  const { studentId } = useParams<{ studentId: string }>();
  const navigate = useNavigate();
  const [student, setStudent] = useState<Student | null>(null);
  const [first100Words, setFirst100Words] = useState<Word[]>([]);
  const [currentWordIndex, setCurrentWordIndex] = useState<number>(0);
  const [progress, setProgress] = useState<Record<string, Level>>({});
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const levels: Level[] = ['Input', 'Comprehension', 'Imitation', 'Prompted', 'Spontaneous'];

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [wordsResponse, studentResponse] = await Promise.all([
          fetch(`${import.meta.env.VITE_API_BASE_URL}/words/first100`),
          fetch(`${import.meta.env.VITE_API_BASE_URL}/students/${studentId}`)
        ]);

        if (!wordsResponse.ok) {
          throw new Error('Failed to fetch first 100 words');
        }
        if (!studentResponse.ok) {
            throw new Error('Failed to fetch student data');
        }

        const wordsData: Word[] = await wordsResponse.json();
        const studentData: Student = await studentResponse.json();
        
        setFirst100Words(wordsData);
        setStudent(studentData);

        const initialProgress: Record<string, Level> = {};
        wordsData.forEach(word => {
          initialProgress[word.id] = 'Input';
        });
        setProgress(initialProgress);

      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [studentId]);

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
        .filter(([, level]) => level !== '')
        .map(([wordId, level]) => ({
          wordId: wordId,
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
      navigate(`/student/${studentId}`);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <p>Loading onboarding session...</p>;
  if (error) return <p style={{ color: 'red' }}>Error: {error}</p>;

  const currentWord = first100Words[currentWordIndex];

  return (
    <div style={{ fontFamily: 'sans-serif', padding: '2rem', maxWidth: '800px', margin: '0 auto' }}>
      <h1>Student Onboarding - Baseline Assessment</h1>
      <h2>{student ? `${student.first_name} ${student.last_name}` : 'Loading student...'}</h2>
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