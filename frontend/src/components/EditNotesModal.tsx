import React, { useState, useEffect } from 'react';

interface Word {
  id: string;
  category: string;
  word: string;
  word_group?: number;
}

interface EditNotesModalProps {
  word: Word | null;
  currentNotes: string;
  onClose: () => void;
  onSaveNotes: (wordId: string, newNotes: string) => void;
}

const EditNotesModal: React.FC<EditNotesModalProps> = ({ word, currentNotes, onClose, onSaveNotes }) => {
  const [editedNotes, setEditedNotes] = useState<string>(currentNotes);

  useEffect(() => {
    setEditedNotes(currentNotes);
  }, [currentNotes]);

  if (!word) return null;

  const handleNotesChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setEditedNotes(e.target.value);
  };

  const handleSave = () => {
    onSaveNotes(word.id, editedNotes);
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
        <h2>Notes for: {word.word}</h2>
        
        <div style={{margin: '1.5rem 0'}}>
          <h3>Notes:</h3>
          <textarea
            value={editedNotes}
            onChange={handleNotesChange}
            placeholder="Add notes..."
            style={{width: 'calc(100% - 20px)', minHeight: '80px', padding: '10px', borderRadius: '5px', border: '1px solid #ccc', fontSize: '1rem'}}
          />
        </div>

        <div style={{marginTop: '2rem', display: 'flex', justifyContent: 'space-around'}}>
          <button onClick={onClose} style={{padding: '0.5rem 1rem', backgroundColor: '#ccc', border: 'none', borderRadius: '5px', cursor: 'pointer'}}>Cancel</button>
          <button onClick={handleSave} style={{padding: '0.5rem 1rem', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer'}}>Save Notes</button>
        </div>
      </div>
    </div>
  );
};

export default EditNotesModal;