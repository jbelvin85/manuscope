import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext'; // Assuming useAuth might need to refresh student list

const ClaimStudent: React.FC = () => {
  const [claimCode, setClaimCode] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const navigate = useNavigate();
  const { login, userRole } = useAuth(); // Use login to refresh context if needed

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setSuccessMessage(null);

    if (!claimCode) {
      setError('Please enter a claim code.');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Authentication token not found. Please log in again.');
        navigate('/login');
        return;
      }

      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/students/claim`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ claim_code: claimCode }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to claim student.');
      }

      setSuccessMessage('Student claimed successfully! Redirecting to dashboard...');
      // Re-login to refresh the AuthContext with the newly claimed student
      // This assumes the login function can re-fetch student data
      if (userRole && token) {
        await login(userRole, token);
      }
      setTimeout(() => navigate('/parent'), 2000); // Redirect to parent dashboard after a delay
    } catch (err: any) {
      console.error('Error claiming student:', err);
      setError(`Error claiming student: ${err.message}`);
    }
  };

  return (
    <div style={{ fontFamily: 'sans-serif', padding: '2rem', maxWidth: '400px', margin: 'auto' }}>
      <h1>Claim Student</h1>
      <p>Enter the claim code provided by your child's teacher to associate them with your account.</p>
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '1rem' }}>
          <label htmlFor="claimCode" style={{ display: 'block', marginBottom: '0.5rem' }}>Claim Code:</label>
          <input
            type="text"
            id="claimCode"
            value={claimCode}
            onChange={(e) => setClaimCode(e.target.value)}
            required
            style={{ width: 'calc(100% - 1rem)', padding: '0.5rem', borderRadius: '4px', border: '1px solid #ddd' }}
          />
        </div>
        {error && <p style={{ color: 'red', marginBottom: '1rem' }}>{error}</p>}
        {successMessage && <p style={{ color: 'green', marginBottom: '1rem' }}>{successMessage}</p>}
        <button
          type="submit"
          style={{
            width: '100%',
            padding: '0.75rem',
            fontSize: '1rem',
            backgroundColor: '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Claim Student
        </button>
      </form>
    </div>
  );
};

export default ClaimStudent;