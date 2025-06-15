import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaGithub, FaEye, FaRedo, FaCheckCircle, FaTimesCircle } from 'react-icons/fa';
import './AdminPendingTasks.css';

const getStatusBadge = (status) => {
  switch (status) {
    case 'pending':
      return <span className="badge bg-secondary"><FaEye className="me-1" /> Not Submitted</span>;
    case 'submitted':
      return <span className="badge bg-primary"><FaGithub className="me-1" /> Submitted</span>;
    case 'in_progress':
      return <span className="badge bg-warning"><FaRedo className="me-1" /> Rework Required</span>;
    case 'completed':
      return <span className="badge bg-success"><FaCheckCircle className="me-1" /> Completed</span>;
    case 'rejected':
      return <span className="badge bg-danger"><FaTimesCircle className="me-1" /> Rejected</span>;
    default:
      return null;
  }
};

const AdminPendingTasks = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const [reviewStatus, setReviewStatus] = useState('');
  const [feedback, setFeedback] = useState('');

  useEffect(() => {
    fetchPendingTasks();
  }, []);

  const fetchPendingTasks = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Authentication token not found. Please login again.');
        setLoading(false);
        return;
      }

      const response = await axios.get('http://localhost:5000/api/tasks', {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      // Filter tasks that need attention (pending, submitted, or in_progress)
      const pendingTasks = response.data.filter(task => 
        ['pending', 'submitted', 'in_progress'].includes(task.status)
      );

      setTasks(pendingTasks);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching pending tasks:', err);
      setError(err.response?.data?.message || 'Failed to fetch pending tasks');
      setLoading(false);
    }
  };

  const handleReviewClick = (task, submission) => {
    setSelectedTask(task);
    setSelectedSubmission(submission);
    setReviewStatus(submission?.status || '');
    setFeedback(submission?.feedback || '');
    setShowReviewModal(true);
  };

  const handleCloseReviewModal = () => {
    setShowReviewModal(false);
    setSelectedTask(null);
    setSelectedSubmission(null);
    setReviewStatus('');
    setFeedback('');
  };

  const handleSaveReview = async () => {
    if (!selectedTask || !selectedSubmission || !reviewStatus) {
      setError('Please select a review status.');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Authentication token not found. Please login again.');
        return;
      }

      const response = await axios.post(
        `http://localhost:5000/api/tasks/${selectedTask._id}/review/${selectedSubmission.student._id}`,
        {
          status: reviewStatus,
          feedback: feedback || 'No feedback provided'
        },
        {
          headers: { 
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.data) {
        alert('Review saved successfully');
        handleCloseReviewModal();
        fetchPendingTasks(); // Refresh the list
      }
    } catch (err) {
      console.error('Error saving review:', err);
      setError(err.response?.data?.message || 'Failed to save review');
    }
  };

  if (loading) return <div className="loading">Loading...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="container mt-4">
      <h2 className="mb-4">Pending Tasks Review</h2>

      <div className="card mb-4">
        <div className="card-header">
          <h5 className="mb-0">Tasks Awaiting Review or Submission</h5>
        </div>
        <div className="card-body">
          {tasks.length === 0 ? (
            <p>No pending tasks found.</p>
          ) : (
            <div className="table-responsive">
              <table className="table table-striped">
                <thead>
                  <tr>
                    <th>Task Title</th>
                    <th>Student</th>
                    <th>Status</th>
                    <th>Due Date</th>
                    <th>GitHub Link</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {tasks.map(task => (
                    task.submissions.map(submission => (
                      <tr key={`${task._id}_${submission.student._id}`}>
                        <td>{task.title}</td>
                        <td>{submission.student.name}</td>
                        <td>{getStatusBadge(submission.status)}</td>
                        <td>{new Date(task.deadline).toLocaleDateString()}</td>
                        <td>
                          {submission.githubLink ? (
                            <a href={submission.githubLink} target="_blank" rel="noopener noreferrer">
                              View Submission
                            </a>
                          ) : (
                            'N/A'
                          )}
                        </td>
                        <td>
                          <button
                            className="btn btn-sm btn-primary me-2"
                            onClick={() => handleReviewClick(task, submission)}
                            disabled={!submission.githubLink}
                          >
                            Review
                          </button>
                        </td>
                      </tr>
                    ))
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Review Modal */}
      {selectedTask && selectedSubmission && (
        <div className={`modal fade ${showReviewModal ? 'show d-block' : ''}`} tabIndex="-1" role="dialog">
          <div className="modal-dialog" role="document">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Review Task: {selectedTask.title}</h5>
                <button type="button" className="btn-close" aria-label="Close" onClick={handleCloseReviewModal}></button>
              </div>
              <div className="modal-body">
                <p><strong>Student:</strong> {selectedSubmission.student.name}</p>
                <p><strong>Due Date:</strong> {new Date(selectedTask.deadline).toLocaleDateString()}</p>
                <p><strong>Current Status:</strong> {getStatusBadge(selectedSubmission.status)}</p>
                <p>
                  <strong>GitHub Link:</strong>
                  {selectedSubmission.githubLink ? (
                    <a href={selectedSubmission.githubLink} target="_blank" rel="noopener noreferrer" className="ms-2">
                      {selectedSubmission.githubLink}
                    </a>
                  ) : (
                    ' N/A'
                  )}
                </p>
                <hr/>
                <div className="mb-3">
                  <h6>Review Status</h6>
                  <div className="form-check form-check-inline">
                    <input 
                      className="form-check-input" 
                      type="radio" 
                      name="reviewStatus" 
                      id="statusApproved" 
                      value="approved" 
                      checked={reviewStatus === 'approved'} 
                      onChange={(e) => setReviewStatus(e.target.value)}
                    />
                    <label className="form-check-label" htmlFor="statusApproved">Approved</label>
                  </div>
                  <div className="form-check form-check-inline">
                    <input 
                      className="form-check-input" 
                      type="radio" 
                      name="reviewStatus" 
                      id="statusRejected" 
                      value="rejected" 
                      checked={reviewStatus === 'rejected'} 
                      onChange={(e) => setReviewStatus(e.target.value)}
                    />
                    <label className="form-check-label" htmlFor="statusRejected">Rejected</label>
                  </div>
                  <div className="form-check form-check-inline">
                    <input 
                      className="form-check-input" 
                      type="radio" 
                      name="reviewStatus" 
                      id="statusInProgress" 
                      value="in_progress" 
                      checked={reviewStatus === 'in_progress'} 
                      onChange={(e) => setReviewStatus(e.target.value)}
                    />
                    <label className="form-check-label" htmlFor="statusInProgress">Rework Required</label>
                  </div>
                </div>
                <div className="mb-3">
                  <label htmlFor="feedbackTextarea" className="form-label">Feedback</label>
                  <textarea 
                    className="form-control" 
                    id="feedbackTextarea" 
                    rows="3" 
                    value={feedback} 
                    onChange={(e) => setFeedback(e.target.value)}
                    placeholder="Provide feedback for the student..."
                  ></textarea>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={handleCloseReviewModal}>Cancel</button>
                <button type="button" className="btn btn-primary" onClick={handleSaveReview}>Save Review</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showReviewModal && <div className="modal-backdrop fade show"></div>}
    </div>
  );
};

export default AdminPendingTasks; 