const Student = require('../models/Student');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');

// Add a new student
const addStudent = async (req, res) => {
  try {
    const { name, email } = req.body;

    // Check if student with same email already exists
    const existingStudent = await Student.findOne({ email });
    if (existingStudent) {
      return res.status(400).json({ message: 'Email already exists' });
    }

    // Generate a unique student ID
    const studentId = `STU-${uuidv4().slice(0, 8)}`;

    // Generate a random initial password
    const initialPassword = Math.random().toString(36).slice(-8);

    // Hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(initialPassword, salt);

    // Create new student
    const newStudent = new Student({
      studentId,
      name,
      email,
      password: hashedPassword,
      status: 'active'
    });

    // Save the student
    await newStudent.save();

    // Return success response
    res.status(201).json({
      message: 'Student added successfully',
      student: {
        id: newStudent._id,
        studentId: newStudent.studentId,
        name: newStudent.name,
        email: newStudent.email,
        category: newStudent.category
      },
      initialPassword
    });

  } catch (error) {
    console.error('Error adding student:', error);
    res.status(500).json({ message: `Failed to add student: ${error.message}` });
  }
};

// Get all students
const getAllStudents = async (req, res) => {
  try {
    const students = await Student.find();
    res.status(200).json(students);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching students' });
  }
};

// Get single student by ID
const getStudentById = async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);
    if (!student) return res.status(404).json({ message: 'Student not found' });
    res.status(200).json(student);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching student' });
  }
};

// Update student status
const updateStudentStatus = async (req, res) => {
  try {
    const { status } = req.body;
    await Student.findByIdAndUpdate(req.params.id, { status });
    res.json({ message: 'Status updated successfully.' });
  } catch (err) {
    console.error('Update status error:', err);
    res.status(500).json({ message: 'Failed to update status' });
  }
};

// Update student category
const updateStudentCategory = async (req, res) => {
  try {
    const { category } = req.body;
    if (!category) {
      return res.status(400).json({ message: 'Category is required.' });
    }
    await Student.findByIdAndUpdate(req.params.id, { category });
    res.json({ message: 'Category updated successfully.' });
  } catch (err) {
    console.error('Update category error:', err);
    res.status(500).json({ message: 'Failed to update category' });
  }
};

// Update student grade
const updateStudentGrade = async (req, res) => {
  try {
    const { grade } = req.body;
    if (!grade) {
      return res.status(400).json({ message: 'Grade is required.' });
    }
    await Student.findByIdAndUpdate(req.params.id, { grade });
    res.json({ message: 'Grade updated successfully.' });
  } catch (err) {
    console.error('Update grade error:', err);
    res.status(500).json({ message: 'Failed to update grade' });
  }
};

module.exports = {
  addStudent,
  getAllStudents,
  getStudentById,
  updateStudentStatus,
  updateStudentCategory,
  updateStudentGrade
};
