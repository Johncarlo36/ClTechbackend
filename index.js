// [SECTION] Dependencies and Modules
const express = require('express');         // Import Express framework to create API routes and server
const mongoose = require('mongoose');       // Mongoose handles MongoDB connection and data models
const cors = require('cors');               // Middleware to allow cross-origin requests (e.g., frontend on a different port)
require('dotenv').config();                 // Load environment variables from .env file into process.env

// [SECTION] Routes
const userRoute = require('./routes/user');           // Route handling for user-related endpoints
const courseRoutes = require("./routes/course");      // Route handling for course-related endpoints
const enrollmentRoutes = require("./routes/enrollment"); // Route handling for enrollment-related endpoints
const newsRoutes = require('./routes/news');          // Route handling for news-related endpoints

// [SECTION] App Initialization
const app = express();  // Create an Express application instance

// [SECTION] MongoDB Connection
// Use environment variable or default connection string to connect to MongoDB
const mongoSTRING = process.env.MONGODB_STRING || 
  "mongodb+srv://admin:admin1234@johncarlo.mwbnunw.mongodb.net/course-booking-API?retryWrites=true&w=majority&appName=johncarlo";

// Connect to MongoDB Atlas using Mongoose
mongoose.connect(mongoSTRING)
  .then(() => console.log('✅ Connected to MongoDB Atlas'))   // Success message
  .catch(err => {
    console.error('❌ MongoDB connection error:', err);       // Log error if connection fails
    process.exit(1);                                          // Exit process if database fails to connect
  });

// [SECTION] CORS Configuration
const corsOptions = {
  origin: ['http://localhost:4001'],  // Allow requests from this origin (React frontend)
  credentials: true,                  // Allow sending of cookies/auth headers
  optionsSuccessStatus: 200          // HTTP status for preflight requests
};

// [SECTION] Middleware
app.use(cors(corsOptions));     // Enable CORS with specified options
app.use(express.json());        // Middleware to parse incoming JSON requests

// [SECTION] Routes
// Define route groups (mount route handlers to specific base paths)
app.use('/users', userRoute);             // All /users endpoints handled in routes/user.js
app.use('/courses', courseRoutes);        // All /courses endpoints handled in routes/course.js
app.use('/enrollments', enrollmentRoutes); // All /enrollments endpoints handled in routes/enrollment.js
app.use('/news', newsRoutes);             // All /news endpoints handled in routes/news.js

// [SECTION] Start Server
const PORT = process.env.PORT || 4000;     // Use port from environment or default to 4000
if (require.main === module) {
  // Only start the server if this file is run directly (not imported in tests)
  app.listen(PORT, () => {
    console.log(`🚀 API is running on http://localhost:${PORT}`);
  });
}

// Export app and mongoose for testing or external usage (e.g., serverless deployment)
module.exports = { app, mongoose };
