import React, { createContext, useState, useContext, ReactNode } from 'react';

interface Student {
  id: string;
  first_name: string;
  last_name: string;
  // Add other relevant student properties as needed for the dashboard
}

interface AuthContextType {
  isAuthenticated: boolean;
  userRole: string | null;
  students: Student[] | null; // Added for parent's students
  login: (role: string, token: string) => Promise<void>; // Changed to return Promise<void>
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => !!localStorage.getItem('token'));
  const [userRole, setUserRole] = useState<string | null>(() => localStorage.getItem('userRole'));
  const [students, setStudents] = useState<Student[] | null>(null); // New state for students

  const login = async (role: string, token: string) => { // Made async
    localStorage.setItem('token', token);
    localStorage.setItem('userRole', role);
    setIsAuthenticated(true);
    setUserRole(role);

    if (role === 'parent') {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/parent/students`, { // New API endpoint
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
        if (!response.ok) {
          throw new Error('Failed to fetch students');
        }
        const studentData: Student[] = await response.json();
        setStudents(studentData);
      } catch (error) {
        console.error('Error fetching students for parent:', error);
        setStudents([]); // Set to empty array on error
      }
    } else {
      setStudents(null); // Clear students if not a parent
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userRole');
    setIsAuthenticated(false);
    setUserRole(null);
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, userRole, students, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
