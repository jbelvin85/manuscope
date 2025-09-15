import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import StudentOnboarding from './pages/StudentOnboarding'; // Import new component

import Login from './pages/Login';
import TeacherDashboard from './pages/TeacherDashboard';
import ParentDashboard from './pages/ParentDashboard';
import AddStudent from './pages/AddStudent';
import CreateUser from './pages/CreateUser';
import StudentProfile from './pages/StudentProfile';
import FlashcardSession from './pages/FlashcardSession';
import ReviewSession from './pages/ReviewSession'; // Import the new component
import Layout from './components/Layout';
import { AuthProvider } from './contexts/AuthContext';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/create-user" element={<CreateUser />} />
        <Route
          path="/teacher"
          element={<Layout><TeacherDashboard /></Layout>}
        />
        <Route
          path="/parent"
          element={<Layout><ParentDashboard /></Layout>}
        />
        <Route
          path="/teacher/add-student"
          element={<Layout><AddStudent /></Layout>}
        />
        <Route
          path="/student/:studentId"
          element={<Layout><StudentProfile /></Layout>}
        />
        <Route
          path="/student/:studentId/onboarding"
          element={<Layout><StudentOnboarding /></Layout>}
        />
        <Route
          path="/student/:studentId/review"
          element={<Layout><ReviewSession /></Layout>}
        />
        <Route
          path="/flashcards/:studentId"
          element={<Layout><FlashcardSession /></Layout>}
        />
      </Routes>
    </Router>
  );
}

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <AuthProvider>
      <App />
    </AuthProvider>
  </React.StrictMode>
);