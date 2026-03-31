// models/Doctor.js - Doctor profile linked to a User account
const mongoose = require('mongoose');

const doctorSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  specialization: {
    type: String,
    required: true
  },
  categoryId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    required: true
  },
  experience: {
    type: Number, // years
    default: 0
  },
  fee: {
    type: Number, // consultation fee in ₹
    default: 500
  },
  qualifications: {
    type: String,
    default: 'MBBS'
  },
  bio: {
    type: String,
    default: ''
  },
  avatar: {
    type: String, // avatar URL
    default: ''
  },
  availableDays: {
    type: [String], // ['Monday', 'Tuesday', ...]
    default: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']
  },
  availableTime: {
    start: { type: String, default: '09:00' },
    end: { type: String, default: '17:00' }
  },
  isActive: {
    type: Boolean,
    default: true
  },
  // Computed from Ratings
  averageRating: {
    type: Number,
    default: 0
  },
  totalRatings: {
    type: Number,
    default: 0
  }
});

module.exports = mongoose.model('Doctor', doctorSchema);
