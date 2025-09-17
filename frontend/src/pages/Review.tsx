import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../contexts/AuthContext';
import ReviewSession from './ReviewSession';
import { useLayout } from '../components/Layout';
import { useLocation, Link } from 'react-router-dom';

// Interfaces
interface Student {
  id: string;
  first_name: string;
  last_name: string;
}

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

interface ReviewWord extends Word {
  progress: WordProgressEntry;
}

const Review: React.FC = () => {
  const { userRole } = useAuth();
  const { setReviewSessionActive } = useLayout();
  const location = useLocation();
  const { student: dashboardStudent, wordsToReview: dashboardWordsToReview } = location.state || {};

  const [error, setError] = useState<string | null>(null);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(dashboardStudent);
  const [wordsToReview, setWordsToReview] = useState<ReviewWord[]>(dashboardWordsToReview || []);
  const [isReviewSessionActive, setIsReviewSessionActive] = useState<boolean>(false);

  const handleStartSession = (words: ReviewWord[], studentId: string) => {
    if (words.length === 0) {
      alert('No words to review.');
      return;
    }
    setWordsToReview(words);
    setSelectedStudent(dashboardStudent);
    setIsReviewSessionActive(true);
    setReviewSessionActive(true);
  };

  const handleSessionEnd = () => {
    setIsReviewSessionActive(false);
    setReviewSessionActive(false);
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
      textAlign: 'center',
    }}>
      {selectedStudent && wordsToReview.length > 0 ? (
        <>
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
        </>
      ) : (
        <>
          <h2>No words selected for review.</h2>
          <p>Please select a student and words to review from the <Link to="/parent">Dashboard</Link>.</p>
        </>
      )}
    </div>
  );
};

export default Review;