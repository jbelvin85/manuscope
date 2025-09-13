import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Level, levelColors, levelOrder } from '../constants';

// Interfaces
interface Student { id: string; first_name: string; last_name: string; school?: string; date_of_birth?: string; claim_code: string; created_at: string; avatar_url?: string; }
interface User { id: number; first_name: string; last_name: string; avatar_url?: string; }
interface Word { id: string; category: string; word: string; word_group?: number; }
interface Progress { word_id: string; level: Level; }

const allLevels = levelOrder.filter(l => l !== '');
const allWordGroups = ['First 100', 'Next 150', 'Next 300', 'Guided Instruction'];

const StudentProfile: React.FC = () => {
  const { studentId } = useParams<{ studentId: string }>();
  const [student, setStudent] = useState<Student | null>(null);
  const [parents, setParents] = useState<User[]>([]);
  const [words, setWords] = useState<Word[]>([]);
  const [assignedWords, setAssignedWords] = useState<Set<string>>(new Set());
  const [progress, setProgress] = useState<Record<string, Level>>({});
  const [collapsedCategories, setCollapsedCategories] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [sortConfig, setSortConfig] = useState<Record<string, 'word' | 'level'>>({});
  const [levelFilter, setLevelFilter] = useState<Record<string, Set<Level>>>({});
  const [groupFilter, setGroupFilter] = useState<Record<string, Set<string>>>({});
  const [levelFilterOpen, setLevelFilterOpen] = useState<Record<string, boolean>>({});
  const [groupFilterOpen, setGroupFilterOpen] = useState<Record<string, boolean>>({});
  
  const levelDropdownRef = useRef<HTMLFieldSetElement>(null);
  const groupDropdownRef = useRef<HTMLFieldSetElement>(null);

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
                fetch(`http://localhost:4001/students/${studentId}`),
                fetch('http://localhost:4001/words'),
                fetch(`http://localhost:4001/students/${studentId}/words`),
                fetch(`http://localhost:4001/students/${studentId}/progress`),
                fetch(`http://localhost:4001/students/${studentId}/parents`)
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
            setAssignedWords(new Set(assignedData));
            setParents(parentsData);

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
      const target = event.target as Node;
      if (levelDropdownRef.current && !levelDropdownRef.current.contains(target)) setLevelFilterOpen({});
      if (groupDropdownRef.current && !groupDropdownRef.current.contains(target)) setGroupFilterOpen({});
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleWordAssignmentChange = (wordId: string) => setAssignedWords(prev => { const ns = new Set(prev); if (ns.has(wordId)) ns.delete(wordId); else ns.add(wordId); return ns; });
  const handleSaveChanges = () => { /* Save logic */ };
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

  const wordsToReview = Array.from(assignedWords).filter(wordId => progress[wordId] !== 'Spontaneous');
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
                            <div style={{padding: '0.5rem 0', display: 'flex', flexWrap: 'wrap', gap: '2rem', alignItems: 'flex-start', borderTop: '1px solid #eee', borderBottom: '1px solid #eee', marginTop: '0.5rem'}}>
                                <fieldset style={{border: 'none', padding: '0', position: 'relative'}} ref={groupDropdownRef}>
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
                                    <button onClick={() => handleSortChange(category, 'word')} style={{fontSize: '0.8rem', fontWeight: sortConfig[category] === 'word' || !sortConfig[category] ? 'bold' : 'normal'}}>Alphabetical</button>
                                    <button onClick={() => handleSortChange(category, 'level')} style={{fontSize: '0.8rem', marginLeft: '0.5rem', fontWeight: sortConfig[category] === 'level' ? 'bold' : 'normal'}}>Level</button>
                                </fieldset>
                                <fieldset style={{border: 'none', padding: '0', position: 'relative'}} ref={levelDropdownRef}>
                                    <legend style={{fontSize: '0.8rem', fontWeight: 'bold'}}>Show / Hide</legend>
                                    <button onClick={() => toggleLevelFilterDropdown(category)} style={{fontSize: '0.8rem'}}>Acquisition Levels &#x25BC;</button>
                                    {levelFilterOpen[category] && (
                                        <div style={{position: 'absolute', top: '100%', left: 0, backgroundColor: 'white', border: '1px solid #ccc', borderRadius: '5px', padding: '0.5rem', zIndex: 10, boxShadow: '0 2px 8px rgba(0,0,0,0.15)'}}>
                                            <label style={{fontSize: '0.8rem', display: 'block'}}><input type="checkbox" onChange={() => handleLevelFilterChange(category, 'All')} checked={(levelFilter[category]?.size || 0) === allLevels.length} /> All</label>
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
                                    <div key={word.id} style={getWordStyle(word.id)}>
                                        <input type="checkbox" id={`word-${word.id}`} checked={assignedWords.has(word.id)} onChange={() => handleWordAssignmentChange(word.id)} />
                                        <label htmlFor={`word-${word.id}`} style={{marginLeft: '0.5rem'}}>{word.word}</label>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            ))}
        </main>
    </div>
  );
}

export default StudentProfile;
