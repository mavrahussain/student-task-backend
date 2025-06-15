const express = require('express');
const auth = require('../middleware/auth');
const Task = require('../models/Task');
const router = express.Router();
const { 
  createTask, 
  getAllTasks, 
  assignTask, 
  submitTask, 
  reviewTask, 
  getTaskById 
} = require('../controllers/taskController');

// Get tasks - handles both student and admin views
router.get('/', auth, async (req, res) => {
  try {
    let tasks;
    if (req.user.role === 'admin') {
      tasks = await Task.find()
        .populate('category', 'name')
        .populate('assignedTo', 'name studentId')
        .populate('assignedBy', 'email')
        .populate({
          path: 'submissions.student',
          select: 'name studentId _id'
        })
        .populate({
          path: 'submissions',
          select: 'status feedback githubLink submittedAt'
        })
        .sort({ createdAt: -1 });
    } else {
      tasks = await Task.find({ assignedTo: req.user.id })
        .populate('category', 'name')
        .populate('assignedTo', 'name studentId')
        .populate('assignedBy', 'email')
        .populate({
          path: 'submissions.student',
          select: 'name studentId _id'
        })
        .populate({
          path: 'submissions',
          select: 'status feedback githubLink submittedAt'
        })
        .sort({ createdAt: -1 });
    }
    res.json(tasks);
  } catch (err) {
    console.error('Error fetching tasks:', err);
    res.status(500).json({ message: 'Server error fetching tasks' });
  }
});

// Get all assignments (admin only)
router.get('/assignments', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied. Admin only.' });
    }

    const tasks = await Task.find()
      .populate('category', 'name')
      .populate('assignedTo', 'name studentId')
      .populate('assignedBy', 'email')
      .populate({
        path: 'submissions.student',
        select: 'name studentId _id'
      })
      .populate({
        path: 'submissions',
        select: 'status feedback githubLink submittedAt'
      })
      .sort({ createdAt: -1 });

    res.json(tasks);
  } catch (err) {
    console.error('Error fetching assignments:', err);
    res.status(500).json({ message: 'Server error fetching assignments.' });
  }
});

// Submit GitHub link for task
router.patch('/:id/submit', auth, async (req, res) => {
  const { githubLink } = req.body;
  
  try {
    const task = await Task.findOneAndUpdate(
      { _id: req.params.id, studentId: req.user.studentId },
      { githubLink, status: 'submitted' },
      { new: true }
    );
    
    if (!task) return res.status(404).json({ error: 'Task not found' });
    res.json(task);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Create a new task (Admin only)
router.post('/', auth, createTask);

// Get all tasks (with filtering)
router.get('/', auth, getAllTasks);

// Get a single task by ID (Student and Admin)
router.get('/:taskId', auth, getTaskById);

// Assign task to student(s) or category
router.post('/assign', auth, assignTask);

// Submit task solution (Student only)
router.post('/:taskId/submit', auth, submitTask);

// Review task submission (Admin only)
router.post('/:taskId/review/:studentId', auth, reviewTask);

module.exports = router;