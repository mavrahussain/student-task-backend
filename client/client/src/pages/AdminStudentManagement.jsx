import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './AdminStudentManagement.css';

const AdminStudentManagement = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [newStudent, setNewStudent] = useState({ name: '', email: '' });
  const [studentGrades, setStudentGrades] = useState({});

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/students');
      setStudents(response.data);
      setLoading(false);
      const initialGrades = {};
      response.data.forEach(student => {
        initialGrades[student._id] = student.grade || '';
      });
      setStudentGrades(initialGrades);
    } catch (err) {
      setError('Failed to fetch students');
      setLoading(false);
    }
  };

  const handleStatusChange = async (studentId, newStatus) => {
    try {
      await axios.put(`http://localhost:5000/api/students/${studentId}/status`, { status: newStatus });
      fetchStudents();
    } catch (err) {
      setError('Failed to update student status');
    }
  };

  const handleAddStudentChange = (e) => {
    setNewStudent({ ...newStudent, [e.target.name]: e.target.value });
  };

  const handleAddStudent = async (e) => {
    e.preventDefault();
    if (!newStudent.name || !newStudent.email) {
      setError('Please fill out all fields for the new student.');
      return;
    }

    setError(null);

    try {
      const response = await axios.post('http://localhost:5000/api/students', newStudent);
      if (response.data.message === 'Student added successfully') {
        alert(`Student added successfully!\nStudent ID: ${response.data.student.studentId}\nInitial Password: ${response.data.initialPassword}`);
        setNewStudent({ name: '', email: '' });
        fetchStudents();
      } else {
        setError('Failed to add student. Please try again.');
      }
    } catch (err) {
      console.error('Error adding student:', err);
      setError(err.response?.data?.message || 'Failed to add student.');
    }
  };

  const handleStudentGradeChange = (studentId, grade) => {
    setStudentGrades({ ...studentGrades, [studentId]: grade });
  };

  const handleSaveStudentGrade = async (studentId) => {
    try {
      const gradeToSave = studentGrades[studentId];
      if (!gradeToSave) {
        setError('Please select a grade before saving.');
        return;
      }

      await axios.put(`http://localhost:5000/api/students/${studentId}/grade`, { grade: gradeToSave });
      alert(`Grade ${gradeToSave} saved for student ${studentId}.`);
      fetchStudents();
    } catch (err) {
      console.error('Error saving student grade:', err);
      setError(err.response?.data?.message || 'Failed to save student grade.');
    }
  };

  if (loading) return <div className="loading">Loading...</div>;
  if (error && !newStudent.name && !newStudent.email) return <div className="error">{error}</div>;

  return (
    <div className="admin-student-management">
      <h1>Student Management</h1>

      <div className="add-student-section">
        <h2>Add New Student</h2>
        {error && newStudent.name && newStudent.email && <div className="error-message">{error}</div>}
        <form onSubmit={handleAddStudent} className="add-student-form">
          <input
            type="text"
            name="name"
            placeholder="Student Name"
            value={newStudent.name}
            onChange={handleAddStudentChange}
            required
          />
          <input
            type="email"
            name="email"
            placeholder="Student Email"
            value={newStudent.email}
            onChange={handleAddStudentChange}
            required
          />
          <button type="submit">Add Student</button>
        </form>
      </div>

      <div className="students-list">
        <h2>Existing Students</h2>
        {error && !newStudent.name && !newStudent.email && <div className="error-message">{error}</div>}
        {Array.isArray(students) && students.length === 0 && !loading && !error && (
          <p>No students found. Add a new student above.</p>
        )}
        {Array.isArray(students) && students.length > 0 && (
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Category</th>
                <th>Status</th>
                <th>Grade</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {students.map((student) => (
                <tr key={student._id}>
                  <td>{student.name}</td>
                  <td>{student.email}</td>
                  <td>{student.category || 'N/A'}</td>
                  <td>{student.status}</td>
                  <td>
                    <select
                      value={studentGrades[student._id] || ''}
                      onChange={(e) => handleStudentGradeChange(student._id, e.target.value)}
                    >
                      <option value="">Select Grade</option>
                      <option value="A">A</option>
                      <option value="B">B</option>
                      <option value="C">C</option>
                      <option value="D">D</option>
                      <option value="F">F</option>
                    </select>
                  </td>
                  <td>
                    <select
                      value={student.status}
                      onChange={(e) => handleStatusChange(student._id, e.target.value)}
                    >
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                      <option value="suspended">Suspended</option>
                    </select>
                    <button onClick={() => handleSaveStudentGrade(student._id)}>Save Grade</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default AdminStudentManagement;
