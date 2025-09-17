import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: string[];
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, allowedRoles }) => {
  const { isAuthenticated, userRole } = useAuth();

  if (!isAuthenticated) {
    // User is not authenticated, redirect to login page
    return <Navigate to="/" replace />;
  }

  if (allowedRoles && userRole && !allowedRoles.includes(userRole)) {
    // User is authenticated but does not have an allowed role, redirect to a forbidden page or home
    // For now, let's redirect to the login page as a generic fallback
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
