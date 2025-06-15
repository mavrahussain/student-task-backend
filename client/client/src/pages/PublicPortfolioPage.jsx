import React, { useState } from 'react';
import { FaGithub, FaLinkedin, FaCheck, FaHourglassHalf, FaTimesCircle, FaBullhorn } from 'react-icons/fa';

const PublicPortfolioPage = () => {
  const [portfolio, setPortfolio] = useState({
    github: '',
    linkedin: '',
    status: 'Not Submitted'
  });
  const [portfolioMessage, setPortfolioMessage] = useState('');

  const handlePortfolioSubmit = () => {
    if (!portfolio.github && !portfolio.linkedin) {
      setPortfolioMessage('Please provide at least one link (GitHub or LinkedIn).');
      return;
    }
    // Simulate submission and pending status
    setPortfolio({ ...portfolio, status: 'Pending Review' });
    setPortfolioMessage('Your portfolio has been submitted for review.');
    // In a real app, you'd send this data to the backend.
  };

  // Demo: Simulate admin actions (Approved/Rejected)
  const simulateAdminApproval = (status) => {
    setPortfolio({ ...portfolio, status });
    if (status === 'Approved') {
      setPortfolioMessage('Congratulations! Your portfolio has been approved and is now public.');
    } else if (status === 'Rejected') {
      setPortfolioMessage('Your portfolio submission was rejected. Please review and resubmit.');
    }
  };

  return (
    <div className="container mt-4">
      <div className="row">
        <div className="col-md-12">
          <div className="card mb-4">
            <div className="card-header bg-secondary text-white">
              <h5 className="mb-0">Public Portfolio</h5>
            </div>
            <div className="card-body">
              {portfolioMessage && <div className={`alert ${portfolio.status === 'Approved' ? 'alert-success' : portfolio.status === 'Rejected' ? 'alert-danger' : 'alert-info'}`}>{portfolioMessage}</div>}
              
              {portfolio.status === 'Approved' && (
                <div className="alert alert-success d-flex align-items-center" role="alert">
                  <FaBullhorn className="me-2" />
                  Your portfolio is public!
                </div>
              )}

              <div className="mb-3">
                <label className="form-label">GitHub Profile URL</label>
                <input
                  type="url"
                  className="form-control"
                  placeholder="https://github.com/yourusername"
                  value={portfolio.github}
                  onChange={e => setPortfolio({ ...portfolio, github: e.target.value })}
                  disabled={portfolio.status === 'Pending Review' || portfolio.status === 'Approved'}
                />
              </div>
              <div className="mb-3">
                <label className="form-label">LinkedIn Profile URL</label>
                <input
                  type="url"
                  className="form-control"
                  placeholder="https://linkedin.com/in/yourname"
                  value={portfolio.linkedin}
                  onChange={e => setPortfolio({ ...portfolio, linkedin: e.target.value })}
                  disabled={portfolio.status === 'Pending Review' || portfolio.status === 'Approved'}
                />
              </div>

              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <strong>Status:</strong> {portfolio.status === 'Not Submitted' && <span className="badge bg-secondary">Not Submitted</span>}
                  {portfolio.status === 'Pending Review' && <span className="badge bg-info"><FaHourglassHalf /> Pending Review</span>}
                  {portfolio.status === 'Approved' && <span className="badge bg-success"><FaCheck /> Approved</span>}
                  {portfolio.status === 'Rejected' && <span className="badge bg-danger"><FaTimesCircle /> Rejected</span>}
                </div>
                
                {portfolio.status === 'Not Submitted' || portfolio.status === 'Rejected' ? (
                  <button className="btn btn-primary" onClick={handlePortfolioSubmit} disabled={!portfolio.github && !portfolio.linkedin}>
                    Submit for Approval
                  </button>
                ) : portfolio.status === 'Pending Review' && (
                  // Demo admin actions (remove in real app)
                  <>
                    <button className="btn btn-success btn-sm me-2" onClick={() => simulateAdminApproval('Approved')}>Simulate Approve</button>
                    <button className="btn btn-danger btn-sm" onClick={() => simulateAdminApproval('Rejected')}>Simulate Reject</button>
                  </>
                )}

              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PublicPortfolioPage; 