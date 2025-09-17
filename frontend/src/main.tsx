import StudentOnboarding from './pages/StudentOnboarding'; // Import new component
import ClaimStudent from './pages/ClaimStudent'; // Import the new ClaimStudent component
import ProgressReports from './pages/ProgressReports'; // Import the new ProgressReports component
import Review from './pages/Review'; // Import the new Review component

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
          element={<TeacherDashboard />}
        />
        <Route
          path="/parent"
          element={<ParentDashboard />}
        />
        <Route
          path="/teacher/add-student"
          element={<AddStudent />}
        />
        <Route
          path="/claim-student" // New route for claiming students
          element={<ClaimStudent />}
        />
        <Route
          path="/student/:studentId"
          element={<StudentProfile />}
        />
        <Route
          path="/student/:studentId/onboarding"
          element={<StudentOnboarding />}
        />
        <Route
          path="/student/:studentId/review"
          element={<ReviewSession />}
        />
        <Route
          path="/flashcards/:studentId"
          element={<FlashcardSession />}
        />
        <Route
          path="/progress-reports/:studentId" // New route for progress reports
          element={<ProgressReports />}
        />
        <Route
          path="/review" // New route for review page
          element={<Review />}
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