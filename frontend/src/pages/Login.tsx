import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    try {
      const response = await fetch('http://localhost:4001/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Login failed');
      }

      const data = await response.json();
      if (data.role === 'teacher') {
        navigate('/teacher');
      } else if (data.role === 'parent') {
        navigate('/parent');
      } else {
        throw new Error('Unknown user role');
      }
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div style={{fontFamily: 'sans-serif', padding: '2rem', maxWidth: '400px', margin: 'auto'}}>
      <h1>Login</h1>
      <form onSubmit={handleSubmit}>
        <div style={{marginBottom: '1rem'}}>
          <label>Email:</label>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required style={{width: '100%', padding: '0.5rem'}} />
        </div>
        <div style={{marginBottom: '1rem'}}>
          <label>Password:</label>
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required style={{width: '100%', padding: '0.5rem'}} />
        </div>
        {error && <p style={{color: 'red'}}>{error}</p>}
        <button type="submit" style={{width: '100%', padding: '0.75rem', fontSize: '1rem'}}>Login</button>
      </form>
      <p style={{textAlign: 'center', marginTop: '1rem'}}>
        Don't have an account? <a href="/create-user">Create one</a>
      </p>
    </div>
  );
}

export default Login;
