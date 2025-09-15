import React from 'react';
import Footer from './Footer';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div style={styles.layout}>
      <main style={styles.main}>
        {children}
      </main>
      <Footer />
    </div>
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

export default Layout;
