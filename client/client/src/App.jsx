import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import AdminLogin from './pages/AdminLogin';
import AdminDashboard from './pages/AdminDashboard';
import AdminStudentManagement from './pages/AdminStudentManagement';
import AdminCategorization from './pages/AdminCategorization';
import AdminTaskAssignment from './pages/AdminTaskAssignment';
import AdminTaskReview from './pages/AdminTaskReview';
import MessagingSystem from './pages/MessagingSystem';
import Portfolio from './pages/Portfolio';
import AdminPendingTasks from './pages/AdminPendingTasks';
import AdminPortfolioReview from './pages/AdminPortfolioReview';
import StudentTaskSubmission from './pages/StudentTaskSubmission';
import StudentReporting from './pages/StudentReporting';
import PublicLandingPage from './pages/PublicLandingPage';
import './App.css';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<PublicLandingPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/student/tasks/:taskId/submit" element={<StudentTaskSubmission />} />
        <Route path="/messages" element={<MessagingSystem />} />
        <Route path="/portfolio" element={<Portfolio />} />
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        <Route path="/admin/students" element={<AdminStudentManagement />} />
        <Route path="/admin/categorization" element={<AdminCategorization />} />
        <Route path="/admin/task-assignment" element={<AdminTaskAssignment />} />
        <Route path="/admin/task-review" element={<AdminTaskReview />} />
        <Route path="/admin/messages" element={<MessagingSystem />} />
        <Route path="/admin/pending-tasks" element={<AdminPendingTasks />} />
        <Route path="/admin/portfolio-review" element={<AdminPortfolioReview />} />
        <Route path="/admin/reporting" element={<StudentReporting />} />
      </Routes>
    </Router>
  );
}

export default App;