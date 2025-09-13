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

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/teacher" element={<TeacherDashboard />} />
        <Route path="/parent" element={<ParentDashboard />} />
        <Route path="/teacher/add-student" element={<AddStudent />} />
        <Route path="/create-user" element={<CreateUser />} />
        <Route path="/student/:studentId" element={<StudentProfile />} />
        <Route path="/student/:studentId/onboarding" element={<StudentOnboarding />} />
        <Route path="/student/:studentId/review" element={<ReviewSession />} /> {/* Add the new route */}
        <Route path="/flashcards/:studentId" element={<FlashcardSession />} />
      </Routes>
    </Router>
  );
}

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);