import React, { useState } from 'react';
import { FaGithub, FaCalendarAlt, FaCheck, FaRedo, FaEye } from 'react-icons/fa';
import './TaskPanel.css';

const TaskPanel = ({ tasks, setTasks }) => {
  const [githubLinks, setGithubLinks] = useState({});
  const [message, setMessage] = useState('');

  const handleInputChange = (taskId, value) => {
    setGithubLinks({ ...githubLinks, [taskId]: value });
  };

  const handleSubmit = (taskId) => {
    if (!githubLinks[taskId] || !githubLinks[taskId].startsWith('https://github.com/')) {
      setMessage('Please enter a valid GitHub link.');
      return;
    }
    setTasks(tasks.map(task =>
      task.id === taskId
        ? { ...task, reviewStatus: 'Submitted', github: githubLinks[taskId] }
        : task
    ));
    setMessage('');
  };

  // Demo: Simulate admin marking as reviewed
  const handleMarkReviewed = (taskId) => {
    setTasks(tasks.map(task =>
      task.id === taskId
        ? { ...task, reviewStatus: 'Reviewed' }
        : task
    ));
  };

  // Demo: Simulate admin requesting rework
  const handleRequestRework = (taskId) => {
    setTasks(tasks.map(task =>
      task.id === taskId
        ? { ...task, reviewStatus: 'Rework Required' }
        : task
    ));
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Not Submitted':
        return <span className="badge bg-secondary"><FaEye /> Not Submitted</span>;
      case 'Submitted':
        return <span className="badge bg-primary"><FaGithub /> Submitted</span>;
      case 'Reviewed':
        return <span className="badge bg-success"><FaCheck /> Reviewed</span>;
      case 'Rework Required':
        return <span className="badge bg-danger"><FaRedo /> Rework Required</span>;
      default:
        return null;
    }
  };

  return (
    <div className="card mb-4">
      <div className="card-header bg-info text-white">
        <h5 className="mb-0">Task Panel</h5>
      </div>
      <div className="card-body">
        {message && <div className="alert alert-warning">{message}</div>}
        <table className="table table-bordered">
          <thead>
            <tr>
              <th>Task</th>
              <th>Status</th>
              <th>GitHub Link</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {tasks.map(task => (
              <tr key={task.id}>
                <td>{task.title}</td>
                <td>{getStatusBadge(task.reviewStatus)}</td>
                <td>
                  {task.reviewStatus === 'Not Submitted' ? (
                    <input
                      type="url"
                      className="form-control"
                      placeholder="Paste GitHub link"
                      value={githubLinks[task.id] || ''}
                      onChange={e => handleInputChange(task.id, e.target.value)}
                    />
                  ) : (
                    task.github ? <a href={task.github} target="_blank" rel="noopener noreferrer">View Link</a> : <span className="text-muted">-</span>
                  )}
                </td>
                <td>
                  {task.reviewStatus === 'Not Submitted' && (
                    <button
                      className="btn btn-primary btn-sm"
                      onClick={() => handleSubmit(task.id)}
                    >
                      Submit
                    </button>
                  )}
                  {task.reviewStatus === 'Submitted' && (
                    <>
                      <button
                        className="btn btn-success btn-sm me-2"
                        onClick={() => handleMarkReviewed(task.id)}
                      >
                        Mark as Reviewed
                      </button>
                      <button
                        className="btn btn-danger btn-sm"
                        onClick={() => handleRequestRework(task.id)}
                      >
                        Request Rework
                      </button>
                    </>
                  )}
                  {task.reviewStatus === 'Reviewed' && (
                    <span className="text-success">Done</span>
                  )}
                  {task.reviewStatus === 'Rework Required' && (
                    <span className="text-danger">Rework Needed</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TaskPanel;