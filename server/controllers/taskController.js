const Task = require('../models/Task');
const Student = require('../models/Student');
const Category = require('../models/Category');

// Create a new task
const createTask = async (req, res) => {
  try {
    const { 
      title, 
      description, 
      requirements, 
      deadline, 
      categoryId 
    } = req.body;

    // Validate required fields
    if (!title || !description || !requirements || !deadline || !categoryId) {
      return res.status(400).json({ 
        message: 'All fields (title, description, requirements, deadline, category) are required.' 
      });
    }

    // Validate deadline format
    const deadlineDate = new Date(deadline);
    if (isNaN(deadlineDate.getTime())) {
      return res.status(400).json({ 
        message: 'Invalid deadline format. Please provide a valid date.' 
      });
    }

    // Verify category exists
    const category = await Category.findById(categoryId);
    if (!category) {
      return res.status(404).json({ message: 'Category not found.' });
    }

    const newTask = new Task({
      title,
      description,
      requirements,
      deadline: deadlineDate,
      category: categoryId,
      assignedBy: req.user.id // From auth middleware
    });

    await newTask.save();

    res.status(201).json({
      message: 'Task created successfully',
      task: newTask
    });

  } catch (error) {
    console.error('Error creating task:', error);
    res.status(500).json({ 
      message: 'Server error creating task.',
      error: error.message 
    });
  }
};

// Get all tasks (with filtering options)
const getAllTasks = async (req, res) => {
  try {
    const { 
      status, 
      category, 
      assignedTo, 
      assignedBy,
      sortBy = 'deadline',
      sortOrder = 'asc'
    } = req.query;

    let query = {};

    // Apply filters if provided
    if (status) query.status = status;
    if (category) query.category = category;
    if (assignedTo) query.assignedTo = assignedTo;
    if (assignedBy) query.assignedBy = assignedBy;

    // Build sort object
    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const tasks = await Task.find(query)
      .sort(sort)
      .populate('category', 'name')
      .populate('assignedTo', 'name studentId')
      .populate('assignedBy', 'email')
      .populate({
        path: 'submissions.student',
        select: 'name studentId _id'
      });

    res.status(200).json(tasks);
  } catch (error) {
    console.error('Error fetching tasks:', error);
    res.status(500).json({ message: 'Server error fetching tasks.' });
  }
};

// Get a single task by ID
const getTaskById = async (req, res) => {
  try {
    const task = await Task.findById(req.params.taskId)
      .populate('category', 'name')
      .populate('assignedTo', 'name studentId')
      .populate('assignedBy', 'email')
      .populate('submissions.student', 'name studentId');

    if (!task) {
      return res.status(404).json({ message: 'Task not found.' });
    }
    res.status(200).json(task);
  } catch (error) {
    console.error('Error fetching single task:', error);
    res.status(500).json({ message: 'Server error fetching task.', error: error.message });
  }
};

// Assign task to students or category
const assignTask = async (req, res) => {
  try {
    const { taskId, assignmentType, targetId, deadline } = req.body;

    if (!taskId || !assignmentType || !targetId || !deadline) {
      return res.status(400).json({ 
        message: 'Task ID, assignment type, target, and deadline are required.' 
      });
    }

    // Validate deadline format
    const deadlineDate = new Date(deadline);
    if (isNaN(deadlineDate.getTime())) {
      return res.status(400).json({ 
        message: 'Invalid deadline format. Please provide a valid date.' 
      });
    }

    const task = await Task.findById(taskId);
    if (!task) {
      return res.status(404).json({ message: 'Task not found.' });
    }

    let studentsToAssign = [];

    if (assignmentType === 'student') {
      const student = await Student.findById(targetId);
      if (!student) {
        return res.status(404).json({ message: 'Student not found.' });
      }
      studentsToAssign.push(student);
    } else if (assignmentType === 'category') {
      studentsToAssign = await Student.find({ category: targetId });
      if (studentsToAssign.length === 0) {
        return res.status(404).json({ message: 'No students found in this category.' });
      }
    } else {
      return res.status(400).json({ message: 'Invalid assignment type.' });
    }

    // Update task with new assignments
    task.assignedTo = studentsToAssign.map(student => student._id);
    task.deadline = deadlineDate;
    await task.save();

    // Update students with task assignment
    const updatePromises = studentsToAssign.map(student => {
      student.tasks = student.tasks || [];
      student.tasks.push({
        taskId: task._id,
        deadline: deadlineDate,
        status: 'pending'
      });
      return student.save();
    });

    await Promise.all(updatePromises);

    res.status(200).json({
      message: `Task assigned successfully to ${studentsToAssign.length} student(s).`,
      task
    });

  } catch (error) {
    console.error('Error assigning task:', error);
    res.status(500).json({ message: 'Server error assigning task.' });
  }
};

