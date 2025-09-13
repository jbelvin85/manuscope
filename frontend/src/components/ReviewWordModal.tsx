import React, { useState, useEffect } from 'react';
import { Level, levelColors, levelOrder } from '../constants';

interface Word {
  id: string;
  category: string;
  word: string;
  word_group?: number;
}

interface ReviewWordModalProps {
  word: Word | null;
  currentLevel: Level;
  onClose: () => void;
  onUpdateLevel: (wordId: string, newLevel: Level) => void;
}

const ReviewWordModal: React.FC<ReviewWordModalProps> = ({ word, currentLevel, onClose, onUpdateLevel }) => {
  const [selectedLevel, setSelectedLevel] = useState<Level>(currentLevel);

  useEffect(() => {
    setSelectedLevel(currentLevel);
  }, [currentLevel]);

  if (!word) return null;

  const handleLevelChange = (level: Level) => {
    setSelectedLevel(level);
  };

  const handleSave = () => {
    onUpdateLevel(word.id, selectedLevel);
    onClose();
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.5)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 1000,
    }}>
      <div style={{
        backgroundColor: 'white',
        padding: '2rem',
        borderRadius: '8px',
        boxShadow: '0 4px 16px rgba(0,0,0,0.2)',
        minWidth: '300px',
        maxWidth: '500px',
        textAlign: 'center',
      }}>
        <h2>Review: {word.word}</h2>
        <p>Current Level: <span style={{backgroundColor: levelColors[currentLevel], padding: '0.2em 0.5em', borderRadius: '4px'}}>{currentLevel || 'None'}</span></p>
        
        <div style={{margin: '1.5rem 0'}}>
          <h3>Set New Acquisition Level:</h3>
          <div style={{display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '10px'}}>
            {levelOrder.filter(l => l !== '').map(level => (
              <button
                key={level}
                onClick={() => handleLevelChange(level)}
                style={{
                  backgroundColor: selectedLevel === level ? levelColors[level] : '#f0f0f0',
                  color: selectedLevel === level ? 'black' : '#333',
                  border: `1px solid ${levelColors[level]}`,
                  padding: '0.5rem 1rem',
                  borderRadius: '5px',
                  cursor: 'pointer',
                  fontWeight: selectedLevel === level ? 'bold' : 'normal',
                }}
              >
                {level}
              </button>
            ))}
          </div>
        </div>

        <div style={{marginTop: '2rem', display: 'flex', justifyContent: 'space-around'}}>
          <button onClick={onClose} style={{padding: '0.5rem 1rem', backgroundColor: '#ccc', border: 'none', borderRadius: '5px', cursor: 'pointer'}}>Cancel</button>
          <button onClick={handleSave} style={{padding: '0.5rem 1rem', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer'}}>Save Level</button>
        </div>
      </div>
    </div>
  );
};

export default ReviewWordModal;