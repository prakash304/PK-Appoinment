// controllers/ratingController.js
const Rating = require('../models/Rating');
const Doctor = require('../models/Doctor');
const Appointment = require('../models/Appointment');

// Submit a rating (patient only, after completed appointment)
const submitRating = async (req, res) => {
  try {
    const { appointmentId, rating, review } = req.body;
    const patientId = req.session.userId;

    if (!appointmentId || !rating) {
      return res.status(400).json({ success: false, message: 'Appointment ID and rating required' });
    }
    if (rating < 1 || rating > 5) {
      return res.status(400).json({ success: false, message: 'Rating must be between 1 and 5' });
    }

    // Verify appointment belongs to patient and is completed
    const appointment = await Appointment.findOne({
      _id: appointmentId,
      patientId,
      status: 'completed',
      isRated: false
    });
    if (!appointment) {
      return res.status(400).json({ success: false, message: 'Cannot rate this appointment' });
    }

    // Save rating
    const newRating = new Rating({
      doctorId: appointment.doctorId,
      patientId,
      appointmentId,
      rating,
      review: review || ''
    });
    await newRating.save();

    // Mark appointment as rated
    appointment.isRated = true;
    await appointment.save();

    // Recalculate doctor's average rating
    const allRatings = await Rating.find({ doctorId: appointment.doctorId });
    const avg = allRatings.reduce((sum, r) => sum + r.rating, 0) / allRatings.length;
    await Doctor.findByIdAndUpdate(appointment.doctorId, {
      averageRating: Math.round(avg * 10) / 10,
      totalRatings: allRatings.length
    });

    res.status(201).json({ success: true, message: 'Rating submitted successfully', rating: newRating });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({ success: false, message: 'You have already rated this appointment' });
    }
    res.status(500).json({ success: false, message: err.message });
  }
};

// Get ratings for a doctor
const getDoctorRatings = async (req, res) => {
  try {
    const ratings = await Rating.find({ doctorId: req.params.doctorId })
      .populate('patientId', 'name')
      .sort({ createdAt: -1 });

    res.json({ success: true, ratings });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { submitRating, getDoctorRatings };
