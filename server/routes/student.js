const express = require('express');
const router = express.Router();
const { addStudent, getAllStudents, getStudentById, updateStudentStatus, updateStudentCategory, updateStudentGrade } = require('../controllers/studentController');

// Add a new student
router.post('/', addStudent);

// Get all students
router.get('/', getAllStudents);

// Get single student by ID
router.get('/:id', getStudentById);

// Update student status
router.put('/:id/status', updateStudentStatus);

// Update student category
router.put('/:id/category', updateStudentCategory);

// Update student grade
router.put('/:id/grade', updateStudentGrade);

module.exports = router;
