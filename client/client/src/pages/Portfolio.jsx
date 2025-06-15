import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaGithub, FaLinkedin, FaCheckCircle, FaTimesCircle, FaEye, FaBell } from 'react-icons/fa';
import './Portfolio.css';

const Portfolio = () => {
  const [portfolios, setPortfolios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [selectedPortfolio, setSelectedPortfolio] = useState(null);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    checkUserRole();
    fetchPortfolios();
    fetchNotifications();
  }, [isAdmin]);

  const checkUserRole = () => {
    const userRole = localStorage.getItem('userRole');
    console.log('Portfolio.jsx: User Role from localStorage:', userRole);
    setIsAdmin(userRole === 'admin');
    console.log('User Role:', userRole);
    console.log('isAdmin state:', userRole === 'admin');
  };

  const fetchPortfolios = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Authentication token not found. Please login again.');
        setLoading(false);
        return;
      }

      console.log('Fetching portfolios for isAdmin:', isAdmin);
      const endpoint = isAdmin 
        ? 'http://localhost:5000/api/portfolio/admin/portfolios'
        : 'http://localhost:5000/api/portfolio/student/portfolio';
      console.log('API Endpoint:', endpoint);

      const response = await axios.get(endpoint, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (isAdmin) {
        setPortfolios(response.data);
      } else {
        setPortfolios([response.data]);
      }
      console.log('Fetched portfolios:', response.data);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching portfolios in Portfolio.jsx:', err);
      setError(err.response?.data?.message || 'Failed to fetch portfolios');
      setLoading(false);
    }
  };

  const fetchNotifications = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        console.error('No token found');
        return;
      }
      const response = await axios.get('http://localhost:5000/api/messages/notifications', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      setNotifications(response.data);
      console.log('Fetched notifications:', response.data);
    } catch (err) {
      console.error('Error fetching notifications in Portfolio.jsx:', err);
    }
  };

  const handleReviewClick = (portfolio) => {
    setSelectedPortfolio(portfolio);
    setShowReviewModal(true);
  };

  const handleCloseModal = () => {
    setShowReviewModal(false);
    setSelectedPortfolio(null);
  };

  const handleApprove = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Authentication token not found. Please login again.');
        return;
      }

      const response = await axios.put(
        `http://localhost:5000/api/portfolio/admin/portfolios/${selectedPortfolio._id}/approve`,
        {},
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      setSuccess('Portfolio approved successfully!');
      setPortfolios(portfolios.map(p => 
        p._id === selectedPortfolio._id ? response.data : p
      ));
      handleCloseModal();
      fetchNotifications();
    } catch (err) {
      console.error('Error approving portfolio:', err);
      setError(err.response?.data?.message || 'Failed to approve portfolio');
    }
  };

  const handleReject = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Authentication token not found. Please login again.');
        return;
      }

      const response = await axios.put(
        `http://localhost:5000/api/portfolio/admin/portfolios/${selectedPortfolio._id}/reject`,
        {},
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      setSuccess('Portfolio rejected successfully!');
      setPortfolios(portfolios.map(p => 
        p._id === selectedPortfolio._id ? response.data : p
      ));
      handleCloseModal();
      fetchNotifications();
    } catch (err) {
      console.error('Error rejecting portfolio:', err);
      setError(err.response?.data?.message || 'Failed to reject portfolio');
    }
  };

  const handleTogglePublic = async (portfolio) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Authentication token not found. Please login again.');
        return;
      }

      const response = await axios.put(
        'http://localhost:5000/api/portfolio/student/portfolio/visibility',
        { isPublic: !portfolio.isPublic },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      setSuccess('Portfolio visibility updated successfully!');
      setPortfolios(portfolios.map(p => 
        p._id === portfolio._id ? response.data : p
      ));
      fetchNotifications();
    } catch (err) {
      console.error('Error updating visibility:', err);
      setError(err.response?.data?.message || 'Failed to update visibility');
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const data = {
      githubProfile: formData.get('githubProfile'),
      linkedinProfile: formData.get('linkedinProfile')
    };

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Authentication token not found. Please login again.');
        return;
      }

      const response = await axios.post(
        'http://localhost:5000/api/portfolio/student/portfolio',
        data,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      setSuccess('Profile updated successfully! Waiting for admin approval.');
      setPortfolios([response.data]);
      fetchNotifications();
    } catch (err) {
      console.error('Error updating profile:', err);
      setError(err.response?.data?.message || 'Failed to update profile');
    }
  };

  if (loading) return <div className="loading">Loading...</div>;

  return (
    <div className="portfolio-container">
      <h2>{isAdmin ? 'Student Portfolio Review' : 'My Portfolio'}</h2>

      {error && <div className="error">{error}</div>}
      {success && <div className="success">{success}</div>}

      {/* Notifications Section */}
      {notifications.length > 0 && (
        <div className="notifications-section">
          <h3><FaBell className="icon" /> Notifications</h3>
          <div className="notifications-list">
            {notifications.map(notification => (
              <div key={notification._id} className={`notification ${notification.read ? 'read' : 'unread'}`}>
                <p>{notification.message}</p>
                <small>{new Date(notification.createdAt).toLocaleString()}</small>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Student View */}
      {!isAdmin && portfolios[0] && (
        <div className="portfolio-card">
          <form onSubmit={handleUpdateProfile}>
            <div className="form-group">
              <label htmlFor="githubProfile">
                <FaGithub className="icon" /> GitHub Profile URL
              </label>
              <input
                type="url"
                id="githubProfile"
                name="githubProfile"
                defaultValue={portfolios[0].githubProfile}
                placeholder="https://github.com/yourusername"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="linkedinProfile">
                <FaLinkedin className="icon" /> LinkedIn Profile URL
              </label>
              <input
                type="url"
                id="linkedinProfile"
                name="linkedinProfile"
                defaultValue={portfolios[0].linkedinProfile}
                placeholder="https://linkedin.com/in/yourusername"
                required
              />
            </div>

            <div className="status-section">
              <div className="status-item">
                <span>Approval Status:</span>
                {portfolios[0].isApproved ? (
                  <span className="status approved">
                    <FaCheckCircle /> Approved
                  </span>
                ) : (
                  <span className="status pending">
                    <FaTimesCircle /> Pending Approval
                  </span>
                )}
              </div>
            </div>

            <div className="button-group">
              <button type="submit" className="btn btn-primary">
                Update Profile
              </button>
              <button
                type="button"
                className={`btn ${portfolios[0].isPublic ? 'btn-secondary' : 'btn-success'}`}
                onClick={() => handleTogglePublic(portfolios[0])}
                disabled={!portfolios[0].isApproved}
              >
                {portfolios[0].isPublic ? 'Make Private' : 'Make Public'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Admin View */}
      {isAdmin && (
        <div className="portfolio-list">
          {portfolios.length === 0 ? (
            <p className="no-portfolios">No portfolios to review.</p>
          ) : (
            <div className="table-responsive">
              <table className="table">
                <thead>
                  <tr>
                    <th>Student Name</th>
                    <th>GitHub Profile</th>
                    <th>LinkedIn Profile</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {portfolios.map(portfolio => (
                    <tr key={portfolio._id}>
                      <td>{portfolio.student.name}</td>
                      <td>
                        <a href={portfolio.githubProfile} target="_blank" rel="noopener noreferrer">
                          <FaGithub className="icon" /> View
                        </a>
                      </td>
                      <td>
                        <a href={portfolio.linkedinProfile} target="_blank" rel="noopener noreferrer">
                          <FaLinkedin className="icon" /> View
                        </a>
                      </td>
                      <td>
                        {portfolio.isApproved ? (
                          <span className="status approved">
                            <FaCheckCircle /> Approved
                          </span>
                        ) : (
                          <span className="status pending">
                            <FaTimesCircle /> Pending
                          </span>
                        )}
                      </td>
                      <td>
                        <button
                          className="btn btn-primary"
                          onClick={() => handleReviewClick(portfolio)}
                        >
                          <FaEye className="icon" /> Review
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Review Modal */}
      {selectedPortfolio && (
        <div className={`modal fade ${showReviewModal ? 'show d-block' : ''}`} tabIndex="-1">
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Review Portfolio</h5>
                <button type="button" className="btn-close" onClick={handleCloseModal}></button>
              </div>
              <div className="modal-body">
                <div className="student-info">
                  <h6>Student Information</h6>
                  <p><strong>Name:</strong> {selectedPortfolio.student.name}</p>
                  <p><strong>Email:</strong> {selectedPortfolio.student.email}</p>
                </div>

                <div className="profile-links">
                  <h6>Profile Links</h6>
                  <p>
                    <strong>GitHub:</strong>
                    <a href={selectedPortfolio.githubProfile} target="_blank" rel="noopener noreferrer">
                      {selectedPortfolio.githubProfile}
                    </a>
                  </p>
                  <p>
                    <strong>LinkedIn:</strong>
                    <a href={selectedPortfolio.linkedinProfile} target="_blank" rel="noopener noreferrer">
                      {selectedPortfolio.linkedinProfile}
                    </a>
                  </p>
                </div>

                <div className="current-status">
                  <h6>Current Status</h6>
                  <p>
                    {selectedPortfolio.isApproved ? (
                      <span className="status approved">
                        <FaCheckCircle /> Approved
                      </span>
                    ) : (
                      <span className="status pending">
                        <FaTimesCircle /> Pending Approval
                      </span>
                    )}
                  </p>
                </div>
              </div>
              <div className="modal-footer">
                <button className="btn btn-secondary" onClick={handleCloseModal}>
                  Close
                </button>
                {!selectedPortfolio.isApproved && (
                  <>
                    <button className="btn btn-success" onClick={handleApprove}>
                      Approve
                    </button>
                    <button className="btn btn-danger" onClick={handleReject}>
                      Reject
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {showReviewModal && <div className="modal-backdrop fade show"></div>}
    </div>
  );
};

export default Portfolio; 