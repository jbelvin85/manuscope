import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function AddStudent() {
  const [school, setSchool] = useState<string>('');
  const [firstName, setFirstName] = useState<string>('');
  const [lastName, setLastName] = useState<string>('');
  const [dateOfBirth, setDateOfBirth] = useState<string>('');
  const [claimCode, setClaimCode] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    try {
      const response = await fetch('http://localhost:4001/students', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ school, firstName, lastName, dateOfBirth }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Network response was not ok');
      }
      const data = await response.json();
      setClaimCode(data.claim_code);
      alert(`Student ${data.first_name} ${data.last_name} added successfully! Claim Code: ${data.claim_code}`);
      navigate('/teacher');
    } catch (error: any) {
      console.error('Error adding student:', error);
      alert(`Error adding student: ${error.message}`);
    }
  };

  return (
    <div style={{fontFamily: 'sans-serif', padding: '2rem'}}>
      <h1>Add Student</h1>
      <form onSubmit={handleSubmit}>
        <label>
          School:
          <input type="text" value={school} onChange={(e) => setSchool(e.target.value)} />
        </label>
        <label>
          First Name:
          <input type="text" value={firstName} onChange={(e) => setFirstName(e.target.value)} required />
        </label>
        <label>
          Last Name:
          <input type="text" value={lastName} onChange={(e) => setLastName(e.target.value)} required />
        </label>
        <label>
          Date of Birth:
          <input type="date" value={dateOfBirth} onChange={(e) => setDateOfBirth(e.target.value)} />
        </label>
        <button type="submit">Add Student</button>
      </form>
      {claimCode && (
        <div style={{marginTop: '1rem', padding: '1rem', border: '1px solid green', backgroundColor: '#e6ffe6'}}>
          <p>Student added successfully!</p>
          <p>Claim Code: <strong>{claimCode}</strong></p>
          <p>Please provide this code to the parent.</p>
        </div>
      )}
    </div>
  );
}

export default AddStudent;
