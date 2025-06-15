import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaUserGraduate, FaLock, FaSignInAlt } from 'react-icons/fa';
import './Login.css';

export default function Login() {
  const [studentId, setStudentId] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();

    if (!studentId || !password) {
      setError('Please enter both Student ID and Password');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch('http://localhost:5000/api/studentAuth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ studentId, password }),
      });

      const data = await response.json();

      if (response.ok) {
        // Save token and student info
        localStorage.setItem('token', data.token);
        localStorage.setItem('student', JSON.stringify({
          name: data.name,
          studentId: data.studentId,
          category: data.category,
          _id: data._id
        }));
        localStorage.setItem('userRole', 'student');
        console.log('Login.jsx: Token and user role set in localStorage:', { token: data.token, userRole: 'student' });

        // Redirect to dashboard
        navigate('/dashboard');
      } else {
        setError(data.message || 'Login failed. Please check your credentials.');
      }
    } catch (err) {
      console.error('Login error:', err);
      setError('Server error. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <div className="student-icon">
            <FaUserGraduate size={40} />
          </div>
          <h2>Student Portal</h2>
          <p>Enter your credentials to continue</p>
        </div>

        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleLogin}>
          <div className="input-group">
            <FaUserGraduate className="input-icon" />
            <input
              type="text"
              placeholder="Student ID"
              value={studentId}
              onChange={(e) => setStudentId(e.target.value)}
              required
            />
          </div>

          <div className="input-group">
            <FaLock className="input-icon" />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button type="submit" disabled={loading}>
            <FaSignInAlt className="button-icon" />
            {loading ? 'Verifying...' : 'Login'}
          </button>

          <div className="forgot-password-link">
            <a href="#">Forgot Password?</a>
          </div>
        </form>

        <div className="login-footer">
          <p>Need help? Contact administration</p>
        </div>
      </div>
    </div>
  );
}
