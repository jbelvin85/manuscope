import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Level, levelColors, levelOrder } from '../constants';
import ReviewWordModal from '../components/ReviewWordModal';
import EditNotesModal from '../components/EditNotesModal';

// Interfaces
interface Student { id: string; first_name: string; last_name: string; school?: string; date_of_birth?: string; claim_code: string; created_at: string; avatar_url?: string; }
interface User { id: number; first_name: string; last_name: string; avatar_url?: string; }
interface Word { id: string; category: string; word: string; word_group?: number; notes?: string; }
interface Progress { word_id: string; level: Level; notes?: string; for_review?: boolean; }

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
  const [wordForReviewStatus, setWordForReviewStatus] = useState<Record<string, boolean>>({}); // New state for for_review
  const [showEditNotesModal, setShowEditNotesModal] = useState<boolean>(false);
  const [selectedWordForEditNotesModal, setSelectedWordForEditNotesModal] = useState<Word | null>(null);
  const [showReviewLevelModal, setShowReviewLevelModal] = useState<boolean>(false);
  const [selectedWordForReviewLevelModal, setSelectedWordForReviewLevelModal] = useState<Word | null>(null);

  const [sortConfig, setSortConfig] = useState<Record<string, 'word' | 'level'>>({});
  const [levelFilter, setLevelFilter] = useState<Record<string, Set<Level>>>({});
  const [groupFilter, setGroupFilter] = useState<Record<string, Set<string>>>({});
  const [levelFilterOpen, setLevelFilterOpen] = useState<Record<string, boolean>>({});
  const [groupFilterOpen, setGroupFilterOpen] = useState<Record<string, boolean>>({});
  
  // Use a single ref for the entire filter controls container to handle clicks outside
  const filterControlsRef = useRef<HTMLDivElement>(null);

  const groupedWords = useMemo(() => words.reduce((acc, word) => {
    if (!acc[word.category]) acc[word.category] = [];
    acc[word.category].push(word);
    return acc;
  }, {} as Record<string, Word[]>), [words]);

  useEffect(() => {
    const fetchData = async () => {
        setLoading(true);
        try {
            const [studentRes, wordsRes, assignedRes, progressRes, parentsRes] = await Promise.all([
                fetch(`${import.meta.env.VITE_API_BASE_URL}/students/${studentId}`),
                fetch(`${import.meta.env.VITE_API_BASE_URL}/words`),
                fetch(`${import.meta.env.VITE_API_BASE_URL}/students/${studentId}/words`),
                fetch(`${import.meta.env.VITE_API_BASE_URL}/students/${studentId}/progress`),
                fetch(`${import.meta.env.VITE_API_BASE_URL}/students/${studentId}/parents`)
            ]);

            if (!studentRes.ok) throw new Error('Failed to fetch student details');
            if (!wordsRes.ok) throw new Error('Failed to fetch words');
            if (!assignedRes.ok) throw new Error('Failed to fetch assigned words');
            if (!progressRes.ok) throw new Error('Failed to fetch progress');
            if (!parentsRes.ok) throw new Error('Failed to fetch parents');

            const studentData = await studentRes.json();
            const wordsData = await wordsRes.json();
            const assignedData = await assignedRes.json();
            const progressData: Progress[] = await progressRes.json();
            const parentsData = await parentsRes.json();

            setStudent(studentData);
            setWords(wordsData);
            setParents(parentsData);

            const initialWordNotes: Record<string, string> = {};
            const initialWordForReviewStatus: Record<string, boolean> = {}; // New
            progressData.forEach((p: Progress) => {
                if (p.notes) {
                    initialWordNotes[p.word_id] = p.notes;
                }
                initialWordForReviewStatus[p.word_id] = p.for_review ?? true; // Default to true if not set
            });
            setWordNotes(initialWordNotes);
            setWordForReviewStatus(initialWordForReviewStatus); // Set new state

            const progressMap = progressData.reduce((acc, p) => { acc[p.word_id] = p.level; return acc; }, {} as Record<string, Level>);
            setProgress(progressMap);

        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };
    fetchData();
  }, [studentId]);

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

  const handleToggleForReview = (wordId: string) => {
    setWordForReviewStatus(prev => ({
      ...prev,
      [wordId]: !prev[wordId],
    }));
    // Immediately save changes when "Mark for Review" is toggled
    handleSaveChanges();
  };
  const handleSaveChanges = async () => {
    try {
      const updatedProgress = words
        .filter(word => wordForReviewStatus[word.id]) // Only include words marked for review
        .map(word => ({
          word_id: word.id,
          level: progress[word.id] || '', // Use existing level or default
          notes: wordNotes[word.id] || '', // Include notes
          forReview: wordForReviewStatus[word.id] ?? true, // Include forReview status
        }));

      console.log("Saving changes:", updatedProgress);

      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/students/${studentId}/baseline-progress`, {
        method: 'POST', // Changed from PUT to POST
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ progressEntries: updatedProgress }), // Wrapped in an object with progressEntries key
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Failed to save changes. Status:', response.status, 'Response:', errorText);
        throw new Error(`Failed to save changes: ${response.status} - ${errorText}`);
      }
      alert('Changes saved successfully!');
    } catch (err: any) {
      setError(err.message);
      alert(`Error saving changes: ${err.message}`);
    }
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
            if (currentFilter.size === allLevels.length) currentFilter.clear(); else allLevels.forEach(l => currentFilter.add(l));
        } else {
            if (currentFilter.has(level)) currentFilter.delete(level); else currentFilter.add(level);
        }
        newFilters[category] = currentFilter;
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
    handleSaveChanges();
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
    handleSaveChanges();
  };

  const displayedWords = useMemo(() => {
    const result: Record<string, Word[]> = {};
    for (const category in groupedWords) {
        const currentLevelFilter = levelFilter[category] || new Set();
        const currentSort = sortConfig[category] || 'word';
        const filtered = groupedWords[category].filter(word => currentLevelFilter.has(progress[word.id] || ''));
        const sorted = [...filtered].sort((a, b) => {
            if (currentSort === 'level') return levelOrder.indexOf(progress[a.id] || '') - levelOrder.indexOf(progress[b.id] || '');
            return a.word.localeCompare(b.word);
        });
        result[category] = sorted;
    }
    return result;
  }, [groupedWords, progress, sortConfig, levelFilter]);

  const wordsToReview = words.filter(word => wordForReviewStatus[word.id] === true).map(word => word.id);
  const formatDate = (dateString?: string) => !dateString ? 'N/A' : new Date(dateString).toISOString().split('T')[0];
  const getWordStyle = (wordId: string) => ({ padding: '0.25rem 0.5rem', borderRadius: '5px', backgroundColor: levelColors[progress[wordId] || ''], display: 'inline-block', marginBottom: '0.25rem' });

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
            <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '2rem', marginBottom: '1rem'}}>
                <h2 style={{margin: 0}}>Vocabulary Goals</h2>
                <div>
                    <button onClick={handleSaveChanges} style={{marginRight: '1rem'}}>Save Changes</button>
                    {Object.keys(progress).length === 0 ? (
                        <Link to={`/student/${studentId}/onboarding`}> <button style={{ padding: '0.5rem 1rem', backgroundColor: '#007bff', color: 'white', borderRadius: '5px', border:'none', cursor:'pointer' }}> Start Onboarding Review </button> </Link>
                    ) : (
                        <Link to={`/student/${studentId}/review`}> <button style={{ padding: '0.5rem 1rem', backgroundColor: '#28a745', color: 'white', borderRadius: '5px', border:'none', cursor:'pointer' }}> Review Words ({wordsToReview.length}) </button> </Link>
                    )}
                </div>
            </div>
            
            {Object.entries(displayedWords).map(([category, wordsInCategory]) => (
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
                                {wordsInCategory.map(word => (
                                    <div key={word.id} style={{...getWordStyle(word.id), display: 'flex', alignItems: 'center', justifyContent: 'space-between'}}>
                                        <div style={{display: 'flex', flexDirection: 'column', alignItems: 'flex-start'}}>
                                            <div style={{display: 'flex', alignItems: 'center'}}>
                                                <input type="checkbox" id={`for-review-${word.id}`} checked={wordForReviewStatus[word.id] || false} onChange={() => handleToggleForReview(word.id)} />
                                                <label htmlFor={`for-review-${word.id}`} style={{marginLeft: '0.5rem'}}>{word.word}</label>
                                            </div>
                                            
                                        </div>
                                        <div style={{display: 'flex', gap: '5px'}}>
                                            <button title="View/Edit Notes" onClick={() => handleViewNotes(word.id)} style={{background: 'none', border: 'none', cursor: 'pointer', padding: '0', display: 'flex', alignItems: 'center', justifyContent: 'center', width: '24px', height: '24px'}}>
                                                <svg width="1em" height="1em" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                                <title/>
                                                <g id="Complete">
                                                <g id="edit">
                                                <g>
                                                <path d="M20,16v4a2,2,0,0,1-2,2H4a2,2,0,0,1-2-2V6A2,2,0,0,1,4,4H8" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"/>
                                                <polygon fill="none" points="12.5 15.8 22 6.2 17.8 2 8.3 11.5 8 16 12.5 15.8" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"/>
                                                </g>
                                                </g>
                                                </g>
                                                </svg>
                                            </button>
                                            <button title="Review Word" onClick={() => handleReviewWord(word.id)} style={{background: 'none', border: 'none', cursor: 'pointer', padding: '0', display: 'flex', alignItems: 'center', justifyContent: 'center', width: '24px', height: '24px'}}>
                                                <svg width="1.2em" height="1.2em" viewBox="0 0 21 21" xmlns="http://www.w3.org/2000/svg">
                                                <g fill="none" fill-rule="evenodd" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" transform="translate(2 3)">
                                                <path d="m5.5.5h6c1.1045695 0 2 .8954305 2 2v10c0 1.1045695-.8954305 2-2 2h-6c-1.1045695 0-2-.8954305-2-2v-10c0-1.1045695.8954305-2 2-2zm8 2.5h1c1.1045695 0 2 .8954305 2 2v5c0 1.1045695-.8954305 2-2 2h-1z"/>
                                                <path d="m.5 3h1c1.1045695 0 2 .8954305 2 2v5c0 1.1045695-.8954305 2-2 2h-1z" transform="matrix(-1 0 0 1 4 0)"/>
                                                </g>
                                                <circle cx="5" cy="18" r="1" fill={levelColors[levelOrder[0]]}></circle>
                                                <circle cx="8" cy="18" r="1" fill={levelColors[levelOrder[1]]}></circle>
                                                <circle cx="11" cy="18" r="1" fill={levelColors[levelOrder[2]]}></circle>
                                                <circle cx="14" cy="18" r="1" fill={levelColors[levelOrder[3]]}></circle>
                                                <circle cx="17" cy="18" r="1" fill={levelColors[levelOrder[4]]}></circle>
                                                </svg>
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            ))}
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
    </div>
  );
}

export default StudentProfile;