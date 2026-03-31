// controllers/authController.js - Register, Login, Logout, Session check
const User = require('../models/User');
const Doctor = require('../models/Doctor');
const Category = require('../models/Category');

// Register a new patient
const register = async (req, res) => {
  try {
    const { name, email, password, phone, age, gender } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'Name, email and password are required' });
    }

    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({ success: false, message: 'Email already registered' });
    }

    const user = new User({ name, email, password, phone, age, gender, role: 'patient' });
    await user.save();

    // Auto login after registration
    req.session.userId = user._id;
    req.session.role = user.role;
    req.session.name = user.name;

    res.status(201).json({
      success: true,
      message: 'Registration successful',
      user: { id: user._id, name: user.name, email: user.email, role: user.role }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Login
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password required' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    req.session.userId = user._id;
    req.session.role = user.role;
    req.session.name = user.name;

    // If doctor, also store doctorId
    if (user.role === 'doctor') {
      const doctor = await Doctor.findOne({ userId: user._id });
      if (doctor) req.session.doctorId = doctor._id;
    }

    res.json({
      success: true,
      message: 'Login successful',
      user: { id: user._id, name: user.name, email: user.email, role: user.role }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Logout
const logout = (req, res) => {
  req.session.destroy(err => {
    if (err) return res.status(500).json({ success: false, message: 'Logout failed' });
    res.clearCookie('connect.sid');
    res.json({ success: true, message: 'Logged out successfully' });
  });
};

// Get current session
const getSession = (req, res) => {
  if (req.session && req.session.userId) {
    return res.json({
      success: true,
      user: {
        id: req.session.userId,
        name: req.session.name,
        role: req.session.role,
        doctorId: req.session.doctorId || null
      }
    });
  }
  res.json({ success: false, message: 'No active session' });
};

module.exports = { register, login, logout, getSession };
