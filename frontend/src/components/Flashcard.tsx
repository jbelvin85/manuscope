import React from 'react';

interface Word {
  id: string; // Changed to string for UUID
  word: string;
  category: string;
  level?: string; // Optional, as it might not always be set
  image_link?: string;
  video_link?: string;
  custom_image_boolean?: boolean;
  custom_image_link?: string;
}

type Level = 'Input' | 'Comprehension' | 'Imitation' | 'Prompted' | 'Spontaneous' | '';

interface FlashcardProps {
  word: Word;
  currentLevel: Level;
  onLevelChange: (wordId: string, level: Level) => void; // Changed wordId to string
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
      minHeight: '250px' // Increased height to accommodate image/video
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
      <select
        value={currentLevel}
        onChange={(e) => onLevelChange(word.id, e.target.value as Level)}
        style={{
          padding: '0.5rem',
          borderRadius: '4px',
          border: '1px solid #ddd',
          fontSize: '1rem',
          width: '100%'
        }}
      >
        <option value="">-- Select Level --</option>
        {levels.map(level => (
          <option key={level} value={level}>{level}</option>
        ))}
      </select>
    </div>
  );
};

export default Flashcard;
