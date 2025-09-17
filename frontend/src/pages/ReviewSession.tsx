import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Flashcard from '../components/Flashcard';
import { Level } from '../constants';

interface Word {
  id: string;
  word: string;
  category: string;
  level?: string;
  image_link?: string;
  video_link?: string;
}

interface Student {
    id: string;
    first_name: string;
    last_name: string;
}

interface ProgressEntry {
  level: Level;
  notes?: string;
  for_review?: boolean;
}

interface ProgressData { [word_id: string]: ProgressEntry; }

interface ProgressSaveEntry {
  wordId: string;
  level: Level;
  forReview?: boolean;
}

interface ReviewSessionProps {
  studentId: string;
  initialWordIds?: string[]; // New optional prop
  onSessionEnd?: () => void; // Callback for when the session ends
}

const ReviewSession: React.FC<ReviewSessionProps> = ({ studentId, initialWordIds, onSessionEnd }) => {
  const navigate = useNavigate();
  const [student, setStudent] = useState<Student | null>(null);
  const [wordsToReview, setWordsToReview] = useState<Word[]>([]);
  const [currentWordIndex, setCurrentWordIndex] = useState<number>(0);
  const [progress, setProgress] = useState<Record<string, Level>>({});
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [forReviewStatus, setForReviewStatus] = useState<Record<string, boolean>>({});

  const levels: Level[] = ['Input', 'Comprehension', 'Imitation', 'Prompted', 'Spontaneous'];

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          setError('Authentication token not found.');
          setLoading(false);
          return;
        }

        const [studentRes, wordsRes, progressRes] = await Promise.all([
            fetch(`${import.meta.env.VITE_API_BASE_URL}/students/${studentId}`, { headers: { 'Authorization': `Bearer ${token}` } }),
            fetch(`${import.meta.env.VITE_API_BASE_URL}/words`, { headers: { 'Authorization': `Bearer ${token}` } }),
            fetch(`${import.meta.env.VITE_API_BASE_URL}/students/${studentId}/progress`, { headers: { 'Authorization': `Bearer ${token}` } })
        ]);

        if (!studentRes.ok) throw new Error('Failed to fetch student details');
        if (!wordsRes.ok) throw new Error('Failed to fetch all words');
        if (!progressRes.ok) throw new Error('Failed to fetch progress');

        const studentData: Student = await studentRes.json();
        const allWords: Word[] = await wordsRes.json();
        const progressData: ProgressData = await progressRes.json();

        setStudent(studentData);

        const progressMap: Record<string, Level> = {};
        const forReviewMap: Record<string, boolean> = {};

        for (const wordId in progressData) {
            progressMap[wordId] = progressData[wordId].level;
            forReviewMap[wordId] = progressData[wordId].for_review ?? true;
        }
        setProgress(progressMap);
        setForReviewStatus(forReviewMap);

        let wordsForSession: Word[] = [];
        if (initialWordIds && initialWordIds.length > 0) {
          // Use provided word IDs
          wordsForSession = allWords.filter(word => initialWordIds.includes(word.id));
        } else {
          // Fallback to fetching all assigned words and filtering (original logic)
          const assignedRes = await fetch(`${import.meta.env.VITE_API_BASE_URL}/students/${studentId}/words`, { headers: { 'Authorization': `Bearer ${token}` } });
          if (!assignedRes.ok) throw new Error('Failed to fetch assigned words');
          const assignedWordIds: string[] = await assignedRes.json();
          wordsForSession = allWords.filter(word => 
              assignedWordIds.includes(word.id) && progressMap[word.id] !== 'Spontaneous'
          );
        }

        setWordsToReview(wordsForSession);

      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [studentId, initialWordIds]);

  const handleLevelChange = (wordId: string, level: Level) => {
    setProgress(prevProgress => ({
      ...prevProgress,
      [wordId]: level,
    }));
  };

  const handleNextWord = () => {
    if (currentWordIndex < wordsToReview.length - 1) {
      setCurrentWordIndex(prevIndex => prevIndex + 1);
    }
  };

  const handlePreviousWord = () => {
    if (currentWordIndex > 0) {
      setCurrentWordIndex(prevIndex => prevIndex - 1);
    };
  };

  const handleSubmit = async () => {
    setError(null);
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Authentication token not found. Please log in again.');
        setLoading(false);
        return;
      }

      const progressEntries: ProgressSaveEntry[] = Object.entries(progress)
        .map(([wordId, level]) => ({
          wordId: wordId,
          level: level,
          forReview: forReviewStatus[wordId] ?? true,
        }));

      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/students/${studentId}/baseline-progress`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ progressEntries }),
      });

      if (!response.ok) {
        throw new Error('Failed to save progress');
      }

      alert('Progress saved successfully!');
      if (onSessionEnd) {
        onSessionEnd();
      } else {
        navigate(`/student/${studentId}`);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <p>Loading review session...</p>;
  if (error) return <p style={{ color: 'red' }}>Error: {error}</p>;
  if (wordsToReview.length === 0) return <p>No assigned words are available for review (all are at 'Spontaneous' level or none are assigned).</p>;

  const currentWord = wordsToReview[currentWordIndex];

  return (
    <div style={{
      fontFamily: 'sans-serif',
      padding: '1rem',
      margin: '0 auto',
      display: 'flex',
      flexDirection: 'column',
      height: 'calc(100vh - 5rem)', // Adjusted from 60px to 5rem
      justifyContent: 'space-between',
      overflow: 'hidden'
    }}>
      {currentWord && (
        <Flashcard
          word={currentWord}
          currentLevel={progress[currentWord.id] || ''}
          onLevelChange={handleLevelChange}
          levels={levels}
          style={{ flexGrow: 1 }} // Allow Flashcard to take available space
        />
      )}

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.5rem', flexShrink: 0 }}>
        <button onClick={handlePreviousWord} disabled={currentWordIndex === 0 || loading}
          style={{
            padding: '0.5rem 1rem',
            fontSize: '0.8rem',
            backgroundColor: '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
          }}>
          Previous
        </button>

        <div style={{ textAlign: 'center', flexGrow: 1, fontSize: '0.8rem' }}>
          Review word {currentWordIndex + 1} of {wordsToReview.length}.
        </div>

        {currentWordIndex < wordsToReview.length - 1 ? (
          <button onClick={handleNextWord} disabled={loading}
            style={{
              padding: '0.5rem 1rem',
              fontSize: '0.8rem',
              backgroundColor: '#007bff',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
            }}>
            Next
          </button>
        ) : (
          <button onClick={handleSubmit} disabled={loading}
            style={{
              padding: '0.5rem 1rem',
              fontSize: '0.8rem',
              backgroundColor: '#28a745',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
            }}>
            {loading ? 'Saving...' : 'Finish & Save Progress'}
          </button>
        )}
      </div>
    </div>
  );
};

export default ReviewSession;
