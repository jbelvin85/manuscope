import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import Footer from './Footer';

interface LayoutContextType {
  isReviewSessionActive: boolean;
  setReviewSessionActive: (isActive: boolean) => void;
}

const LayoutContext = createContext<LayoutContextType | undefined>(undefined);

export const useLayout = () => {
  const context = useContext(LayoutContext);
  if (context === undefined) {
    throw new Error('useLayout must be used within a LayoutProvider');
  }
  return context;
};

interface LayoutProps {
  children: React.ReactNode;
}

export const LayoutProvider: React.FC<LayoutProps> = ({ children }) => {
  const [isReviewSessionActive, setReviewSessionActive] = useState(false);

  useEffect(() => {
    if (isReviewSessionActive) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = ''; // Reset to default
    }
    // Cleanup function
    return () => {
      document.body.style.overflow = '';
    };
  }, [isReviewSessionActive]);

  return (
    <LayoutContext.Provider value={{ isReviewSessionActive, setReviewSessionActive }}>
      <div style={styles.layout}>
        <main style={styles.main}>
          {children}
        </main>
        <Footer />
      </div>
    </LayoutContext.Provider>
  );
};

const styles = {
  layout: {
    display: 'flex',
    flexDirection: 'column' as 'column',
    minHeight: '100vh',
  },
  main: {
    flex: 1,
    paddingBottom: '60px', // Adjust this value to match the footer's height
  },
};

export default LayoutProvider;