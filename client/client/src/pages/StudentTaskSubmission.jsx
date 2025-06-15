import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './Dashboard.css'; // Assuming some shared styling with Dashboard

const StudentTaskSubmission = () => {
  const { taskId } = useParams();
  const navigate = useNavigate();
  const [task, setTask] = useState(null);
  const [githubLink, setGithubLink] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  useEffect(() => {
    const fetchTask = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          navigate('/login');
          return;
        }
        const response = await axios.get(`/api/tasks/${taskId}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        setTask(response.data);
      } catch (err) {
        console.error('Error fetching task details:', err);
        setError(err.response?.data?.message || 'Failed to fetch task details.');
      } finally {
        setLoading(false);
      }
    };

    fetchTask();
  }, [taskId, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    setSuccessMessage(null);

    if (!githubLink) {
      setError('GitHub link is required.');
      setSubmitting(false);
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(`http://localhost:5000/api/tasks/${taskId}/submit`, { githubLink }, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setSuccessMessage('Task submitted successfully. Waiting for admin review.');
      setGithubLink(''); // Clear the input
      // Navigate back to dashboard after a short delay
      setTimeout(() => {
        navigate('/dashboard');
      }, 2000);
    } catch (err) {
      console.error('Error submitting task:', err);
      setError(err.response?.data?.message || 'Failed to submit task.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="loading">Loading task...</div>;
  }

  if (error && !task) {
    return <div className="error-message">Error: {error}</div>;
  }

  if (!task) {
    return <div className="no-task">Task not found or inaccessible.</div>;
  }

  return (
    <div className="container mt-4">
      <div className="card">
        <div className="card-header bg-primary text-white">
          <h3>Submit Task: {task.title}</h3>
        </div>
        <div className="card-body">
          <p><strong>Description:</strong> {task.description}</p>
          <p><strong>Requirements:</strong> {task.requirements}</p>
          <p><strong>Deadline:</strong> {new Date(task.deadline).toLocaleDateString()}</p>
          
          {/* Show current submission status if exists */}
          {task.submissions && task.submissions.length > 0 && (
            <div className="alert alert-info">
              <strong>Current Status:</strong> {task.submissions[0].status}
              {task.submissions[0].feedback && (
                <div className="mt-2">
                  <strong>Admin Feedback:</strong> {task.submissions[0].feedback}
                </div>
              )}
            </div>
          )}

          {successMessage && (
            <div className="alert alert-success">{successMessage}</div>
          )}
          {error && (
            <div className="alert alert-danger">{error}</div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="form-group mb-3">
              <label htmlFor="githubLink" className="form-label">GitHub Repository Link:</label>
              <input
                type="url"
                className="form-control"
                id="githubLink"
                value={githubLink}
                onChange={(e) => setGithubLink(e.target.value)}
                placeholder="https://github.com/username/repository"
                required
              />
            </div>
            <button 
              type="submit" 
              className="btn btn-primary"
              disabled={submitting}
            >
              {submitting ? 'Submitting...' : 'Submit Task'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default StudentTaskSubmission; 