import React, { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import StudentSelectorHeader from '../components/StudentSelectorHeader';
import { Level, levelOrder } from '../constants';

interface Word {
  id: string;
  category: string;
  word: string;
}

interface ProgressSummary {
  totalWords: number;
  levels: { [level: string]: number };
  forReview: number;
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

const ParentDashboard: React.FC = () => {
  const { students, userRole } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const [selectedStudent, setSelectedStudent] = useState<any | null>(null);
  const [progressSummary, setProgressSummary] = useState<ProgressSummary | null>(null);
  const [allWords, setAllWords] = useState<Word[]>([]);
  const [studentProgress, setStudentProgress] = useState<StudentProgressData | null>(null);
  const [reviewWords, setReviewWords] = useState<ReviewWord[]>([]);
  const [reviewSortConfig, setReviewSortConfig] = useState<'word' | 'category' | 'level'>('word');

  useEffect(() => {
    if (students && students.length > 0 && !selectedStudent) {
      setSelectedStudent(students[0]);
    }
  }, [students, selectedStudent]);

  useEffect(() => {
    const fetchData = async () => {
      if (selectedStudent) {
        try {
          const token = localStorage.getItem('token');
          if (!token) {
            setError('Authentication token not found.');
            return;
          }

          const headers = { 'Authorization': `Bearer ${token}` };

          // Fetch all words
          const allWordsResponse = await fetch(`${import.meta.env.VITE_API_BASE_URL}/words`, { headers, cache: 'no-store' });
          if (!allWordsResponse.ok) throw new Error('Failed to fetch all words');
          const allWordsData: Word[] = await allWordsResponse.json();
          setAllWords(allWordsData);

          // Fetch student progress
          const progressResponse = await fetch(`${import.meta.env.VITE_API_BASE_URL}/students/${selectedStudent.id}/progress`, { headers, cache: 'no-store' });
          if (!progressResponse.ok) throw new Error('Failed to fetch student progress');
          const progressData: StudentProgressData = await progressResponse.json();
          setStudentProgress(progressData);

          // Determine review words
          const wordsForReview: ReviewWord[] = [];
          for (const wordId in progressData) {
            const progressEntry = progressData[wordId];
            if (progressEntry.for_review) {
              const wordDetails = allWordsData.find(word => word.id === wordId);
              if (wordDetails) {
                wordsForReview.push({ ...wordDetails, progress: progressEntry });
              }
            }
          }
          setReviewWords(wordsForReview);

          // Fetch progress summary
          const summaryResponse = await fetch(`${import.meta.env.VITE_API_BASE_URL}/students/${selectedStudent.id}/progress-summary`, { headers, cache: 'no-store' });
          if (!summaryResponse.ok) throw new Error('Failed to fetch progress summary');
          const summaryData: ProgressSummary = await summaryResponse.json();
          setProgressSummary(summaryData);

        } catch (err: any) {
          setError(err.message);
        }
      }
    };

    fetchData();
  }, [selectedStudent]);

  const handleStudentChange = (student: any | null) => {
    setSelectedStudent(student);
  };

  const sortedReviewWords = useMemo(() => {
    const sorted = [...reviewWords].sort((a, b) => {
      if (reviewSortConfig === 'word') {
        return a.word.localeCompare(b.word);
      } else if (reviewSortConfig === 'category') {
        return a.category.localeCompare(b.category);
      } else if (reviewSortConfig === 'level') {
        return levelOrder.indexOf(a.progress.level) - levelOrder.indexOf(b.progress.level);
      }
      return 0;
    });
    return sorted;
  }, [reviewWords, reviewSortConfig]);

  const handleStartReviewSession = () => {
    if (selectedStudent && sortedReviewWords.length > 0) {
      // Pass selected student and words to review to the Review page
      navigate('/review', { state: { student: selectedStudent, wordsToReview: sortedReviewWords } });
    } else {
      alert('Please select a student and ensure there are words marked for review.');
    }
  };

  if (userRole !== 'parent') {
    return <p style={{ color: 'red' }}>Access Denied: This page is for parents only.</p>;
  }

  if (error) return <p style={{ color: 'red' }}>Error: {error}</p>;
  if (!students) return <p>Loading students...</p>;

  if (students.length === 0) {
    return (
      <div style={{ fontFamily: 'sans-serif', padding: '2rem' }}>
        <h1>Parent Dashboard</h1>
        <p>No students are associated with your account. Please ask a teacher to add students and provide you with a claim code, or <Link to="/claim-student">claim a student</Link> if you have a code.</p>
      </div>
    );
  }

  const wordsInProgress = progressSummary ? progressSummary.totalWords - (progressSummary.levels['Spontaneous'] || 0) : 0;

  return (
    <div style={{ fontFamily: 'sans-serif', padding: '2rem' }}>
      <StudentSelectorHeader
        students={students}
        selectedStudent={selectedStudent}
        onStudentChange={handleStudentChange}
      />

      {selectedStudent && (
        <main style={{padding: '2rem'}}>
          <h2>{selectedStudent.first_name} {selectedStudent.last_name}'s Learning Journey</h2>
          <div style={{
            border: '1px solid #e0e0e0',
            borderRadius: '8px',
            padding: '1.5rem',
            marginBottom: '2rem',
            backgroundColor: '#f9f9f9'
          }}>
            <h3 style={{ marginTop: 0 }}>Progress Summary:</h3>
            {progressSummary ? (
              <>
                <p>Words mastered: <span style={{ fontWeight: 'bold' }}>{progressSummary.levels['Spontaneous'] || 0}</span></p>
                <p>Words in progress: <span style={{ fontWeight: 'bold' }}>{wordsInProgress}</span></p>
                <p>Words to review: <span style={{ fontWeight: 'bold' }}>{progressSummary.forReview || 0}</span></p>
              </>
            ) : (
              <p>Loading progress...</p>
            )}
            <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
              <Link to={`/student-profile/${selectedStudent.id}`} style={{ textDecoration: 'none' }}>
                <button style={{
                  padding: '0.75rem 1.5rem',
                  fontSize: '1rem',
                  backgroundColor: '#007bff',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer'
                }}>
                  View Full Profile
                </button>
              </Link>
              <Link to={`/progress-reports/${selectedStudent.id}`} style={{ textDecoration: 'none' }}>
                <button style={{
                  padding: '0.75rem 1.5rem',
                  fontSize: '1rem',
                  backgroundColor: '#6c757d',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer'
                }}>
                  View Progress Report
                </button>
              </Link>
            </div>
          </div>

          {/* Words for Review Section */}
          <div style={{ marginBottom: '2rem', padding: '1rem', border: '1px solid #eee', borderRadius: '8px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <h2 style={{ margin: 0 }}>Words for Review ({sortedReviewWords.length})</h2>
                <div>
                  <span style={{ fontSize: '0.8rem', fontWeight: 'bold', marginRight: '0.5rem' }}>Sort by:</span>
                  <button onClick={() => setReviewSortConfig('word')} style={{ fontSize: '0.8rem', fontWeight: reviewSortConfig === 'word' ? 'bold' : 'normal' }}>A-Z</button>
                  <button onClick={() => setReviewSortConfig('level')} style={{ fontSize: '0.8rem', marginLeft: '0.5rem', fontWeight: reviewSortConfig === 'level' ? 'bold' : 'normal' }}>Level</button>
                  <button onClick={() => setReviewSortConfig('category')} style={{ fontSize: '0.8rem', marginLeft: '0.5rem', fontWeight: reviewSortConfig === 'category' ? 'bold' : 'normal' }}>Category</button>
                </div>
              </div>
              {sortedReviewWords.length > 0 && (
                <button onClick={handleStartReviewSession} style={{ padding: '0.5rem 1rem', backgroundColor: '#28a745', color: 'white', borderRadius: '5px', border: 'none', cursor: 'pointer' }}>
                  Start Review
                </button>
              )}
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
              {sortedReviewWords.length > 0 ? sortedReviewWords.map(word => (
                <div key={word.id} style={{
                  padding: '0.25rem 0.5rem',
                  borderRadius: '5px',
                  backgroundColor: '#e0e0e0',
                  display: 'inline-block',
                  marginBottom: '0.25rem',
                }}>
                  <span>{word.word}</span>
                </div>
              )) : <p>No words are currently marked for review.</p>}
            </div>
          </div>
        </main>
      )}
    </div>
  );
};

export default ParentDashboard;