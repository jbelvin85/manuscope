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

const ReviewSession: React.FC = () => {
  const { studentId } = useParams<{ studentId: string }>();
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
        const [studentRes, wordsRes, assignedRes, progressRes] = await Promise.all([
            fetch(`${import.meta.env.VITE_API_BASE_URL}/students/${studentId}`),
            fetch(`${import.meta.env.VITE_API_BASE_URL}/words`),
            fetch(`${import.meta.env.VITE_API_BASE_URL}/students/${studentId}/words`),
            fetch(`${import.meta.env.VITE_API_BASE_URL}/students/${studentId}/progress`)
        ]);

        if (!studentRes.ok) throw new Error('Failed to fetch student details');
        if (!wordsRes.ok) throw new Error('Failed to fetch all words');
        if (!assignedRes.ok) throw new Error('Failed to fetch assigned words');
        if (!progressRes.ok) throw new Error('Failed to fetch progress');

        const studentData: Student = await studentRes.json();
        const allWords: Word[] = await wordsRes.json();
        const assignedWordIds: string[] = await assignedRes.json();
        const progressData: ProgressData = await progressRes.json(); // Changed type

        setStudent(studentData);

        const progressMap: Record<string, Level> = {};
        const forReviewMap: Record<string, boolean> = {};

        for (const wordId in progressData) {
            progressMap[wordId] = progressData[wordId].level;
            forReviewMap[wordId] = progressData[wordId].for_review ?? true;
        }
        setProgress(progressMap);
        setForReviewStatus(forReviewMap); // Store the for_review status

        const reviewWords = allWords.filter(word => 
            assignedWordIds.includes(word.id) && progressMap[word.id] !== 'Spontaneous'
        );

        setWordsToReview(reviewWords);

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
    if (currentWordIndex < wordsToReview.length - 1) {
      setCurrentWordIndex(prevIndex => prevIndex + 1);
    }
  };

  const handlePreviousWord = () => {
    if (currentWordIndex > 0) {
      setCurrentWordIndex(prevIndex => prevIndex - 1);
    }
  };

  const handleSubmit = async () => {
    setError(null);
    setLoading(true);
    try {
      const progressEntries: ProgressSaveEntry[] = Object.entries(progress)
        .map(([wordId, level]) => ({
          wordId: wordId,
          level: level,
          forReview: forReviewStatus[wordId] ?? true, // Use stored status, default to true
        }));

      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/students/${studentId}/baseline-progress`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ progressEntries }),
      });

      if (!response.ok) {
        throw new Error('Failed to save progress');
      }

      alert('Progress saved successfully!');
      navigate(`/student/${studentId}`);
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
    <div style={{ fontFamily: 'sans-serif', padding: '2rem', maxWidth: '800px', margin: '0 auto' }}>
      <h1>Review Session</h1>
      <h2>{student ? `${student.first_name} ${student.last_name}` : 'Loading student...'}</h2>
      <p>Review word {currentWordIndex + 1} of {wordsToReview.length}.</p>

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
        {currentWordIndex < wordsToReview.length - 1 ? (
          <button onClick={handleNextWord} disabled={loading}>
            Next
          </button>
        ) : (
          <button onClick={handleSubmit} disabled={loading}>
            {loading ? 'Saving...' : 'Finish & Save Progress'}
          </button>
        )}
      </div>
    </div>
  );
};

export default ReviewSession;