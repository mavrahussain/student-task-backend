import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios'; // Import axios
import TaskPanel from '../components/TaskPanel';
import NotificationBadge from '../components/NotificationBadge'; // Import NotificationBadge
import { FaGithub, FaLinkedin, FaCheck, FaHourglassHalf, FaTimesCircle, FaBullhorn, FaEye, FaRedo, FaUser, FaEnvelope } from 'react-icons/fa';
import './Dashboard.css'; // Changed to Dashboard.css as it's more appropriate

// Helper function to get status badge
const getStatusBadge = (status) => {
  switch (status) {
    case 'pending':
      return <span className="badge bg-secondary"><FaEye className="me-1" /> Not Submitted</span>;
    case 'submitted':
      return <span className="badge bg-info"><FaGithub className="me-1" /> Submitted</span>;
    case 'in_progress':
      return <span className="badge bg-warning"><FaRedo className="me-1" /> Try Again</span>;
    case 'approved':
      return <span className="badge bg-success"><FaCheck className="me-1" /> Satisfied</span>;
    case 'rejected':
      return <span className="badge bg-danger"><FaTimesCircle className="me-1" /> Rejected</span>;
    case 'not_submitted':
      return <span className="badge bg-light text-dark"><FaEye className="me-1" /> Not Submitted Yet</span>;
    default:
      return <span className="badge bg-light text-dark">N/A</span>;
  }
};

