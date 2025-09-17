import React, { createContext, useState, useContext, ReactNode } from 'react';

interface User {
  id: number;
  first_name: string;
  last_name: string;
}

interface Student {
  id: string;
  first_name: string;
  last_name: string;
  date_of_birth?: string;
  avatar_url?: string;
}

interface AuthContextType {
  isAuthenticated: boolean;
  userRole: string | null;
  user: User | null;
  students: Student[] | null;
  login: (role: string, token: string, user: User) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => !!localStorage.getItem('token'));
  const [userRole, setUserRole] = useState<string | null>(() => localStorage.getItem('userRole'));
  const [user, setUser] = useState<User | null>(() => {
    const storedUser = localStorage.getItem('user');
    return storedUser ? JSON.parse(storedUser) : null;
  });
  const [students, setStudents] = useState<Student[] | null>(null);

  const login = async (role: string, token: string, userData: User) => {
    localStorage.setItem('token', token);
    localStorage.setItem('userRole', role);
    localStorage.setItem('user', JSON.stringify(userData));
    setIsAuthenticated(true);
    setUserRole(role);
    setUser(userData);

    if (role === 'parent') {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/parent/students`, {
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
        setStudents([]);
      }
    } else {
      setStudents(null);
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userRole');
    localStorage.removeItem('user');
    setIsAuthenticated(false);
    setUserRole(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, userRole, user, students, login, logout }}>
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