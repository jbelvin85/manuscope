import React, { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import StudentSelectorHeader from '../components/StudentSelectorHeader';
import { Level, levelOrder, levelColors } from '../constants'; // Import levelColors

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
        // Ensure progress and level are defined before accessing
        const levelA = a.progress?.level || '';
        const levelB = b.progress?.level || '';
        return levelOrder.indexOf(levelA) - levelOrder.indexOf(levelB);
      }
      return 0;
    });
    return sorted;
  }, [reviewWords, reviewSortConfig]);

  const handleStartReviewSession = () => {
    if (selectedStudent && sortedReviewWords.length > 0) {
      // Pass selected student and words to review to the Review page
      navigate(`/student/${selectedStudent.id}/review`, { state: { wordsToReview: sortedReviewWords } });
    } else {
      alert('Please select a student and ensure there are words marked for review.');
    }
  };

  // Utility function for contrasting text color
  const getContrastingTextColor = (hexColor: string) => {
    if (hexColor.startsWith('#')) {
      hexColor = hexColor.slice(1);
    }
    const r = parseInt(hexColor.substring(0, 2), 16);
    const g = parseInt(hexColor.substring(2, 4), 16);
    const b = parseInt(hexColor.substring(4, 6), 16);
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    return luminance > 0.5 ? 'black' : 'white';
  };

  // Function to get word style based on progress level
  const getWordStyle = (wordId: string) => {
    const level = studentProgress?.[wordId]?.level || ''; // Use optional chaining and default to empty string
    const backgroundColor = levelColors[level] || '#e0e0e0'; // Default color if level not found
    return {
      padding: '0.25rem 0.5rem',
      borderRadius: '5px',
      backgroundColor,
      display: 'inline-block',
      marginBottom: '0.25rem',
      color: getContrastingTextColor(backgroundColor),
    };
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
          </div>

          {/* Words for Review Section */}
          <div style={{ marginBottom: '2rem', padding: '1rem', border: '1px solid #eee', borderRadius: '8px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}> {/* Adjusted margin-bottom */}
              <h2 style={{ margin: 0 }}>Words for Review ({sortedReviewWords.length})</h2>
              {sortedReviewWords.length > 0 && (
                <button onClick={handleStartReviewSession} style={{ padding: '0.5rem 1rem', backgroundColor: '#28a745', color: 'white', borderRadius: '5px', border: 'none', cursor: 'pointer' }}>
                  Start Review
                </button>
              )}
            </div>
            {/* Sort by controls */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}> {/* New div for sort controls */}
              <span style={{ fontSize: '0.8rem', fontWeight: 'bold' }}>Sort by:</span>
              <button onClick={() => setReviewSortConfig('word')} style={{ fontSize: '0.8rem', fontWeight: reviewSortConfig === 'word' ? 'bold' : 'normal' }}>A-Z</button>
              <button onClick={() => setReviewSortConfig('level')} style={{ fontSize: '0.8rem', marginLeft: '0.5rem', fontWeight: reviewSortConfig === 'level' ? 'bold' : 'normal' }}>Level</button>
              <button onClick={() => setReviewSortConfig('category')} style={{ fontSize: '0.8rem', marginLeft: '0.5rem', fontWeight: reviewSortConfig === 'category' ? 'bold' : 'normal' }}>Category</button>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
              {sortedReviewWords.length > 0 ? sortedReviewWords.map(word => (
                <div key={word.id} style={getWordStyle(word.id)}> {/* Apply getWordStyle */}
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