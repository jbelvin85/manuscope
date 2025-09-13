import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './AddStudent.css'; // Import the CSS file

function AddStudent() {
  const [school, setSchool] = useState<string>('');
  const [firstName, setFirstName] = useState<string>('');
  const [lastName, setLastName] = useState<string>('');
  const [dateOfBirth, setDateOfBirth] = useState<string>('');
  const [claimCode, setClaimCode] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null); // State for error messages
  const navigate = useNavigate();

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null); // Clear previous errors
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
      // alert(`Student ${data.first_name} ${data.last_name} added successfully! Claim Code: ${data.claim_code}`);
      // navigate('/teacher'); // Navigate after successful addition and claim code display
    } catch (err: any) {
      console.error('Error adding student:', err);
      setError(`Error adding student: ${err.message}`);
    }
  };

  return (
    <div className="add-student-container">
      <h1>Add Student</h1>
      {error && <div className="error-message">{error}</div>}
      {error && <div className="error-message">{error}</div>}
      <form onSubmit={handleSubmit} className="add-student-form">
        <label>
          School:
          <input type="text" value={school} onChange={(e) => setSchool(e.target.value)} autocomplete="organization" />
        </label>
        <label>
          First Name:
          <input type="text" value={firstName} onChange={(e) => setFirstName(e.target.value)} required autocomplete="given-name" />
        </label>
        <label>
          Last Name:
          <input type="text" value={lastName} onChange={(e) => setLastName(e.target.value)} required autocomplete="family-name" />
        </label>
        <label>
          Date of Birth:
          <input type="date" value={dateOfBirth} onChange={(e) => setDateOfBirth(e.target.value)} autocomplete="bday" />
        </label>
        <button type="submit">Add Student</button>
      </form>
      {claimCode && (
        <div className="claim-code-display">
          <p>Student added successfully!</p>
          <p>Claim Code: <strong>{claimCode}</strong></p>
          <p>Please provide this code to the parent.</p>
          <button onClick={() => navigate('/teacher')}>Go to Teacher Dashboard</button>
        </div>
      )}
    </div>
  );
}

export default AddStudent;