// Submit task solution
const submitTask = async (req, res) => {
  try {
    const { taskId } = req.params;
    const { githubLink } = req.body;
    const studentId = req.user.id;

    const task = await Task.findById(taskId);
    if (!task) {
      return res.status(404).json({ message: 'Task not found.' });
    }

    // Check if student is assigned to this task
    if (!task.assignedTo.map(id => id.toString()).includes(studentId)) {
      return res.status(403).json({ message: 'You are not assigned to this task.' });
    }

    // Add or update submission
    const submissionIndex = task.submissions.findIndex(
      sub => sub.student.toString() === studentId
    );

    const submission = {
      student: studentId,
      githubLink,
      submittedAt: new Date(),
      status: 'pending'
    };

    if (submissionIndex === -1) {
      task.submissions.push(submission);
    } else {
      task.submissions[submissionIndex] = submission;
    }

    task.status = 'submitted';
    await task.save();

    res.status(200).json({
      message: 'Task submitted successfully.',
      task
    });

  } catch (error) {
    console.error('Error submitting task:', error);
    res.status(500).json({ message: 'Server error submitting task.' });
  }
};

// Review task submission
const reviewTask = async (req, res) => {
  try {
    const { taskId, studentId } = req.params;
    const { status, feedback } = req.body;

    // Validate required fields
    if (!status || !['approved', 'rejected', 'in_progress'].includes(status)) {
      return res.status(400).json({ 
        message: 'Valid status (approved/rejected/in_progress) is required.' 
      });
    }

    // Find the task and populate student submission data
    const task = await Task.findById(taskId)
      .populate({
        path: 'submissions.student',
        select: 'name studentId _id'
      });

    console.log('Review Task - Received taskId:', taskId, 'studentId:', studentId);
    if (task) {
      console.log('Review Task - Fetched Task Submissions:', task.submissions.map(sub => ({ studentId: sub.student?._id.toString(), status: sub.status })));
    } else {
      console.log('Review Task - Task not found for taskId:', taskId);
    }

    if (!task) {
      return res.status(404).json({ message: 'Task not found.' });
    }

    // Find the submission for this student
    const submission = task.submissions.find(
      sub => sub.student && sub.student._id.toString() === studentId
    );

    if (!submission) {
      return res.status(404).json({ message: 'Submission not found for this student.' });
    }

    // Update submission status and feedback
    submission.status = status;
    submission.feedback = feedback || 'No feedback provided';
    submission.reviewedAt = new Date();

    // Update overall task status
    if (status === 'approved') {
      task.status = 'completed';
    } else if (status === 'rejected') {
      task.status = 'rejected';
    } else if (status === 'in_progress') {
      task.status = 'in_progress';
    }

    // Save the updated task
    await task.save();

    res.status(200).json({
      message: 'Task reviewed successfully.',
      task
    });

  } catch (error) {
    console.error('Error reviewing task:', error);
    res.status(500).json({ 
      message: 'Server error reviewing task.',
      error: error.message 
    });
  }
};

module.exports = {
  createTask,
  getAllTasks,
  assignTask,
  submitTask,
  reviewTask,
  getTaskById
}; 