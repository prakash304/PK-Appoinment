// controllers/doctorController.js
const Doctor = require('../models/Doctor');
const User = require('../models/User');
const Rating = require('../models/Rating');

// Get all doctors (optionally filter by category)
const getDoctors = async (req, res) => {
  try {
    const filter = { isActive: true };
    if (req.query.categoryId) filter.categoryId = req.query.categoryId;

    const doctors = await Doctor.find(filter)
      .populate('userId', 'name email')
      .populate('categoryId', 'name icon');

    res.json({ success: true, doctors });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Get single doctor with ratings
const getDoctorById = async (req, res) => {
  try {
    const doctor = await Doctor.findById(req.params.id)
      .populate('userId', 'name email phone')
      .populate('categoryId', 'name icon');

    if (!doctor) return res.status(404).json({ success: false, message: 'Doctor not found' });

    // Get reviews
    const ratings = await Rating.find({ doctorId: doctor._id })
      .populate('patientId', 'name')
      .sort({ createdAt: -1 })
      .limit(10);

    res.json({ success: true, doctor, ratings });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Get doctor's own profile
const getMyProfile = async (req, res) => {
  try {
    const doctor = await Doctor.findOne({ userId: req.session.userId })
      .populate('userId', 'name email phone')
      .populate('categoryId', 'name icon');

    if (!doctor) return res.status(404).json({ success: false, message: 'Doctor profile not found' });

    res.json({ success: true, doctor });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { getDoctors, getDoctorById, getMyProfile };
