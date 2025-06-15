import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './AdminTaskReview.css';

const AdminTaskReview = () => {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [feedbackText, setFeedbackText] = useState({});

  useEffect(() => {
    fetchSubmissions();
  }, []);

  const fetchSubmissions = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Authentication token not found.');
        setLoading(false);
        return;
      }

      const response = await axios.get('/api/tasks', {
        headers: { 'Authorization': `Bearer ${token}` },
        params: { status: 'submitted' }
      });

      const allTasks = response.data;
      const pendingSubmissions = [];
      const initialFeedback = {};

      allTasks.forEach(task => {
        task.submissions.forEach(submission => {
          if (submission.status === 'pending') {
            pendingSubmissions.push({
              taskId: task._id,
              taskTitle: task.title,
              student: submission.student,
              submissionId: submission._id,
              githubLink: submission.githubLink,
              submittedAt: submission.submittedAt,
              status: submission.status,
              feedback: submission.feedback || ''
            });
            initialFeedback[submission._id] = submission.feedback || '';
          }
        });
      });
      setSubmissions(pendingSubmissions);
      setFeedbackText(initialFeedback);
      setLoading(false);

    } catch (err) {
      console.error('Error fetching submissions:', err);
      setError(err.response?.data?.message || 'Failed to fetch submissions.');
      setLoading(false);
    }
  };

  const handleReview = async (submissionTaskAndStudentId, reviewStatus) => {
    try {
      const [taskId, studentId] = submissionTaskAndStudentId.split('_');
      const feedback = feedbackText[submissionTaskAndStudentId];

      let backendStatus = '';
      if (reviewStatus === 'Satisfied') {
        backendStatus = 'approved';
      } else if (reviewStatus === 'Unsatisfied') {
        backendStatus = 'rejected';
      } else if (reviewStatus === 'Try Again') {
        backendStatus = 'in_progress';
      } else {
        setError('Invalid review status.');
        return;
      }

      const token = localStorage.getItem('token');
      if (!token) {
        setError('Authentication token not found.');
        return;
      }

      const response = await axios.post(
        `/api/tasks/${taskId}/review/${studentId}`,
        {
          status: backendStatus,
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
        alert(`Submission marked as ${reviewStatus} successfully.`);
        // Refresh the submissions list
        await fetchSubmissions();
      }
    } catch (err) {
      console.error('Error updating review status:', err);
      setError(err.response?.data?.message || 'Failed to update review status. Please try again.');
    }
  };

  const handleFeedbackChange = (submissionTaskAndStudentId, text) => {
    setFeedbackText({...feedbackText, [submissionTaskAndStudentId]: text});
  };

  if (loading) return <div className="loading">Loading...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="admin-task-review container mt-4">
      <h1 className="mb-4 text-center">Task Review</h1>

      <div className="submissions-list">
        <h2 className="mb-3">Pending Submissions</h2>
        {submissions.length === 0 ? (
          <div className="alert alert-info text-center" role="alert">
            No pending submissions to review.
          </div>
        ) : (
          <div className="row">
            {submissions.map((submission) => (
              <div className="col-md-6 mb-4" key={`${submission.taskId}_${submission.student._id}`}>
                <div className="card h-100 shadow-sm">
                  <div className="card-header bg-primary text-white d-flex justify-content-between align-items-center">
                    <h5 className="mb-0">{submission.taskTitle}</h5>
                    <span className="badge bg-warning text-dark">{submission.status.replace('_', ' ')}</span>
                  </div>
                  <div className="card-body">
                    <p><strong>Student:</strong> {submission.student.name} ({submission.student.studentId})</p>
                    <p><strong>Submitted On:</strong> {new Date(submission.submittedAt).toLocaleDateString()}</p>
                    <p><strong>GitHub Link:</strong> <a href={submission.githubLink} target="_blank" rel="noopener noreferrer">{submission.githubLink}</a></p>
                    <div className="form-group mb-3">
                      <label htmlFor={`feedback-${submission.taskId}-${submission.student._id}`} className="form-label"><strong>Feedback:</strong></label>
                      <textarea
                        id={`feedback-${submission.taskId}-${submission.student._id}`}
                        className="form-control"
                        rows="3"
                        value={feedbackText[`${submission.taskId}_${submission.student._id}`] || ''}
                        onChange={(e) => handleFeedbackChange(`${submission.taskId}_${submission.student._id}`, e.target.value)}
                        placeholder="Add feedback here..."
                      />
                    </div>
                  </div>
                  <div className="card-footer d-flex justify-content-around">
                    <button 
                      className="btn btn-success flex-fill me-2" 
                      onClick={() => handleReview(`${submission.taskId}_${submission.student._id}`, 'Satisfied')}
                    >
                      Satisfied
                    </button>
                    <button 
                      className="btn btn-warning flex-fill me-2" 
                      onClick={() => handleReview(`${submission.taskId}_${submission.student._id}`, 'Try Again')}
                    >
                      Try Again
                    </button>
                    <button 
                      className="btn btn-danger flex-fill" 
                      onClick={() => handleReview(`${submission.taskId}_${submission.student._id}`, 'Unsatisfied')}
                    >
                      Unsatisfied
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminTaskReview; 