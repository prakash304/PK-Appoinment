// models/Category.js - Disease categories (Fever, Skin, Heart, etc.)
const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  image: {
    type: String, // URL to category image (using picsum/unsplash placeholders)
    default: ''
  },
  icon: {
    type: String, // emoji icon for quick display
    default: '🏥'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Category', categorySchema);
