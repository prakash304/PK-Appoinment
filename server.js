// server.js - Fixed for Render deployment
require('dotenv').config();

const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');
const cors = require('cors');
const path = require('path');

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
    secure: true, // ✅ required for Render (HTTPS)
    httpOnly: true,
    sameSite: "none", // ✅ important for cross-origin
    maxAge: 24 * 60 * 60 * 1000
  }
}));

// ─── Static Files ───────────────────────────────────────────

// Try both paths (works in most deployments)
const frontendPath = path.join(__dirname, '../frontend');
app.use(express.static(frontendPath));

// ─── Routes ─────────────────────────────────────────────────
try {
  app.use('/api/auth', require('./routes/authRoutes'));
  app.use('/api/categories', require('./routes/categoryRoutes'));
  app.use('/api/doctors', require('./routes/doctorRoutes'));
  app.use('/api/appointments', require('./routes/appointmentRoutes'));
  app.use('/api/ratings', require('./routes/ratingRoutes'));
  app.use('/api/dashboard', require('./routes/dashboardRoutes'));
} catch (err) {
  console.error('❌ Route loading error:', err);
}

// ─── Frontend Fallback ──────────────────────────────────────
app.get('*', (req, res) => {
  res.sendFile(path.join(frontendPath, 'index.html'), (err) => {
    if (err) {
      console.error('❌ Frontend load error:', err);
      res.status(500).send("Frontend not found");
    }
  });
});

// ─── MongoDB Connection ─────────────────────────────────────
mongoose.connect(MONGO_URI)
  .then(async () => {
    console.log('✅ MongoDB connected');

    // ❗ SAFE SEEDING (won't crash app)
    try {
      if (process.env.NODE_ENV !== "production") {
        await require('./seedData')();
        console.log('✅ Seed data loaded');
      }
    } catch (err) {
      console.error('❌ Seed error:', err.message);
    }

    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });
  })
  .catch(err => {
    console.error('❌ MongoDB FULL ERROR:', err);
    process.exit(1);
  });