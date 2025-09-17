import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import './Footer.css';

const Footer: React.FC = () => {
  const { userRole, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const renderParentLinks = () => (
    <>
      <Link to="/parent" className="link">Dashboard</Link>
      <Link to="/review" className="link">Review</Link>
      <button onClick={handleLogout} className="button">Logout</button>
    </>
  );

  const renderTeacherLinks = () => (
    <>
      <Link to="/teacher" className="link">Dashboard</Link>
      <Link to="/teacher" className="link">Students</Link>
      <button onClick={handleLogout} className="button">Logout</button>
    </>
  );

  return (
    <footer className="footer">
      <nav className="nav">
        {userRole === 'parent' ? renderParentLinks() : renderTeacherLinks()}
      </nav>
    </footer>
  );
};

export default Footer;