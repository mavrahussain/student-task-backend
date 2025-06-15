import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import StudentLoginPage from './pages/StudentLoginPage';
import MessagingSystem from './pages/MessagingSystem';
import AdminLoginPage from './pages/AdminLoginPage';
import AdminDashboard from './pages/AdminDashboard';
import AdminTaskAssignment from './pages/AdminTaskAssignment';
import Portfolio from './pages/Portfolio';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/student/login" element={<StudentLoginPage />} />
        <Route path="/messages" element={<MessagingSystem />} />
        <Route path="/admin/login" element={<AdminLoginPage />} />
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        <Route path="/admin/assign-task" element={<AdminTaskAssignment />} />
        <Route path="/portfolio" element={<Portfolio />} />
        {/* Add more routes here */}
      </Routes>
    </Router>
  );
}

export default App;
