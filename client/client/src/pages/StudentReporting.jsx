import React, { useState } from 'react';
import axios from 'axios';

const StudentReporting = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [topPerformers, setTopPerformers] = useState([]);

  const handleGeneratePdf = async () => {
    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Authentication token not found. Please login again.');
        setLoading(false);
        return;
      }

      const response = await axios({
        method: 'get',
        url: 'http://localhost:5000/api/reporting/generate-pdf-report',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        responseType: 'blob'
      });

      // Create a blob from the PDF data
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `student_report_${Date.now()}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      setSuccess('PDF Report downloaded successfully!');
    } catch (err) {
      console.error('Error generating PDF report:', err);
      setError('Failed to generate PDF report. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateCertificate = async () => {
    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Authentication token not found. Please login again.');
        setLoading(false);
        return;
      }

      const response = await axios.post('http://localhost:5000/api/reporting/generate-certificate', 
        { studentId: localStorage.getItem('studentId') }, 
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          responseType: 'blob'
        }
      );

      // Check if the response is actually a PDF
      if (response.data.type !== 'application/pdf') {
        const reader = new FileReader();
        reader.onload = () => {
          try {
            const errorData = JSON.parse(reader.result);
            setError(errorData.message || 'Failed to generate certificate.');
          } catch (e) {
            setError('Failed to generate certificate.');
          }
        };
        reader.readAsText(response.data);
        return;
      }

      // Create a blob from the PDF data
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `certificate_${Date.now()}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      setSuccess('Certificate downloaded successfully!');
    } catch (err) {
      console.error('Error generating certificate:', err);
      if (err.response?.data instanceof Blob) {
        const reader = new FileReader();
        reader.onload = () => {
          try {
            const errorData = JSON.parse(reader.result);
            setError(errorData.message || 'Failed to generate certificate.');
          } catch (e) {
            setError('Failed to generate certificate.');
          }
        };
        reader.readAsText(err.response.data);
      } else {
        setError(err.response?.data?.message || 'Failed to generate certificate.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handlePublishTopPerformers = async () => {
    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Authentication token not found. Please login again.');
        setLoading(false);
        return;
      }

      const response = await axios.post('http://localhost:5000/api/reporting/publish-top-performers', 
        {}, 
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      setTopPerformers(response.data.topPerformers);
      setSuccess('Top performers published successfully!');
    } catch (err) {
      console.error('Error publishing top performers:', err);
      setError(err.response?.data?.message || 'Failed to publish top performers.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mt-4">
      <h2 className="mb-4">Student Reporting</h2>
      <p className="mb-4">This is where you can manage student reports, certificates, and top performer publications.</p>

      {loading && <div className="alert alert-info">Loading...</div>}
      {error && <div className="alert alert-danger">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      {/* Generate PDF Reports Section */}
      <div className="card mb-4">
        <div className="card-header bg-primary text-white">
          Generate Student Reports (PDF)
        </div>
        <div className="card-body">
          <p>Generate comprehensive PDF reports for students, which can include grades, attendance, and project summaries.</p>
          <button className="btn btn-primary" onClick={handleGeneratePdf} disabled={loading}>
            {loading ? 'Generating...' : 'Generate PDF Report'}
          </button>
        </div>
      </div>

      {/* Generate Signed Certificates Section */}
      <div className="card mb-4">
        <div className="card-header bg-success text-white">
          Generate Signed Certificates
        </div>
        <div className="card-body">
          <p>Create and sign digital certificates for course completion or special achievements.</p>
          <button className="btn btn-success" onClick={handleGenerateCertificate} disabled={loading}>
            {loading ? 'Generating...' : 'Generate Certificate'}
          </button>
        </div>
      </div>

      {/* Publish Top Performers Section */}
      <div className="card mb-4">
        <div className="card-header bg-info text-white">
          Publish Top Performers
        </div>
        <div className="card-body">
          <p>Highlight and publish a list of top-performing students on a public-facing page or notice board.</p>
          <button className="btn btn-info" onClick={handlePublishTopPerformers} disabled={loading}>
            {loading ? 'Publishing...' : 'Publish Top Performers'}
          </button>

          {/* Display Top Performers */}
          {topPerformers.length > 0 && (
            <div className="mt-4">
              <h4>Top Performers</h4>
              <div className="table-responsive">
                <table className="table table-striped">
                  <thead>
                    <tr>
                      <th>Rank</th>
                      <th>Name</th>
                      <th>Student ID</th>
                      <th>Category</th>
                      <th>Completed Tasks</th>
                      <th>Performance Score</th>
                    </tr>
                  </thead>
                  <tbody>
                    {topPerformers.map((student, index) => (
                      <tr key={student.studentId}>
                        <td>{index + 1}</td>
                        <td>{student.name}</td>
                        <td>{student.studentId}</td>
                        <td>{student.category || 'N/A'}</td>
                        <td>{student.completedTasks}/{student.totalTasks}</td>
                        <td>{student.performanceScore.toFixed(1)}%</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StudentReporting; 