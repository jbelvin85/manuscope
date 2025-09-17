import StudentOnboarding from './pages/StudentOnboarding'; // Import new component
import ClaimStudent from './pages/ClaimStudent'; // Import the new ClaimStudent component
import ProgressReports from './pages/ProgressReports'; // Import the new ProgressReports component
import Review from './pages/Review'; // Import the new Review component
import Dictionary from './pages/Dictionary'; // Import the new Dictionary component

import Login from './pages/Login';
import TeacherDashboard from './pages/TeacherDashboard';
import ParentDashboard from './pages/ParentDashboard';
import AddStudent from './pages/AddStudent';
import CreateUser from './pages/CreateUser';
import StudentProfile from './pages/StudentProfile';
import FlashcardSession from './pages/FlashcardSession';
import ReviewSession from './pages/ReviewSession'; // Import the new component
import { LayoutProvider } from './components/Layout'; // Import LayoutProvider
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute'; // Import ProtectedRoute

import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

function App() {
  return (
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/create-user" element={<CreateUser />} />
        <Route
          path="/teacher"
          element={<ProtectedRoute allowedRoles={['teacher']}><TeacherDashboard /></ProtectedRoute>}
        />
        <Route
          path="/parent"
          element={<ProtectedRoute allowedRoles={['parent']}><ParentDashboard /></ProtectedRoute>}
        />
        <Route
          path="/teacher/add-student"
          element={<ProtectedRoute allowedRoles={['teacher']}><AddStudent /></ProtectedRoute>}
        />
        <Route
          path="/claim-student" // New route for claiming students
          element={<ProtectedRoute allowedRoles={['parent']}><ClaimStudent /></ProtectedRoute>}
        />
        <Route
          path="/student/:studentId"
          element={<ProtectedRoute allowedRoles={['teacher', 'parent']}><StudentProfile /></ProtectedRoute>}
        />
        <Route
          path="/student/:studentId/onboarding"
          element={<ProtectedRoute allowedRoles={['teacher', 'parent']}><StudentOnboarding /></ProtectedRoute>}
        />
        <Route
          path="/student/:studentId/review"
          element={<ProtectedRoute allowedRoles={['teacher', 'parent']}><ReviewSession /></ProtectedRoute>}
        />
        <Route
          path="/flashcards/:studentId"
          element={<ProtectedRoute allowedRoles={['teacher', 'parent']}><FlashcardSession /></ProtectedRoute>}
        />
        <Route
          path="/progress-reports/:studentId" // New route for progress reports
          element={<ProtectedRoute allowedRoles={['teacher', 'parent']}><ProgressReports /></ProtectedRoute>}
        />
        <Route
          path="/review" // New route for review page
          element={<ProtectedRoute allowedRoles={['teacher', 'parent']}><Review /></ProtectedRoute>}
        />
        <Route
          path="/dictionary" // New route for dictionary page
          element={<ProtectedRoute allowedRoles={['teacher', 'parent']}><Dictionary /></ProtectedRoute>}
        />
      </Routes>
  );
}

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <Router>
      <AuthProvider>
        <LayoutProvider>
          <App />
        </LayoutProvider>
      </AuthProvider>
    </Router>
  </React.StrictMode>
);