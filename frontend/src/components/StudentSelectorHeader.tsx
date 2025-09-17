import React from 'react';
import { useAuth } from '../contexts/AuthContext';

interface Student {
  id: string;
  first_name: string;
  last_name: string;
  date_of_birth?: string;
  avatar_url?: string;
}

interface StudentSelectorHeaderProps {
  students: Student[];
  selectedStudent: Student | null;
  onStudentChange: (student: Student | null) => void;
}

const StudentSelectorHeader: React.FC<StudentSelectorHeaderProps> = ({ students, selectedStudent, onStudentChange }) => {
  const { user, userRole } = useAuth();

  const formatDate = (dateString?: string) => !dateString ? 'N/A' : new Date(dateString).toISOString().split('T')[0];

  if (!selectedStudent) {
    return (
      <header style={{
        position: 'sticky',
        top: 0,
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        backdropFilter: 'blur(10px)',
        zIndex: 100,
        padding: '1rem 2rem',
        borderBottom: '1px solid #eee',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        <div style={{ marginBottom: '1rem', textAlign: 'center' }}>
          <label htmlFor="student-select" style={{ marginRight: '1rem', fontWeight: 'bold' }}>Select Student:</label>
          <select
            id="student-select"
            value={selectedStudent?.id || ''}
            onChange={(e) => {
              const studentId = e.target.value;
              const student = students.find(s => s.id === studentId);
              onStudentChange(student || null);
            }}
            style={{ padding: '0.5rem', borderRadius: '4px', border: '1px solid #ddd' }}
          >
            <option value="">-- Select a student --</option>
            {students.map(s => (
              <option key={s.id} value={s.id}>{s.first_name} {s.last_name}</option>
            ))}
          </select>
        </div>
      </header>
    );
  }

  return (
    <header style={{
      position: 'sticky',
      top: 0,
      backgroundColor: 'rgba(255, 255, 255, 0.9)',
      backdropFilter: 'blur(10px)',
      zIndex: 100,
      padding: '1rem 2rem',
      borderBottom: '1px solid #eee',
      boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
    }}>
      <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
          <h1 style={{margin: 0}}>{selectedStudent.first_name} {selectedStudent.last_name}</h1>
          <img src={selectedStudent.avatar_url || '/resources/img/default_user.png'} alt="Student Avatar" style={{width: '60px', height: '60px', borderRadius: '50%', objectFit: 'cover'}} />
      </div>
      <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.5rem'}}>
          <p style={{margin: 0, color: '#555'}}><strong>DOB:</strong> {formatDate(selectedStudent.date_of_birth)}</p>
          {userRole === 'teacher' && user && (
            <p style={{margin: 0, color: '#555'}}><strong>Teacher:</strong> {user.first_name} {user.last_name}</p>
          )}
      </div>
      <button
        onClick={() => onStudentChange(null)}
        style={{
          marginTop: '1rem',
          padding: '0.5rem 1rem',
          fontSize: '0.8rem',
          backgroundColor: '#f0f0f0',
          color: '#333',
          border: '1px solid #ccc',
          borderRadius: '4px',
          cursor: 'pointer',
        }}
      >
        Change Student
      </button>
    </header>
  );
};

export default StudentSelectorHeader;