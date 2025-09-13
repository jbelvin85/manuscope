import React from 'react';
import { Level, levelColors } from '../constants';

interface Word {
  id: string;
  word: string;
  category: string;
  level?: string;
  image_link?: string;
  video_link?: string;
  custom_image_boolean?: boolean;
  custom_image_link?: string;
}

interface FlashcardProps {
  word: Word;
  currentLevel: Level;
  onLevelChange: (wordId: string, level: Level) => void;
  levels: Level[];
}

const Flashcard: React.FC<FlashcardProps> = ({ word, currentLevel, onLevelChange, levels }) => {
  return (
    <div style={{
      border: '1px solid #ccc',
      padding: '1.5rem',
      borderRadius: '8px',
      textAlign: 'center',
      backgroundColor: '#f9f9f9',
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
      minHeight: '250px'
    }}>
      <h3 style={{ fontSize: '1.8rem', margin: '0 0 1rem 0', color: '#333' }}>{word.word}</h3>
      {word.custom_image_boolean && word.custom_image_link ? (
        <img src={word.custom_image_link} alt={word.word} style={{ maxWidth: '100%', maxHeight: '150px', objectFit: 'contain', marginBottom: '1rem' }} />
      ) : word.image_link ? (
        <img src={word.image_link} alt={word.word} style={{ maxWidth: '100%', maxHeight: '150px', objectFit: 'contain', marginBottom: '1rem' }} />
      ) : null}
      {word.video_link && (
        <video controls src={word.video_link} style={{ maxWidth: '100%', maxHeight: '150px', objectFit: 'contain', marginBottom: '1rem' }} />
      )}
      <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
        {levels.map(level => (
          <label key={level} style={{
            display: 'flex',
            alignItems: 'center',
            cursor: 'pointer',
            padding: '0.5rem 1rem',
            borderRadius: '20px',
            backgroundColor: currentLevel === level ? levelColors[level] : '#f0f0f0',
            border: `2px solid ${currentLevel === level ? levelColors[level] : '#ccc'}`,
            transition: 'background-color 0.2s, border-color 0.2s',
            boxShadow: currentLevel === level ? '0 2px 5px rgba(0,0,0,0.2)' : 'none'
          }}>
            <input
              type="radio"
              name={`level-${word.id}`}
              value={level}
              checked={currentLevel === level}
              onChange={() => onLevelChange(word.id, level)}
              style={{ display: 'none' }} // Hide the actual radio button
            />
            {level}
          </label>
        ))}
      </div>
    </div>
  );
};

export default Flashcard;
