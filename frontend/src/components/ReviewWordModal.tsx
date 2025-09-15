import React, { useState, useEffect } from 'react';
import { Level, levelColors, levelOrder } from '../constants';

interface Word {
  id: string;
  category: string;
  word: string;
  word_group?: number;
  image_link?: string;
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
    onUpdateLevel(word.id, level);
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
        position: 'relative', // For positioning the close button
        backgroundColor: 'white',
        padding: '2rem',
        borderRadius: '8px',
        boxShadow: '0 4px 16px rgba(0,0,0,0.2)',
        minWidth: '300px',
        maxWidth: '500px',
        textAlign: 'center',
      }}>
        <button onClick={onClose} style={{
          position: 'absolute',
          top: '10px',
          right: '10px',
          background: 'none',
          border: 'none',
          fontSize: '1.5rem',
          cursor: 'pointer',
          lineHeight: '1',
        }}>&times;</button>
        <h2>Review: {word.word}</h2>
        {word.image_link && <img src={word.image_link} alt={word.word} style={{maxWidth: '100%', height: 'auto', maxHeight: '200px', margin: '1rem 0'}} />}
        
        <div style={{margin: '1.5rem 0'}}>
          <div style={{display: 'flex', justifyContent: 'center', gap: '10px'}}>
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
      </div>
    </div>
  );
};

export default ReviewWordModal;
