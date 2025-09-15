import React, { useState } from 'react';
import { Level, levelColors, levelOrder } from '../constants';

interface Word {
  id: string;
  category: string;
  word: string;
  word_group?: number;
  notes?: string;
  image_link?: string;
}

interface FlashcardReviewModalProps {
  words: Word[];
  progress: Record<string, Level>;
  onClose: () => void;
  onUpdateLevel: (wordId: string, newLevel: Level) => void;
}

const FlashcardReviewModal: React.FC<FlashcardReviewModalProps> = ({ words, progress, onClose, onUpdateLevel }) => {
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const currentWord = words[currentWordIndex];

  const handleNext = () => {
    if (currentWordIndex < words.length - 1) {
      setCurrentWordIndex(currentWordIndex + 1);
    }
  };

  const handlePrevious = () => {
    if (currentWordIndex > 0) {
      setCurrentWordIndex(currentWordIndex - 1);
    }
  };

  const handleLevelChange = (level: Level) => {
    if (currentWord) {
      onUpdateLevel(currentWord.id, level);
    }
  };

  if (!currentWord) {
    return (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
            <div style={{ position: 'relative', backgroundColor: 'white', padding: '2rem', borderRadius: '8px', textAlign: 'center' }}>
                <p>No words to review.</p>
                <button onClick={onClose}>Close</button>
            </div>
        </div>
    );
  }

  return (
    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
      <div style={{ position: 'relative', backgroundColor: 'white', padding: '2rem', borderRadius: '8px', boxShadow: '0 4px 16px rgba(0,0,0,0.2)', minWidth: '300px', maxWidth: '500px', textAlign: 'center' }}>
        <button onClick={onClose} style={{ position: 'absolute', top: '10px', right: '10px', background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer', lineHeight: '1' }}>&times;</button>
        
        <h2>{currentWord.word}</h2>
        <p style={{color: '#555', fontSize: '0.9rem', marginTop: '-0.5rem', marginBottom: '1rem'}}>Category: {currentWord.category}</p>
        <div style={{minHeight: '200px', margin: '1rem 0', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
            {currentWord.image_link && <img src={currentWord.image_link} alt={currentWord.word} style={{maxWidth: '100%', height: 'auto', maxHeight: '200px'}} />}
        </div>
        
        <div style={{margin: '1.5rem 0'}}>
          <div style={{display: 'flex', justifyContent: 'center', gap: '10px'}}>
            {levelOrder.filter(l => l !== '').map(level => (
              <button
                key={level}
                onClick={() => handleLevelChange(level)}
                style={{
                  backgroundColor: progress[currentWord.id] === level ? levelColors[level] : '#f0f0f0',
                  color: progress[currentWord.id] === level ? 'black' : '#333',
                  border: `1px solid ${levelColors[level]}`,
                  padding: '0.5rem 1rem',
                  borderRadius: '5px',
                  cursor: 'pointer',
                  fontWeight: progress[currentWord.id] === level ? 'bold' : 'normal',
                }}
              >
                {level}
              </button>
            ))}
          </div>
        </div>

        <div style={{marginTop: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
          <button onClick={handlePrevious} disabled={currentWordIndex === 0}>Previous</button>
          <span>{currentWordIndex + 1} / {words.length}</span>
          <button onClick={handleNext} disabled={currentWordIndex === words.length - 1}>Next</button>
        </div>
      </div>
    </div>
  );
};

export default FlashcardReviewModal;
