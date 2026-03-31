// server.js - Production Ready (Render Safe)
require('dotenv').config();

const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 5000;

// ❌ REMOVE localhost fallback (causes crash on Render)
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
    secure: true,          // ✅ REQUIRED for Render (HTTPS)
    httpOnly: true,
    sameSite: "none",      // ✅ IMPORTANT for frontend
    maxAge: 24 * 60 * 60 * 1000
  }
}));

// ─── Static Frontend (SAFE) ─────────────────────────────────
const frontendPath = path.join(__dirname, '../frontend');

if (fs.existsSync(frontendPath)) {
  app.use(express.static(frontendPath));

  app.get('*', (req, res) => {
    res.sendFile(path.join(frontendPath, 'index.html'));
  });
} else {
  console.log("⚠️ Frontend folder not found");
}

// ─── Routes (SAFE LOAD) ─────────────────────────────────────
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

// ─── Start Server (SAFE) ────────────────────────────────────
async function startServer() {
  try {
    console.log("🔍 Checking environment...");

    if (!process.env.MONGO_URI) {
      throw new Error("MONGO_URI is missing");
    }

    console.log("🔌 Connecting to MongoDB...");
    await mongoose.connect(process.env.MONGO_URI);

    console.log("✅ MongoDB connected");

    // ❌ TEMP: disable seed completely
    // await require('./seedData')();

    console.log("🚀 Starting server...");
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });

  } catch (err) {
    console.error("❌ STARTUP ERROR FULL:", err); // 👈 IMPORTANT
    process.exit(1);
  }
}

startServer();