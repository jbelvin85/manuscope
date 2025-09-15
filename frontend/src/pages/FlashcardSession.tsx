import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Flashcard from '../components/Flashcard'; // Import the shared Flashcard component
import { Level, levelOrder } from '../constants';

interface Word {
  id: string;
  category: string;
  word: string;
  image_link?: string;
  video_link?: string;
}

interface ProgressEntry {
  level: Level;
  notes?: string;
  for_review?: boolean;
}

interface ProgressData { [word_id: string]: ProgressEntry; }

const FlashcardSession: React.FC = () => {
  const { studentId } = useParams<{ studentId: string }>();
  const navigate = useNavigate();
  const [words, setWords] = useState<Word[]>([]);
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [progress, setProgress] = useState<Record<string, Level>>({}); // To store current session progress
  const [error, setError] = useState<string | null>(null);

  const levels: Level[] = levelOrder.filter(l => l !== ''); // All valid levels

  useEffect(() => {
    if (!studentId) {
      setError('Student ID is missing.');
      return;
    }

    // Fetch assigned words and all words
    Promise.all([
      fetch(`${import.meta.env.VITE_API_BASE_URL}/students/${studentId}/words`),
      fetch(`${import.meta.env.VITE_API_BASE_URL}/words`)
    ])
      .then(async ([assignedRes, allWordsRes]) => {
        if (!assignedRes.ok) throw new Error('Failed to fetch assigned words');
        if (!allWordsRes.ok) throw new Error('Failed to fetch all words');

        const assignedWordIds: string[] = await assignedRes.json();
        const allWords: Word[] = await allWordsRes.json();

        const filteredWords = allWords.filter(word => assignedWordIds.includes(word.id));

        if (filteredWords.length === 0) {
          setError('No words assigned to this student.');
          return;
        }
        setWords(filteredWords);

        // Fetch existing progress to pre-fill levels
        const existingProgressRes = await fetch(`${import.meta.env.VITE_API_BASE_URL}/students/${studentId}/progress`);
        if (!existingProgressRes.ok) throw new Error('Failed to fetch existing progress');
        const existingProgressData: ProgressData = await existingProgressRes.json(); // Changed type
        
        const initialProgressMap: Record<string, Level> = {};
        for (const wordId in existingProgressData) {
            initialProgressMap[wordId] = existingProgressData[wordId].level;
        }
        setProgress(initialProgressMap);

      })
      .catch(err => setError(err.message));
  }, [studentId]);

  const handleLevelChange = (wordId: string, level: Level) => {
    setProgress(prevProgress => ({
      ...prevProgress,
      [wordId]: level,
    }));
  };

  const handleNextWord = () => {
    if (currentWordIndex < words.length - 1) {
      setCurrentWordIndex(currentWordIndex + 1);
    } else {
      // End of session, save all progress
      handleSubmitProgress();
    }
  };

  const handlePreviousWord = () => {
    if (currentWordIndex > 0) {
      setCurrentWordIndex(currentWordIndex - 1);
    }
  };

  const handleSubmitProgress = async () => {
    if (!studentId) return;

    const progressEntries = Object.entries(progress).map(([wordId, level]) => ({
      wordId,
      level,
    }));

    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/students/${studentId}/baseline-progress`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ progressEntries }),
      });

      if (!response.ok) {
        throw new Error('Failed to record progress');
      }

      alert('Session complete! Progress recorded.');
      navigate(`/student/${studentId}`); // Go back to student profile
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
      <Flashcard 
        word={currentWord} 
        currentLevel={progress[currentWord.id] || ''} 
        onLevelChange={handleLevelChange} 
        levels={levels} 
      />
      <div style={{marginTop: '2rem', display: 'flex', justifyContent: 'space-between'}}>
        <button onClick={handlePreviousWord} disabled={currentWordIndex === 0}>Previous</button>
        {currentWordIndex < words.length - 1 ? (
          <button onClick={handleNextWord}>Next</button>
        ) : (
          <button onClick={handleSubmitProgress}>Finish Session</button>
        )}
      </div>
    </div>
  );
};

export default FlashcardSession;
