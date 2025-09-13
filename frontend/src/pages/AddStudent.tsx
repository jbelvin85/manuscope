import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Modal from '../components/Modal'; // Import the new Modal component
import './AddStudent.css'; // Import the CSS file

function AddStudent() {
  const [school, setSchool] = useState<string>('');
  const [firstName, setFirstName] = useState<string>('');
  const [lastName, setLastName] = useState<string>('');
  const [dateOfBirth, setDateOfBirth] = useState<string>('');
  const [claimCode, setClaimCode] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null); // State for error messages
  const [showModal, setShowModal] = useState<boolean>(false); // State to control modal visibility
  const navigate = useNavigate();

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null); // Clear previous errors
    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/students`, {
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
      setShowModal(true); // Show the modal on successful student addition
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
        <Modal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          title="Student Added Successfully!"
        >
          <p>Claim Code: <strong>{claimCode}</strong></p>
          <p>Please provide this code to the parent.</p>
          <button onClick={() => {
            setShowModal(false); // Close modal
            navigate('/teacher'); // Navigate after closing
          }} style={{
            padding: '0.75rem 1.5rem',
            backgroundColor: '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer',
            fontSize: '1rem',
            marginTop: '1rem',
          }}>Go to Teacher Dashboard</button>
        </Modal>
      )}
    </div>
  );
}

export default AddStudent;
