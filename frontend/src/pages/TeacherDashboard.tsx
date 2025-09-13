import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

interface Student {
  id: string;
  first_name: string;
  last_name: string;
  school?: string;
  date_of_birth?: string;
  claim_code: string;
  created_at: string;
}

function TeacherDashboard() {
  const [students, setStudents] = useState<Student[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch('http://localhost:4001/students')
      .then(response => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.json();
      })
      .then(data => setStudents(data))
      .catch(error => setError(error.message));
  }, []);

  return (
    <div style={{fontFamily: 'sans-serif', padding: '2rem'}}>
      <h1>Teacher Dashboard</h1>
      <div>
        <Link to="/teacher/add-student">
          <button style={{marginBottom: '1rem'}}>Add Student</button>
        </Link>
      </div>
      <h2>Student List</h2>
      {error && <p style={{color: 'red'}}>Error: {error}</p>}
      {students.length > 0 ? (
        <ul>
          {students.map(student => (
            <li key={student.id}>
              <Link to={`/student/${student.id}`}>
                {student.first_name} {student.last_name}
              </Link>
              <span style={{marginLeft: '1rem', fontSize: '0.8em', color: '#666'}}>(Code: {student.claim_code})</span>
            </li>
          ))}
        </ul>
      ) : (
        <p>No students found.</p>
      )}
    </div>
  );
}

export default TeacherDashboard;