const express = require("express");
const Category = require("./models/Category");
const connectDB = require('./config/db');
const dotenv = require('dotenv');
const cors = require("cors");
const mongoose = require("mongoose");
const http = require('http'); // Import http for Socket.IO
const { Server } = require('socket.io'); // Import Server from socket.io

// Load environment variables
dotenv.config();

// Routes
const studentAuthRoutes = require("./routes/studentAuth");     // 🔐 Student login
const studentRoutes = require("./routes/student");             // 🧑‍🎓 Student CRUD
const categoryRoutes = require("./routes/categories");         // 📂 Categories
const taskRoutes = require("./routes/tasks");                  // ✅ Tasks
const adminAuth = require("./routes/adminAuth");               // 🔐 Admin login
const messageRoutes = require('./routes/messages'); // New message routes

const app = express();
app.use(cors());
app.use(express.json());

// Create HTTP server for Socket.IO
const server = http.createServer(app);

// Initialize Socket.IO
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173", // Allow your frontend origin
    methods: ["GET", "POST"]
  }
});

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log('A user connected');

  // Handle chat messages
  socket.on('sendMessage', (message) => {
    console.log('Message received:', message);
    // Broadcast the message to all connected clients
    io.emit('receiveMessage', message);
  });

  socket.on('disconnect', () => {
    console.log('User disconnected');
  });
});

// Add a simple request logger middleware
app.use((req, res, next) => {
  console.log(`Incoming Request: ${req.method} ${req.url}`);
  next();
});

// ✅ MongoDB Connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB connected 🟢");
    initializeCategories(); // Call initialization function after successful connection
  })
  .catch((err) => console.error("MongoDB connection error 🔴", err));

// Function to initialize default categories
const initializeCategories = async () => {
  try {
    const count = await Category.countDocuments();
    if (count === 0) {
      console.log("No categories found. Initializing default categories...");
      await Category.insertMany([
        { name: "Frontend" },
        { name: "Backend" },
        { name: "Fullstack" },
        { name: "Design" },
        { name: "DevOps" },
      ]);
      console.log("Default categories initialized successfully.");
    } else {
      console.log("Categories already exist.");
    }
  } catch (error) {
    console.error("Error initializing categories:", error);
  }
};

// ✅ Test Route
app.get("/", (req, res) => {
  res.send("API is running 🟢");
});

// ✅ Mount Routes
app.use("/api/studentAuth", studentAuthRoutes);   // 👈 student login
app.use("/api/students", studentRoutes);          // 👈 student CRUD
app.use("/api/categories", categoryRoutes);       // categories
app.use("/api/tasks", taskRoutes);                // tasks
app.use("/api/admin", adminAuth);                 // admin login
app.use('/api/messages', messageRoutes); // New message routes

// Catch-all for unhandled API routes
app.use("/api/*", (req, res) => {
  console.log(`Unhandled API Request: ${req.method} ${req.url}`);
  res.status(404).json({ message: "API endpoint not found." });
});

// Catch-all for all other routes (serves frontend or generic 404)
app.use((req, res) => {
  console.log(`Unhandled Request: ${req.method} ${req.url}`);
  res.status(404).send(`Cannot ${req.method} ${req.url}`);
});

// ✅ Start Server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
