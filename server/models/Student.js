const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const StudentSchema = new mongoose.Schema({
  studentId: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  category: { type: String, default: 'frontend' },
  status: {
    type: String,
    enum: ['active', 'inactive', 'suspended'],
    default: 'active'
  },
  password: { type: String, required: true },
  
  // ✅ NEW FIELD: grade
  grade: {
    type: String,
    enum: ['A', 'B', 'C', 'D', 'F', ''],
    default: ''
  }
});

// 🔐 Hash password before saving
StudentSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

module.exports = mongoose.model('Student', StudentSchema);
