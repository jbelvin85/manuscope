import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../contexts/AuthContext';

interface Word {
  id: string;
  category: string;
  word: string;
  image_link?: string;
  video_link?: string;
}

const Dictionary: React.FC = () => {
  const { userRole } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [sortConfig, setSortConfig] = useState<'word' | 'category' | 'random'>('word');
  const [allAvailableWords, setAllAvailableWords] = useState<Word[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchAllWords = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          setError('Authentication token not found.');
          setLoading(false);
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
      } finally {
        setLoading(false);
      }
    };
    fetchAllWords();
  }, []);

  const sortedWords = useMemo(() => {
    let sorted = [...allAvailableWords];
    if (sortConfig === 'word') {
      sorted.sort((a, b) => a.word.localeCompare(b.word));
    } else if (sortConfig === 'category') {
      sorted.sort((a, b) => a.category.localeCompare(b.category));
    } else if (sortConfig === 'random') {
      sorted = sorted.sort(() => Math.random() - 0.5);
    }
    return sorted;
  }, [allAvailableWords, sortConfig]);

  if (loading) return <p>Loading dictionary...</p>;
  if (error) return <p style={{ color: 'red' }}>Error: {error}</p>;

  return (
    <div style={{ fontFamily: 'sans-serif', padding: '2rem' }}>
      <h2>Word Dictionary</h2>
      <div style={{ marginBottom: '1rem' }}>
        <button onClick={() => setSortConfig('word')} style={{ marginRight: '0.5rem' }}>A-Z</button>
        <button onClick={() => setSortConfig('category')} style={{ marginRight: '0.5rem' }}>Category</button>
        <button onClick={() => setSortConfig('random')} style={{ marginRight: '0.5rem' }}>Random</button>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1rem' }}>
        {sortedWords.map(word => (
          <div key={word.id} style={{ border: '1px solid #eee', borderRadius: '8px', padding: '1rem' }}>
            <h3 style={{ marginTop: 0 }}>{word.word}</h3>
            <p style={{ color: '#555' }}>{word.category}</p>
            {word.image_link && <img src={word.image_link} alt={word.word} style={{ width: '100%', height: 'auto', borderRadius: '4px' }} />}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Dictionary;
