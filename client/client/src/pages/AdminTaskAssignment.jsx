import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './AdminTaskAssignment.css';

const AdminTaskAssignment = () => {
  const [students, setStudents] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [categories, setCategories] = useState([]);
  const [assignmentType, setAssignmentType] = useState('student');
  const [selectedStudent, setSelectedStudent] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedTask, setSelectedTask] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [newTask, setNewTask] = useState({ title: '', description: '', requirements: '', deadline: '', categoryId: '' });

  useEffect(() => {
    fetchStudents();
    fetchTasks();
    fetchAssignments();
    fetchCategories();
  }, []);

  const fetchStudents = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Authentication token not found. Please login again.');
        return;
      }

      const response = await axios.get('http://localhost:5000/api/students', {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      setStudents(response.data);
    } catch (err) {
      console.error('Error fetching students:', err);
      setError('Failed to fetch students');
      setStudents([]);
    }
  };

  const fetchTasks = async () => {
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
      setTasks(response.data);
    } catch (err) {
      console.error('Error fetching tasks:', err);
      if (err.response?.status === 401) {
        setError('Your session has expired. Please login again.');
      } else {
        setError(err.response?.data?.message || 'Failed to fetch tasks');
      }
      setTasks([]);
    }
  };

  const fetchAssignments = async () => {
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
      setAssignments(response.data);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching assignments:', err);
      if (err.response?.status === 401) {
        setError('Your session has expired. Please login again.');
      } else {
        setError(err.response?.data?.message || 'Failed to fetch assignments');
      }
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await axios.get('/api/categories'); // Categories are generally public or have different auth
      setCategories(response.data);
    } catch (err) {
      setError('Failed to fetch categories');
    }
  };

  const handleCreateTaskChange = (e) => {
    setNewTask({ ...newTask, [e.target.name]: e.target.value });
  };

  const handleCreateTask = async (e) => {
    e.preventDefault();
    if (!newTask.title || !newTask.description || !newTask.requirements || !newTask.deadline || !newTask.categoryId) {
      setError('Please fill out all task fields: title, description, requirements, deadline, and category.');
      return;
    }

    setError(null);

    console.log('Sending new task data:', newTask);

    try {
      const token = localStorage.getItem('token');
      const response = await axios.post('/api/tasks', newTask, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      alert(response.data.message);
      setNewTask({ title: '', description: '', requirements: '', deadline: '', categoryId: '' });
      fetchTasks();
    } catch (err) {
      console.error('Error creating task:', err);
      setError(err.response?.data?.message || 'Failed to create task.');
    }
  };

  const handleAssignTask = async (e) => {
    e.preventDefault();

    let assignedToId = null;

    if (assignmentType === 'student') {
      if (!selectedStudent || !selectedTask || !dueDate) {
        setError('Please select a student, task, and due date.');
        return;
      }
      assignedToId = selectedStudent;

    } else if (assignmentType === 'category') {
      if (!selectedCategory || !selectedTask || !dueDate) {
        setError('Please select a category, task, and due date.');
        return;
      }
      assignedToId = selectedCategory;
    }

    setError(null);

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Authentication token not found. Please login again.');
        return;
      }

      const response = await axios.post('http://localhost:5000/api/tasks/assign', {
        taskId: selectedTask,
        targetId: assignedToId,
        deadline: dueDate,
        assignmentType,
      }, {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      alert(response.data.message);
      setSelectedStudent('');
      setSelectedCategory('');
      setSelectedTask('');
      setDueDate('');
      fetchAssignments();
    } catch (err) {
      console.error('Error assigning task:', err);
      setError(err.response?.data?.message || 'Failed to assign task.');
    }
  };

  if (loading) return <div className="loading">Loading...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="admin-task-assignment">
      <h1>Task Assignment</h1>

      <div className="create-task-section">
        <h2>Create New Task</h2>
        {error && !selectedStudent && !selectedTask && !dueDate && !newTask.title && <div className="error-message">{error}</div>}
        <form onSubmit={handleCreateTask} className="create-task-form">
          <div className="form-group">
            <label htmlFor="taskTitle">Task Title:</label>
            <input
              type="text"
              id="taskTitle"
              name="title"
              value={newTask.title}
              onChange={handleCreateTaskChange}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="taskDescription">Description:</label>
            <textarea
              id="taskDescription"
              name="description"
              value={newTask.description}
              onChange={handleCreateTaskChange}
              required
            ></textarea>
          </div>
          <div className="form-group">
            <label htmlFor="taskRequirements">Requirements:</label>
            <textarea
              id="taskRequirements"
              name="requirements"
              value={newTask.requirements}
              onChange={handleCreateTaskChange}
              required
            ></textarea>
          </div>
          <div className="form-group">
            <label htmlFor="taskDeadline">Deadline:</label>
            <input
              type="date"
              id="taskDeadline"
              name="deadline"
              value={newTask.deadline}
              onChange={handleCreateTaskChange}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="taskCategory">Category:</label>
            <select
              id="taskCategory"
              name="categoryId"
              value={newTask.categoryId}
              onChange={handleCreateTaskChange}
              required
            >
              <option value="">-- Select Category --</option>
              {Array.isArray(categories) && categories.map((category) => (
                <option key={category._id} value={category._id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>
          <button type="submit">Create Task</button>
        </form>
      </div>

      <div className="assign-task-section">
        <h2>Assign Task</h2>
        {error && (selectedStudent || selectedCategory) && selectedTask && dueDate && <div className="error-message">{error}</div>}
        <form onSubmit={handleAssignTask} className="assign-task-form">
          <div className="form-group">
            <label>Assign To:</label>
            <div>
              <input
                type="radio"
                id="assignToStudent"
                name="assignmentType"
                value="student"
                checked={assignmentType === 'student'}
                onChange={() => setAssignmentType('student')}
              />
              <label htmlFor="assignToStudent">Individual Student</label>
            </div>
            <div>
              <input
                type="radio"
                id="assignToCategory"
                name="assignmentType"
                value="category"
                checked={assignmentType === 'category'}
                onChange={() => setAssignmentType('category')}
              />
              <label htmlFor="assignToCategory">Category</label>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="recipient">Select Recipient:</label>
            {assignmentType === 'student' ? (
              <select
                id="recipient"
                value={selectedStudent}
                onChange={(e) => setSelectedStudent(e.target.value)}
                required={assignmentType === 'student'}
              >
                <option value="">-- Select Student --</option>
                {Array.isArray(students) && students.map((student) => (
                  <option key={student._id} value={student._id}>
                    {student.name}
                  </option>
                ))}
              </select>
            ) : (
              <select
                id="recipient"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                required={assignmentType === 'category'}
              >
                <option value="">-- Select Category --</option>
                {Array.isArray(categories) && categories.map((category) => (
                  <option key={category._id} value={category._id}>
                    {category.name}
                  </option>
                ))}
              </select>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="task">Select Task:</label>
            <select
              id="task"
              value={selectedTask}
              onChange={(e) => setSelectedTask(e.target.value)}
              required
            >
              <option value="">-- Select Task --</option>
              {Array.isArray(tasks) && tasks.map((task) => (
                <option key={task._id} value={task._id}>
                  {task.title}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="dueDate">Due Date:</label>
            <input
              type="date"
              id="dueDate"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              required
            />
          </div>

          <button type="submit">Assign Task</button>
        </form>
      </div>

      <div className="recent-assignments">
        <h2>Recent Assignments</h2>
        {assignments.length === 0 ? (
          <p>No assignments found.</p>
        ) : (
          <ul>
            {Array.isArray(assignments) && assignments.map((task) => (
              <li key={task._id}>
                <h3>Task: {task.title} (ID: {task._id})</h3>
                <p>Deadline: {new Date(task.deadline).toLocaleDateString()}</p>
                <p>Requirements: {task.requirements}</p>
                {task.assignedTo && task.assignedTo.length > 0 ? (
                  <div>
                    <h4>Assigned To:</h4>
                    <ul>
                      {task.assignedTo.map((student) => (
                        <li key={student._id}>{student.name} (ID: {student.studentId})</li>
                      ))}
                    </ul>
                  </div>
                ) : (
                  <p>Not yet assigned to any student.</p>
                )}
                <p>Status: {task.status}</p>
                <p>Assigned By: {task.assignedBy?.email || 'N/A'}</p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default AdminTaskAssignment; 