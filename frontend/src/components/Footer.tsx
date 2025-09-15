import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import './Footer.css';

const Footer: React.FC = () => {
  const { userRole, logout } = useAuth();
  const navigate = useNavigate();

  const dashboardPath = userRole === 'teacher' ? '/teacher' : '/parent';

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  // Determine the student link based on the user's role
  const getStudentLink = () => {
    if (userRole === 'teacher') {
      return '/teacher'; // Teachers go to their dashboard to see all students
    } else if (userRole === 'parent') {
      // Parents might go to a specific child's profile, but for now, dashboard is fine
      return '/parent'; 
    }
    return '/'; // Fallback
  };

  return (
    <footer className="footer">
      <nav className="nav">
        <Link to={dashboardPath} className="link">Dashboard</Link>
        <Link to={getStudentLink()} className="link">Students</Link>
        <button onClick={handleLogout} className="button">Logout</button>
      </nav>
    </footer>
  );
};

export default Footer;
