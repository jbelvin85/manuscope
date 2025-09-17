import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Level, levelColors, levelOrder } from '../constants';
import ReviewWordModal from '../components/ReviewWordModal';
import EditNotesModal from '../components/EditNotesModal';
import FlashcardReviewModal from '../components/FlashcardReviewModal';
import { PieChart, Pie, Cell, BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

// Interfaces
interface Student { id: string; first_name: string; last_name: string; school?: string; date_of_birth?: string; avatar_url?: string; claim_code?: string; }
interface User { id: number; first_name: string; last_name: string; avatar_url?: string; }
interface Word { id: string; category: string; word: string; word_group?: number; notes?: string; image_link?: string; }
interface ProgressEntry { level: Level; notes?: string; for_review?: boolean; }
interface ProgressData { [word_id: string]: ProgressEntry; }

// New Interfaces for Progress Summary
interface OverallProgress {
  masteredCount: number;
  inProgressCount: number;
  totalWords: number;
}

interface ProgressOverTimeEntry {
  date: string;
  wordsMastered: number;
  wordsMovedUpLevel: number;
}

interface LevelDistributionEntry {
  level: Level;
  count: number;
}

interface CategoryBreakdownEntry {
  category: string;
  masteredCount: number;
  inProgressCount: number;
  totalCount: number;
}

interface ProgressSummary {
  studentId: string;
  overallProgress: OverallProgress;
  progressOverTime: ProgressOverTimeEntry[];
  levelDistribution: LevelDistributionEntry[];
  categoryBreakdown: CategoryBreakdownEntry[];
  lastActivityDate: string;
}

const allLevels = levelOrder.filter(l => l !== '');
const allWordGroups = ['First 100', 'Next 150', 'Next 300', 'Guided Instruction'];

const StudentProfile: React.FC = () => {
  const { studentId } = useParams<{ studentId: string }>();
  const [student, setStudent] = useState<Student | null>(null);
  const [parents, setParents] = useState<User[]>([]);
  const [words, setWords] = useState<Word[]>([]);
  const [progress, setProgress] = useState<Record<string, Level>>({});
  const [collapsedCategories, setCollapsedCategories] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [wordNotes, setWordNotes] = useState<Record<string, string>>({});
  const [wordForReviewStatus, setWordForReviewStatus] = useState<Record<string, boolean>>({});
  const [showEditNotesModal, setShowEditNotesModal] = useState<boolean>(false);
  const [selectedWordForEditNotesModal, setSelectedWordForEditNotesModal] = useState<Word | null>(null);
  const [showReviewLevelModal, setShowReviewLevelModal] = useState<boolean>(false);
  const [selectedWordForReviewLevelModal, setSelectedWordForReviewLevelModal] = useState<Word | null>(null);
  const [showFlashcardReviewModal, setShowFlashcardReviewModal] = useState(false);
  const [sortConfig, setSortConfig] = useState<Record<string, 'word' | 'level'>>({});
  const [reviewSortConfig, setReviewSortConfig] = useState<'word' | 'level' | 'category'>('word');
  const [levelFilter, setLevelFilter] = useState<Record<string, Set<Level>>>({});
  const [groupFilter, setGroupFilter] = useState<Record<string, Set<string>>>({});
  const [levelFilterOpen, setLevelFilterOpen] = useState<Record<string, boolean>>({});
  const [groupFilterOpen, setGroupFilterOpen] = useState<Record<string, boolean>>({});
  const filterControlsRef = useRef<HTMLDivElement>(null);
  const [progressSummary, setProgressSummary] = useState<ProgressSummary | null>(null);
  const [onboarding, setOnboarding] = useState<boolean>(false);

  const groupedWords = useMemo(() => words.reduce((acc, word) => {
    if (!acc[word.category]) acc[word.category] = [];
    acc[word.category].push(word);
    return acc;
  }, {} as Record<string, Word[]>), [words]);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Authentication token not found.');
        setLoading(false);
        return;
      }

      const headers = { 'Authorization': `Bearer ${token}` };

      const [studentRes, wordsRes, progressRes, progressSummaryRes, parentsRes] = await Promise.all([
        fetch(`${import.meta.env.VITE_API_BASE_URL}/students/${studentId}`, { headers, cache: 'no-store' }),
        fetch(`${import.meta.env.VITE_API_BASE_URL}/words`, { headers, cache: 'no-store' }),
        fetch(`${import.meta.env.VITE_API_BASE_URL}/students/${studentId}/progress`, { headers, cache: 'no-store' }),
        fetch(`${import.meta.env.VITE_API_BASE_URL}/students/${studentId}/progress-summary`, { headers, cache: 'no-store' }),
        fetch(`${import.meta.env.VITE_API_BASE_URL}/students/${studentId}/parents`, { headers, cache: 'no-store' })
      ]);

      if (!studentRes.ok) throw new Error('Failed to fetch student details');
      if (!wordsRes.ok) throw new Error('Failed to fetch words');
      if (!progressRes.ok) throw new Error('Failed to fetch progress');
      if (!progressSummaryRes.ok) throw new Error('Failed to fetch progress summary');
      if (!parentsRes.ok) throw new Error('Failed to fetch parents');

      const studentData = await studentRes.json();
      const wordsData = await wordsRes.json();
      const progressData: ProgressData = await progressRes.json();
      const progressSummaryData: ProgressSummary = await progressSummaryRes.json();
      const parentsData = await parentsRes.json();

      setStudent(studentData);
      setWords(wordsData);
      setParents(parentsData);
      setProgressSummary(progressSummaryData);

      const initialWordNotes: Record<string, string> = {};
      const initialWordForReviewStatus: Record<string, boolean> = {};
      const progressMap: Record<string, Level> = {};

      wordsData.forEach((word: Word) => {
        initialWordForReviewStatus[word.id] = true; // Default all words to be checked
        progressMap[word.id] = 'Input';
      });

      for (const wordId in progressData) {
        const p = progressData[wordId];
        if (p.notes) {
          initialWordNotes[wordId] = p.notes;
        }
        initialWordForReviewStatus[wordId] = p.for_review ?? true;
        progressMap[wordId] = p.level;
      }

      setWordNotes(initialWordNotes);
      setWordForReviewStatus(initialWordForReviewStatus);
      setProgress(progressMap);

    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [studentId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    const initialLevelFilters: Record<string, Set<Level>> = {};
    const initialGroupFilters: Record<string, Set<string>> = {};
    Object.keys(groupedWords).forEach(category => {
        initialLevelFilters[category] = new Set(allLevels);
        initialGroupFilters[category] = new Set(['First 100']);
    });
    setLevelFilter(initialLevelFilters);
    setGroupFilter(initialGroupFilters);
  }, [groupedWords]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (filterControlsRef.current && !filterControlsRef.current.contains(event.target as Node)) {
        setLevelFilterOpen({});
        setGroupFilterOpen({});
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const saveWordProgress = async (wordData: { wordId: string, level?: Level, notes?: string, forReview?: boolean }) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('Authentication token not found.');
      const payload = {
        studentId: studentId,
        wordId: wordData.wordId,
        level: wordData.level,
        notes: wordData.notes,
        forReview: wordData.forReview,
      };

      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/progress`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to save changes: ${errorText}`);
      }
    } catch (err: any) {
      setError(err.message);
    }
  };

  const saveBulkWordProgress = async (progressEntries: { wordId: string, level?: Level, notes?: string, forReview?: boolean }[]) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('Authentication token not found.');
      const payload = { progressEntries };

      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/students/${studentId}/baseline-progress`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to save bulk changes: ${errorText}`);
      }
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleOnboard = async () => {
    setOnboarding(true);
    setError(null);
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('Authentication token not found.');

      const wordsRes = await fetch(`${import.meta.env.VITE_API_BASE_URL}/words/first100`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (!wordsRes.ok) throw new Error('Failed to fetch baseline vocabulary.');
      const baselineWords: Word[] = await wordsRes.json();

      const progressEntries = baselineWords.map(word => ({
        wordId: word.id,
        level: 'Input',
        forReview: true,
      }));

      await saveBulkWordProgress(progressEntries);
      await fetchData();

    } catch (err: any) {
      setError(err.message);
    } finally {
      setOnboarding(false);
    }
  };

  const handleToggleForReview = (wordId: string) => {
    const newStatus = !wordForReviewStatus[wordId];
    setWordForReviewStatus(prev => ({ ...prev, [wordId]: newStatus }));
    saveWordProgress({
      wordId: wordId,
      forReview: newStatus,
      level: progress[wordId],
      notes: wordNotes[wordId],
    });
  };

  const toggleCategory = (category: string) => setCollapsedCategories(prev => ({ ...prev, [category]: !prev[category] }));
  const toggleLevelFilterDropdown = (category: string) => { setGroupFilterOpen({}); setLevelFilterOpen(prev => ({ [category]: !prev[category] })); };
  const toggleGroupFilterDropdown = (category: string) => { setLevelFilterOpen({}); setGroupFilterOpen(prev => ({ [category]: !prev[category] })); };
  const handleSortChange = (category: string, key: 'word' | 'level') => setSortConfig(prev => ({ ...prev, [category]: key }));
  const handleGroupFilterChange = (category: string, group: string) => { /* Placeholder */ console.log(category, group); };
  const handleLevelFilterChange = (category: string, level: Level | 'All') => {
    setLevelFilter(prev => {
        const newFilters = { ...prev };
        const currentFilter = new Set(newFilters[category] || []);
        if (level === 'All') {
            if (currentFilter.size === allLevels.length) {
                newFilters[category] = new Set();
            } else {
                newFilters[category] = new Set(allLevels);
            }
        } else {
            if (currentFilter.has(level)) {
                currentFilter.delete(level);
            } else {
                currentFilter.add(level);
            }
            newFilters[category] = new Set(currentFilter);
        }
        return newFilters;
    });
  };

  const handleViewNotes = (wordId: string) => {
    const wordToEdit = words.find(word => word.id === wordId);
    if (wordToEdit) {
      setSelectedWordForEditNotesModal(wordToEdit);
      setShowEditNotesModal(true);
    }
  };

  const handleCloseEditNotesModal = () => {
    setShowEditNotesModal(false);
    setSelectedWordForEditNotesModal(null);
  };

  const handleSaveNotes = (wordId: string, newNotes: string) => {
    setWordNotes(prev => ({ ...prev, [wordId]: newNotes }));
    saveWordProgress({
      wordId: wordId,
      notes: newNotes,
      level: progress[wordId],
      forReview: wordForReviewStatus[wordId],
    });
    handleCloseEditNotesModal();
  };

  const handleReviewWord = (wordId: string) => {
    const wordToReview = words.find(word => word.id === wordId);
    if (wordToReview) {
      setSelectedWordForReviewLevelModal(wordToReview);
      setShowReviewLevelModal(true);
    }
  };

  const handleCloseReviewLevelModal = () => {
    setShowReviewLevelModal(false);
    setSelectedWordForReviewLevelModal(null);
  };

  const handleUpdateLevel = (wordId: string, newLevel: Level) => {
    setProgress(prev => ({ ...prev, [wordId]: newLevel }));
    saveWordProgress({
      wordId: wordId,
      level: newLevel,
      notes: wordNotes[wordId],
      forReview: wordForReviewStatus[wordId],
    });
  };

  const handleBulkForReviewChange = async (category: string, type: 'all' | 'none' | 'not-spontaneous') => {
    const wordsInCategory = groupedWords[category];
    if (!wordsInCategory) return;

    const newStatusUpdates: Record<string, boolean> = {};
    const progressEntriesToSave: { wordId: string, level?: Level, notes?: string, forReview?: boolean }[] = [];

    wordsInCategory.forEach(word => {
      const currentStatus = wordForReviewStatus[word.id];
      let newCalculatedStatus: boolean;

      if (type === 'all') {
        newCalculatedStatus = true;
      } else if (type === 'none') {
        newCalculatedStatus = false;
      } else if (type === 'not-spontaneous') {
        newCalculatedStatus = progress[word.id] !== 'Spontaneous';
      } else {
        return;
      }

      if (currentStatus !== newCalculatedStatus) {
        newStatusUpdates[word.id] = newCalculatedStatus;
        progressEntriesToSave.push({
          wordId: word.id,
          forReview: newCalculatedStatus,
          level: progress[word.id],
          notes: wordNotes[word.id],
        });
      }
    });

    if (Object.keys(newStatusUpdates).length > 0) {
      const updatedWordForReviewStatus = { ...wordForReviewStatus, ...newStatusUpdates };
      setWordForReviewStatus(updatedWordForReviewStatus);
      await saveBulkWordProgress(progressEntriesToSave);
    }
  };

  const handleOpenFlashcardReviewModal = () => setShowFlashcardReviewModal(true);
  const handleCloseFlashcardReviewModal = () => setShowFlashcardReviewModal(false);

  

  const wordsToReviewList = useMemo(() => {
    const filtered = words.filter(word => wordForReviewStatus[word.id]);
    const sorted = [...filtered].sort((a, b) => {
        if (reviewSortConfig === 'level') {
            return levelOrder.indexOf(progress[a.id] || '') - levelOrder.indexOf(progress[b.id] || '');
        }
        if (reviewSortConfig === 'category') {
            return a.category.localeCompare(b.category);
        }
        return a.word.localeCompare(b.word);
    });
    return sorted;
  }, [words, wordForReviewStatus, reviewSortConfig, progress]);

  const formatDate = (dateString?: string) => !dateString ? 'N/A' : new Date(dateString).toISOString().split('T')[0];
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

  const getWordStyle = (wordId: string) => {
    const backgroundColor = levelColors[progress[wordId] || ''];
    return {
        padding: '0.25rem 0.5rem',
        borderRadius: '5px',
        backgroundColor,
        display: 'inline-block',
        marginBottom: '0.25rem',
        color: getContrastingTextColor(backgroundColor),
    };
  };

  if (loading) return <p>Loading...</p>;
  if (error) return <p style={{color: 'red'}}>Error: {error}</p>;
  if (!student) return <p>No student data found.</p>;

  return (
    <div style={{fontFamily: 'sans-serif'}}>
        <header style={{ position: 'sticky', top: 0, backgroundColor: 'rgba(255, 255, 255, 0.9)', backdropFilter: 'blur(10px)', zIndex: 100, padding: '1rem 2rem', borderBottom: '1px solid #eee', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
            <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                <h1 style={{margin: 0}}>{student.first_name} {student.last_name}</h1>
                <img src={student.avatar_url || '/resources/img/default_user.png'} alt="Student Avatar" style={{width: '60px', height: '60px', borderRadius: '50%', objectFit: 'cover'}} />
            </div>
            <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.5rem'}}>
                <p style={{margin: 0, color: '#555'}}><strong>DOB:</strong> {formatDate(student.date_of_birth)}</p>
                <p style={{margin: 0, color: '#555'}}><strong>School:</strong> {student.school || 'N/A'}</p>
            </div>
            <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.5rem'}}>
                <p style={{margin: 0, color: '#555'}}><strong>Parents:</strong> {parents.map(p => `${p.first_name} ${p.last_name}`).join(', ') || 'N/A'}</p>
                <p style={{margin: 0, color: '#555'}}><strong>Claim Code:</strong> {student.claim_code}</p>
            </div>
        </header>

        <main style={{padding: '2rem'}}>
            {progressSummary && (
              <div style={{ marginBottom: '2rem', padding: '1.5rem', border: '1px solid #e0e0e0', borderRadius: '8px', backgroundColor: '#f9f9f9' }}>
                <h2 style={{ marginTop: 0, color: '#333' }}>Learning Progress Overview</h2>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem', marginTop: '1rem' }}>
                  {progressSummary.overallProgress && (
                    <div style={{ border: '1px solid #eee', borderRadius: '8px', padding: '1rem', backgroundColor: 'white' }}>
                      <h3 style={{ textAlign: 'center', marginBottom: '1rem', color: '#444' }}>Overall Progress</h3>
                      <ResponsiveContainer width="100%" height={200}>
                        <PieChart>
                          <Pie
                            data={[
                              { name: 'Mastered', value: progressSummary.overallProgress.masteredCount },
                              { name: 'In Progress', value: progressSummary.overallProgress.inProgressCount },
                            ]}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={80}
                            fill="#8884d8"
                            paddingAngle={5}
                            dataKey="value"
                          >
                            <Cell key={`cell-mastered`} fill={'#28a745'} />
                            <Cell key={`cell-in-progress`} fill={'#007bff'} />
                          </Pie>
                          <Tooltip />
                          <Legend />
                        </PieChart>
                      </ResponsiveContainer>
                      <p style={{ textAlign: 'center', marginTop: '1rem', color: '#555' }}>
                        Total Words: <span style={{ fontWeight: 'bold' }}>{progressSummary.overallProgress.totalWords}</span>
                      </p>
                    </div>
                  )}
                  {progressSummary.levelDistribution && (
                    <div style={{ border: '1px solid #eee', borderRadius: '8px', padding: '1rem', backgroundColor: 'white' }}>
                      <h3 style={{ textAlign: 'center', marginBottom: '1rem', color: '#444' }}>Words by Acquisition Level</h3>
                      <ResponsiveContainer width="100%" height={200}>
                        <BarChart data={progressSummary.levelDistribution.map(entry => ({ name: entry.level, count: entry.count, fill: levelColors[entry.level] }))} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="name" />
                          <YAxis />
                          <Tooltip />
                          <Legend />
                          <Bar dataKey="count" fill="#8884d8">
                            {progressSummary.levelDistribution.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={levelColors[entry.level]} />
                            ))}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  )}
                </div>
              </div>
            )}

            <div style={{marginBottom: '2rem', padding: '1rem', border: '1px solid #eee', borderRadius: '8px'}}>
                <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem'}}>
                    <div style={{display: 'flex', alignItems: 'center', gap: '1rem'}}>
                        <h2 style={{margin: 0}}>Words for Review ({wordsToReviewList.length})</h2>
                        <div>
                            <span style={{fontSize: '0.8rem', fontWeight: 'bold', marginRight: '0.5rem'}}>Sort by:</span>
                            <button onClick={() => setReviewSortConfig('word')} style={{fontSize: '0.8rem', fontWeight: reviewSortConfig === 'word' ? 'bold' : 'normal'}}>A-Z</button>
                            <button onClick={() => setReviewSortConfig('level')} style={{fontSize: '0.8rem', marginLeft: '0.5rem', fontWeight: reviewSortConfig === 'level' ? 'bold' : 'normal'}}>Level</button>
                            <button onClick={() => setReviewSortConfig('category')} style={{fontSize: '0.8rem', marginLeft: '0.5rem', fontWeight: reviewSortConfig === 'category' ? 'bold' : 'normal'}}>Category</button>
                        </div>
                    </div>
                    {wordsToReviewList.length > 0 && (
                        <button onClick={handleOpenFlashcardReviewModal} style={{ padding: '0.5rem 1rem', backgroundColor: '#28a745', color: 'white', borderRadius: '5px', border:'none', cursor:'pointer' }}>
                            Review Words
                        </button>
                    )}
                </div>
                <div style={{display: 'flex', flexWrap: 'wrap', gap: '0.5rem'}}>
                    {wordsToReviewList.length > 0 ? wordsToReviewList.map(word => (
                        <div key={word.id} style={getWordStyle(word.id)}>
                            <span>{word.word}</span>
                        </div>
                    )) : <p>No words are currently marked for review.</p>}
                </div>
            </div>

            <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '2rem', marginBottom: '1rem'}}>
                <h2 style={{margin: 0}}>Vocabulary Goals</h2>
            </div>
            
            {Object.keys(groupedWords).length > 0 ? (
              Object.entries(groupedWords).map(([category, wordsInCategory]) => {
                const currentLevelFilter = levelFilter[category] || new Set();
                const currentSort = sortConfig[category] || 'word';
                const filtered = wordsInCategory.filter(word => currentLevelFilter.has(progress[word.id] || ''));
                const sorted = [...filtered].sort((a, b) => {
                    if (currentSort === 'level') return levelOrder.indexOf(progress[a.id] || '') - levelOrder.indexOf(progress[b.id] || '');
                    return a.word.localeCompare(b.word);
                });

                return (
                  <div key={category} style={{marginBottom: '1.5rem', border: '1px solid #eee', borderRadius: '8px', padding: '0.5rem 1rem'}}>
                      <div onClick={() => toggleCategory(category)} style={{cursor: 'pointer', userSelect: 'none', display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                          <h3>{category}</h3>
                          <span style={{fontSize: '1.5rem', transform: collapsedCategories[category] ? 'rotate(0deg)' : 'rotate(90deg)', transition: 'transform 0.2s'}}>&#x276F;</span>
                      </div>
                      {!collapsedCategories[category] && (
                          <div>
                              <div ref={filterControlsRef} style={{padding: '0.5rem 0', display: 'flex', flexWrap: 'wrap', gap: '2rem', alignItems: 'flex-start', borderTop: '1px solid #eee', borderBottom: '1px solid #eee', marginTop: '0.5rem'}}>
                                  <fieldset style={{border: 'none', padding: '0', position: 'relative'}}>
                                      <legend style={{fontSize: '0.8rem', fontWeight: 'bold'}}>Filter by Group</legend>
                                      <button onClick={() => toggleGroupFilterDropdown(category)} style={{fontSize: '0.8rem'}}>Select Groups &#x25BC;</button>
                                      {groupFilterOpen[category] && (
                                          <div style={{position: 'absolute', top: '100%', left: 0, backgroundColor: 'white', border: '1px solid #ccc', borderRadius: '5px', padding: '0.5rem', zIndex: 10, boxShadow: '0 2px 8px rgba(0,0,0,0.15)'}}>
                                              {allWordGroups.map(group => (
                                                  <label key={group} style={{fontSize: '0.8rem', display: 'block', color: group !== 'First 100' ? '#aaa' : '#000'}}>
                                                      <input type="checkbox" onChange={() => handleGroupFilterChange(category, group)} checked={groupFilter[category]?.has(group) || false} disabled={group !== 'First 100'} /> {group}
                                                  </label>
                                              ))}
                                          </div>
                                      )}
                                  </fieldset>
                                  <fieldset style={{border: 'none', padding: '0'}}>
                                      <legend style={{fontSize: '0.8rem', fontWeight: 'bold'}}>Sort by</legend>
                                      <button onClick={() => handleSortChange(category, 'word')} style={{fontSize: '0.8rem', fontWeight: sortConfig[category] === 'word' || !sortConfig[category] ? 'bold' : 'normal'}}>A-Z</button>
                                      <button onClick={() => handleSortChange(category, 'level')} style={{fontSize: '0.8rem', marginLeft: '0.5rem', fontWeight: sortConfig[category] === 'level' ? 'bold' : 'normal'}}>Level</button>
                                  </fieldset>
                                  <fieldset style={{border: 'none', padding: '0'}}>
                                      <legend style={{fontSize: '0.8rem', fontWeight: 'bold'}}>Bulk Select</legend>
                                      <button onClick={() => handleBulkForReviewChange(category, 'all')} style={{fontSize: '0.8rem'}}>All</button>
                                      <button onClick={() => handleBulkForReviewChange(category, 'none')} style={{fontSize: '0.8rem', marginLeft: '0.5rem'}}>None</button>
                                      <button onClick={() => handleBulkForReviewChange(category, 'not-spontaneous')} style={{fontSize: '0.8rem', marginLeft: '0.5rem', whiteSpace: 'nowrap'}}>Not Spontaneous</button>
                                  </fieldset>
                                  <fieldset style={{border: 'none', padding: '0', position: 'relative'}}>
                                      <legend style={{fontSize: '0.8rem', fontWeight: 'bold'}}>Show / Hide</legend>
                                      <button onClick={() => toggleLevelFilterDropdown(category)} style={{fontSize: '0.8rem'}}>Acquisition Levels &#x25BC;</button>
                                      {levelFilterOpen[category] && (
                                          <div style={{position: 'absolute', top: '100%', left: 0, backgroundColor: 'white', border: '1px solid #ccc', borderRadius: '5px', padding: '0.5rem', zIndex: 10, boxShadow: '0 2px 8px rgba(0,0,0,0.15)'}}>
                                              {allLevels.map(level => (
                                                  <label key={level} style={{fontSize: '0.8rem', display: 'block'}}>
                                                      <input type="checkbox" onChange={() => handleLevelFilterChange(category, level)} checked={levelFilter[category]?.has(level) || false} /> {level}
                                                  </label>
                                              ))}
                                          </div>
                                      )}
                                  </fieldset>
                              </div>
                              <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '0.5rem', marginTop: '1rem'}}>
                                  {sorted.map(word => (
                                      <div key={word.id} style={{...getWordStyle(word.id), display: 'flex', alignItems: 'center', justifyContent: 'space-between'}}>
                                          <div style={{display: 'flex', flexDirection: 'column', alignItems: 'flex-start'}}>
                                              <div style={{display: 'flex', alignItems: 'center'}}>
                                                  <input type="checkbox" id={`for-review-${word.id}`} checked={wordForReviewStatus[word.id] || false} onChange={() => handleToggleForReview(word.id)} />
                                                  <label htmlFor={`for-review-${word.id}`} style={{marginLeft: '0.5rem'}}>{word.word}</label>
                                              </div>
                                          </div>
                                          <div style={{display: 'flex', gap: '5px'}}>
                                              <button title="View/Edit Notes" onClick={() => handleViewNotes(word.id)} style={{background: 'none', border: 'none', cursor: 'pointer', padding: '0', display: 'flex', alignItems: 'center', justifyContent: 'center', width: '24px', height: '24px'}}>
                                                  <svg width="1em" height="1em" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><title/><g id="Complete"><g id="edit"><g><path d="M20,16v4a2,2,0,0,1-2,2H4a2,2,0,0,1-2-2V6A2,2,0,0,1,4,4H8" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"/><polygon fill="none" points="12.5 15.8 22 6.2 17.8 2 8.3 11.5 8 16 12.5 15.8" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"/></g></g></g></svg>
                                              </button>
                                              <button title="Review Word" onClick={() => handleReviewWord(word.id)} style={{background: 'none', border: 'none', cursor: 'pointer', padding: '0', display: 'flex', alignItems: 'center', justifyContent: 'center', width: '24px', height: '24px'}}>
                                                  <svg width="1.2em" height="1.2em" viewBox="0 0 21 21" xmlns="http://www.w3.org/2000/svg"><g fill="none" fill-rule="evenodd" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" transform="translate(2 3)"><path d="m5.5.5h6c1.1045695 0 2 .8954305 2 2v10c0 1.1045695-.8954305 2-2 2h-6c-1.1045695 0-2-.8954305-2-2v-10c0-1.1045695.8954305-2 2-2zm8 2.5h1c1.1045695 0 2 .8954305 2 2v5c0 1.1045695-.8954305 2-2 2h-1z"/><path d="m.5 3h1c1.1045695 0 2 .8954305 2 2v5c0 1.1045695-.8954305 2-2 2h-1z" transform="matrix(-1 0 0 1 4 0)"/></g><circle cx="5" cy="18" r="1" fill={levelColors[levelOrder[0]]}></circle><circle cx="8" cy="18" r="1" fill={levelColors[levelOrder[1]]}></circle><circle cx="11" cy="18" r="1" fill={levelColors[levelOrder[2]]}></circle><circle cx="14" cy="18" r="1" fill={levelColors[levelOrder[3]]}></circle><circle cx="17" cy="18" r="1" fill={levelColors[levelOrder[4]]}></circle></svg>
                                              </button>
                                          </div>
                                      </div>
                                  ))}
                              </div>
                          </div>
                      )}
                  </div>
                )
              })
            ) : (
              <div style={{ padding: '1rem', border: '1px solid #eee', borderRadius: '8px', textAlign: 'center' }}>
                <p>No vocabulary assigned or progress recorded for {student.first_name}.</p>
                <button onClick={handleOnboard} disabled={onboarding} style={{
                  padding: '0.75rem 1.5rem',
                  fontSize: '1rem',
                  backgroundColor: onboarding ? '#ccc' : '#007bff',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: onboarding ? 'not-allowed' : 'pointer',
                }}>
                  {onboarding ? 'Onboarding...' : 'Onboard with First 100 Words'}
                </button>
              </div>
            )}
        </main>
    {showEditNotesModal && selectedWordForEditNotesModal && (
            <EditNotesModal
                word={selectedWordForEditNotesModal}
                currentNotes={wordNotes[selectedWordForEditNotesModal.id] || ''}
                onClose={handleCloseEditNotesModal}
                onSaveNotes={handleSaveNotes}
            />
        )}
    {showReviewLevelModal && selectedWordForReviewLevelModal && (
            <ReviewWordModal
                word={selectedWordForReviewLevelModal}
                currentLevel={progress[selectedWordForReviewLevelModal.id] || ''}
                onClose={handleCloseReviewLevelModal}
                onUpdateLevel={handleUpdateLevel}
            />
        )}
    {showFlashcardReviewModal && (
        <FlashcardReviewModal
            words={wordsToReviewList}
            progress={progress}
            onClose={handleCloseFlashcardReviewModal}
            onUpdateLevel={handleUpdateLevel}
        />
    )}
    </div>
  );
}

export default StudentProfile;