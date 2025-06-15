// routes/studentAuth.js
const express = require('express');
const router = express.Router();
const Student = require('../models/Student');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');


router.post('/login', async (req, res) => {
  console.log("Student login attempt received.");
  try {
    const { studentId, password } = req.body;

    if (!studentId || !password) {
      console.log("Missing studentId or password.");
      return res.status(400).json({ message: 'Please provide both student ID and password.' });
    }

    const student = await Student.findOne({ studentId });
    if (!student) {
      console.log(`Student with ID ${studentId} not found.`);
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, student.password);
    if (!isMatch) {
      console.log("Password mismatch for student:", studentId);
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { id: student._id, role: 'student' },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );

    console.log("Student logged in successfully:", studentId);
    res.status(200).json({
      token,
      studentId: student.studentId,
      name: student.name,
      category: student.category,
      _id: student._id
    });
  } catch (err) {
    console.error("Student login error:", err.message); // Log the specific error message
    res.status(500).json({ message: "Server error. Please try again later." });
  }
});


module.exports = router;