const express = require("express");
const app = express();
const mongoose = require("mongoose");
require('dotenv').config();

// Database connection
mongoose.connect(process.env.MONGODB_URL)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

// ... rest of your middleware and routes

// Export for Vercel
module.exports = app;

// Start server only in development
if (process.env.NODE_ENV !== 'production') {
    app.listen(8080, () => {
        console.log("Server is running on port 8080");
    });
}