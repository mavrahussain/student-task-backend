const express = require('express');
const router = express.Router();
const Admin = require('../models/Admin');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const auth = require('../middleware/auth'); // Import auth middleware
const { getAllAdmins } = require('../controllers/adminController'); // Import admin controller

// Admin login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const admin = await Admin.findOne({ email });
    if (!admin) return res.status(404).json({ message: 'Admin not found' });

    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) return res.status(401).json({ message: 'Invalid credentials' });

    const token = jwt.sign(
      { id: admin._id, role: 'admin' },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );
    res.json({ token, id: admin._id, email: admin.email, role: 'admin' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Admin registration
router.post('/register', async (req, res) => {
  try {
    const { email, password } = req.body;
    const admin = new Admin({ email, password });
    await admin.save();
    res.status(201).json({ message: "Admin created successfully" });
  } catch (err) {
    res.status(500).json({ message: "Error creating admin", error: err.message });
  }
});

// Get all admins (accessible to authenticated users, both students and admins)
router.get('/', auth, getAllAdmins);

module.exports = router;  