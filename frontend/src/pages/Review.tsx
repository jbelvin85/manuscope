import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../contexts/AuthContext';
import ReviewSession from './ReviewSession';
import { useLayout } from '../components/Layout';
import { useLocation } from 'react-router-dom';
import { Level, levelOrder } from '../constants';

interface Word {
  id: string;
  category: string;
  word: string;
  image_link?: string;
  video_link?: string;
}

interface WordProgressEntry {
  level: string;
  notes?: string;
  for_review?: boolean;
}

interface StudentProgressData {
  [wordId: string]: WordProgressEntry;
}

interface ReviewWord extends Word {
  progress: WordProgressEntry;
}

const Review: React.FC = () => {
  const { userRole } = useAuth();
  const { setReviewSessionActive } = useLayout();
  const location = useLocation();
  const { student: dashboardStudent, wordsToReview: dashboardWordsToReview } = location.state || {};

  const [error, setError] = useState<string | null>(null);
  const [selectedStudent, setSelectedStudent] = useState<any | null>(dashboardStudent);
  const [wordsToReview, setWordsToReview] = useState<ReviewWord[]>(dashboardWordsToReview || []);
  const [isReviewSessionActive, setIsReviewSessionActive] = useState<boolean>(false);
  const [reviewType, setReviewType] = useState<'dashboard-settings' | 'all-words' | null>(
    dashboardStudent && dashboardWordsToReview ? 'dashboard-settings' : null
  );
  const [allWordsReviewSortConfig, setAllWordsReviewSortConfig] = useState<'word' | 'category' | 'level' | 'random'>('word');
  const [allAvailableWords, setAllAvailableWords] = useState<Word[]>([]);

  // Fetch all words if reviewType is 'all-words'
  useEffect(() => {
    const fetchAllWords = async () => {
      if (reviewType === 'all-words') {
        try {
          const token = localStorage.getItem('token');
          if (!token) {
            setError('Authentication token not found.');
            return;
          }
          const wordsResponse = await fetch(`${import.meta.env.VITE_API_BASE_URL}/words`, {
            headers: { 'Authorization': `Bearer ${token}` },
            cache: 'no-store'
          });
          if (!wordsResponse.ok) throw new Error('Failed to fetch all words.');
          const wordsData: Word[] = await wordsResponse.json();
          setAllAvailableWords(wordsData);
        } catch (err: any) {
          setError(err.message);
        }
      }
    };
    fetchAllWords();
  }, [reviewType]);

  const sortedAllAvailableWords = useMemo(() => {
    let sorted = [...allAvailableWords];
    if (allWordsReviewSortConfig === 'word') {
      sorted.sort((a, b) => a.word.localeCompare(b.word));
    } else if (allWordsReviewSortConfig === 'category') {
      sorted.sort((a, b) => a.category.localeCompare(b.category));
    } else if (allWordsReviewSortConfig === 'level') {
      // This needs student progress data to sort by level, which we don't have for all words here.
      // For now, we'll just sort alphabetically if level is chosen for all words review.
      sorted.sort((a, b) => a.word.localeCompare(b.word));
    } else if (allWordsReviewSortConfig === 'random') {
      sorted = sorted.sort(() => Math.random() - 0.5);
    }
    return sorted;
  }, [allAvailableWords, allWordsReviewSortConfig]);

  const handleStartSession = (words: ReviewWord[] | Word[], studentId: string) => {
    if (words.length === 0) {
      alert('No words to review.');
      return;
    }
    setWordsToReview(words as ReviewWord[]); // Cast to ReviewWord[] for consistency
    setSelectedStudent({ id: studentId }); // Set selected student for ReviewSession
    setIsReviewSessionActive(true);
    setReviewSessionActive(true); // Notify LayoutProvider
  };

  const handleSessionEnd = () => {
    setIsReviewSessionActive(false);
    setReviewSessionActive(false); // Notify LayoutProvider
    // Optionally, navigate back to dashboard or show a summary
    // navigate('/parent');
  };

  if (userRole !== 'parent') {
    return <p style={{ color: 'red' }}>Access Denied: This page is for parents only.</p>;
  }

  if (error) return <p style={{ color: 'red' }}>Error: {error}</p>;

  if (isReviewSessionActive && selectedStudent) {
    return (
      <ReviewSession
        studentId={selectedStudent.id}
        initialWordIds={wordsToReview.map(word => word.id)}
        onSessionEnd={handleSessionEnd}
      />
    );
  }

  return (
    <div style={{
      fontFamily: 'sans-serif',
      padding: '2rem',
    }}>
      {!reviewType && (
        <div style={{ textAlign: 'center' }}>
          <h2>No review settings provided.</h2>
          <p>Please select a student and words to review from the <Link to="/parent">Dashboard</Link>.</p>
          <button
            onClick={() => setReviewType('all-words')}
            style={{
              marginTop: '1rem',
              padding: '0.75rem 1.5rem',
              fontSize: '1rem',
              backgroundColor: '#007bff',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Review All Words
          </button>
        </div>
      )}

      {reviewType === 'all-words' && (
        <div style={{ textAlign: 'center' }}>
          <h2>Review All Words</h2>
          <p>Select a sorting order:</p>
          <div style={{ marginBottom: '1rem' }}>
            <button onClick={() => setAllWordsReviewSortConfig('word')} style={{ marginRight: '0.5rem' }}>A-Z</button>
            <button onClick={() => setAllWordsReviewSortConfig('category')} style={{ marginRight: '0.5rem' }}>Category</button>
            <button onClick={() => setAllWordsReviewSortConfig('random')} style={{ marginRight: '0.5rem' }}>Random</button>
            {/* Level sorting for all words is complex without student progress, so omitting for now */}
          </div>
          {allAvailableWords.length > 0 && (
            <button
              onClick={() => handleStartSession(sortedAllAvailableWords, 'all-words-student-id')} // Placeholder student ID
              style={{
                marginTop: '1rem',
                padding: '0.75rem 1.5rem',
                fontSize: '1rem',
                backgroundColor: '#28a745',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              Start Review All Words Session
            </button>
          )}
          {allAvailableWords.length === 0 && <p>Loading all words...</p>}
        </div>
      )}

      {reviewType === 'dashboard-settings' && selectedStudent && wordsToReview.length > 0 && (
        <div style={{ textAlign: 'center' }}>
          <h2>Review Session for {selectedStudent.first_name} {selectedStudent.last_name}</h2>
          <p>Words to review: {wordsToReview.length}</p>
          <button
            onClick={() => handleStartSession(wordsToReview, selectedStudent.id)}
            style={{
              marginTop: '1rem',
              padding: '0.75rem 1.5rem',
              fontSize: '1rem',
              backgroundColor: '#007bff',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Start Review Session
          </button>
        </div>
      )}

      {reviewType === 'dashboard-settings' && (!selectedStudent || wordsToReview.length === 0) && (
        <div style={{ textAlign: 'center' }}>
          <h2>No words selected for review.</h2>
          <p>Please select a student and words to review from the <Link to="/parent">Dashboard</Link>.</p>
        </div>
      )}
    </div>
  );
};

export default Review;