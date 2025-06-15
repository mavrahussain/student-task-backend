const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// Import Routes
const studentAuthRoutes = require('./routes/studentAuth');
const adminAuthRoutes = require('./routes/adminAuth');
const taskRoutes = require('./routes/tasks');
const messageRoutes = require('./routes/messages');
const categoryRoutes = require('./routes/categories');
const portfolioRoutes = require('./routes/portfolioRoutes');
const reportingRoutes = require('./routes/reportingRoutes');

// Use Routes
app.use('/api/student', studentAuthRoutes);
app.use('/api/admin', adminAuthRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/portfolio', portfolioRoutes);
app.use('/api/reporting', reportingRoutes);

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Connected"))
  .catch(err => console.log(err));

// Test Route
app.get('/', (req, res) => res.send("Backend Running"));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));