const Dashboard = () => {
  const navigate = useNavigate();
  const [student, setStudent] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Function to fetch tasks for the logged-in student
  const fetchTasks = async (studentId) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Authentication token not found.');
        setLoading(false);
        return;
      }

      // Fetch tasks assigned to this specific student
      const response = await axios.get('http://localhost:5000/api/tasks', {
        headers: { 'Authorization': `Bearer ${token}` },
        params: { assignedTo: studentId } // Filter tasks by studentId
      });
      setTasks(response.data);
    } catch (err) {
      console.error('Error fetching tasks for student:', err);
      setError(err.response?.data?.message || 'Failed to fetch assigned tasks.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    const studentData = localStorage.getItem('student');
    
    if (!token || !studentData) {
      navigate('/login');
      return;
    }

    const parsedStudent = JSON.parse(studentData);
    setStudent(parsedStudent);

    if (parsedStudent?.studentId) {
      fetchTasks(parsedStudent.studentId);
    } else {
      setError('Student ID not found in local storage or is invalid.');
      setLoading(false);
    }

  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('student');
    localStorage.removeItem('userRole');
    navigate('/login');
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: '100vh' }}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return <div className="container mt-4"><div className="alert alert-danger">Error: {error}</div></div>;
  }

  // Helper to get a student's specific task status based on submission
  const getStudentTaskStatus = (task, studentId) => {
    const submission = task.submissions.find(sub => sub.student?._id === studentId);
    return submission ? submission.status : 'not_submitted';
  };

  // Filter tasks based on their *latest submission status* for the current student
  const actionRequiredTasks = tasks.filter(task => {
    const status = getStudentTaskStatus(task, student._id);
    // A task requires action if it's not submitted, requires rework, or was rejected.
    return ['in_progress', 'rejected', 'not_submitted'].includes(status);
  });

  const completedTasks = tasks.filter(task => {
    const status = getStudentTaskStatus(task, student._id);
    return ['approved'].includes(status);
  });

  // Sort upcoming deadlines by due date
  const upcomingDeadlines = tasks
    .filter(task => {
      const status = getStudentTaskStatus(task, student._id);
      return ['not_submitted', 'submitted', 'in_progress', 'rejected'].includes(status);
    })
    .sort((a, b) => new Date(a.deadline) - new Date(b.deadline))
    .slice(0, 3);

  return (
    <div className="container mt-4">
      <nav className="navbar navbar-expand-lg navbar-dark bg-primary">
        <div className="container">
          <a className="navbar-brand" href="#">Student Portal</a>
          <ul className="navbar-nav ms-auto">
            <li className="nav-item">
              <Link className="nav-link" to="/portfolio">Public Portfolio</Link>
            </li>
            <NotificationBadge />
            <li className="nav-item">
              <button className="btn btn-outline-light" onClick={handleLogout}>Logout</button>
            </li>
          </ul>
        </div>
      </nav>

      <div className="container mt-4">
        <div className="row">
          <div className="col-md-12">
            <div className="welcome-card p-4 mb-4">
              <h2>Welcome, {student?.name || 'Student'}!</h2>
              <p className="text-muted">Your Category: {student?.category || 'Not Assigned'}</p>
              <p className="text-muted">Here's an overview of your tasks and progress</p>
            </div>
          </div>
        </div>

        <div className="row">
          <div className="col-md-6">
            <div className="card mb-4">
              <div className="card-header bg-primary text-white">
                <h5 className="mb-0">Action Required Tasks</h5>
              </div>
              <div className="card-body">
                {actionRequiredTasks.length === 0 ? (
                  <p>No action required tasks at the moment.</p>
                ) : (
                  actionRequiredTasks.map(task => {
                    const latestSubmission = task.submissions.find(
                      sub => sub.student?._id === student?._id
                    );
                    const currentStatus = latestSubmission ? latestSubmission.status : 'not_submitted';
                    const showResubmitButton = ['in_progress', 'rejected'].includes(currentStatus) || currentStatus === 'not_submitted';

                    return (
                      <div key={task._id} className="task-item mb-3">
                        <h6>{task.title}</h6>
                        <p className="text-muted mb-0">Due: {new Date(task.deadline).toLocaleDateString()}</p>
                        {getStatusBadge(currentStatus)}
                        <p>{task.description}</p>
                        {latestSubmission && latestSubmission.feedback && (
                          <div className="alert alert-info mt-2"><strong>Admin Feedback:</strong> {latestSubmission.feedback}</div>
                        )}
                        <Link to={`/student/tasks/${task._id}/submit`} className="btn btn-sm btn-primary mt-2">
                          {showResubmitButton ? 'Submit/Resubmit Task' : 'View Task'}
                        </Link>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>

          <div className="col-md-6">
            <div className="card mb-4">
              <div className="card-header bg-success text-white">
                <h5 className="mb-0">Completed Tasks</h5>
              </div>
              <div className="card-body">
                {completedTasks.length === 0 ? (
                  <p>No completed tasks yet.</p>
                ) : (
                  completedTasks.map(task => {
                    const latestSubmission = task.submissions.find(
                      sub => sub.student?._id === student?._id
                    );

                    return (
                      <div key={task._id} className="task-item mb-3">
                        <h6>{task.title}</h6>
                        <p className="text-muted mb-0">Status: {getStatusBadge(latestSubmission?.status || 'N/A')}</p>
                        <p>{task.description}</p>
                        {latestSubmission && latestSubmission.feedback && (
                          <div className="alert alert-info mt-2"><strong>Admin Feedback:</strong> {latestSubmission.feedback}</div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="row">
          <div className="col-md-12">
            <div className="card">
              <div className="card-header bg-warning text-dark">
                <h5 className="mb-0">Upcoming Deadlines</h5>
              </div>
              <div className="card-body">
                {upcomingDeadlines.length === 0 ? (
                  <p>No upcoming deadlines.</p>
                ) : (
                  upcomingDeadlines.map(task => (
                    <div key={task._id} className="task-item mb-3">
                      <h6>{task.title}</h6>
                      <p className="text-muted mb-0">Due: {new Date(task.deadline).toLocaleDateString()}</p>
                      {getStatusBadge(getStudentTaskStatus(task, student._id))}
                      <p>{task.description}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="row">
          <div className="col-md-4">
            <div className="card mb-4">
              <div className="card-body">
                <h5 className="card-title">Quick Links</h5>
                <div className="list-group">
                  <Link to="/portfolio" className="list-group-item list-group-item-action">
                    <FaUser className="me-2" /> View My Portfolio
                  </Link>
                  <Link to="/messages" className="list-group-item list-group-item-action">
                    <FaEnvelope className="me-2" /> Messages
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;