import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaGithub, FaLinkedin, FaCheckCircle, FaTimesCircle, FaEye } from 'react-icons/fa';
import './AdminPortfolioReview.css';

const AdminPortfolioReview = () => {
  const [portfolios, setPortfolios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [selectedPortfolio, setSelectedPortfolio] = useState(null);
  const [showReviewModal, setShowReviewModal] = useState(false);

  useEffect(() => {
    fetchPortfolios();
  }, []);

  const fetchPortfolios = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Authentication token not found. Please login again.');
        setLoading(false);
        return;
      }

      const response = await axios.get('http://localhost:5000/api/portfolio/admin/portfolios', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      setPortfolios(response.data);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching portfolios:', err);
      setError(err.response?.data?.message || 'Failed to fetch portfolios');
      setLoading(false);
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
    } catch (err) {
      console.error('Error rejecting portfolio:', err);
      setError(err.response?.data?.message || 'Failed to reject portfolio');
    }
  };

  if (loading) return <div className="loading">Loading...</div>;

  return (
    <div className="portfolio-review-container">
      <h2>Student Portfolio Review</h2>

      {error && <div className="error">{error}</div>}
      {success && <div className="success">{success}</div>}

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

export default AdminPortfolioReview; 