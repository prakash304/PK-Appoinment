// server.js - FINAL (Render + Frontend Working)
require('dotenv').config();

const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI;

// ─── Middleware ─────────────────────────────────────────────
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(cors({
  origin: true,
  credentials: true
}));

app.use(session({
  secret: process.env.SESSION_SECRET || 'secret_key',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: true,
    httpOnly: true,
    sameSite: "none",
    maxAge: 24 * 60 * 60 * 1000
  }
}));

// ─── Static Frontend (FIXED PATH) ───────────────────────────
const frontendPath = path.join(__dirname, 'frontend'); // ✅ FIXED

if (fs.existsSync(frontendPath)) {
  console.log("✅ Frontend folder found");

  app.use(express.static(frontendPath));

  app.get('*', (req, res) => {
    res.sendFile(path.join(frontendPath, 'index.html'));
  });

} else {
  console.log("❌ Frontend folder NOT found at:", frontendPath);
}

// ─── Routes ─────────────────────────────────────────────────
try {
  app.use('/api/auth', require('./routes/authRoutes'));
  app.use('/api/categories', require('./routes/categoryRoutes'));
  app.use('/api/doctors', require('./routes/doctorRoutes'));
  app.use('/api/appointments', require('./routes/appointmentRoutes'));
  app.use('/api/ratings', require('./routes/ratingRoutes'));
  app.use('/api/dashboard', require('./routes/dashboardRoutes'));
} catch (err) {
  console.error("❌ Route loading error:", err);
}

// ─── Start Server ───────────────────────────────────────────
async function startServer() {
  try {
    console.log("🔍 Checking environment...");

    if (!MONGO_URI) {
      throw new Error("MONGO_URI is missing");
    }

    console.log("🔌 Connecting to MongoDB...");
    await mongoose.connect(MONGO_URI);

    console.log("✅ MongoDB connected");

    console.log("🚀 Starting server...");
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });

  } catch (err) {
    console.error("❌ STARTUP ERROR FULL:", err);
    process.exit(1);
  }
}

startServer();
