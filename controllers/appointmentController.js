// controllers/appointmentController.js
const Appointment = require('../models/Appointment');
const Doctor = require('../models/Doctor');

// Book appointment (patient)
const bookAppointment = async (req, res) => {
  try {
    const { doctorId, categoryId, date, time, symptoms } = req.body;
    const patientId = req.session.userId;

    if (!doctorId || !categoryId || !date || !time || !symptoms) {
      return res.status(400).json({ success: false, message: 'All fields are required' });
    }

    // Check for duplicate booking
    const existing = await Appointment.findOne({ patientId, doctorId, date, time, status: { $ne: 'rejected' } });
    if (existing) {
      return res.status(400).json({ success: false, message: 'You already have an appointment at this time' });
    }

    const appointment = new Appointment({ patientId, doctorId, categoryId, date, time, symptoms });
    await appointment.save();

    res.status(201).json({ success: true, message: 'Appointment booked successfully', appointment });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Get patient's appointments
const getPatientAppointments = async (req, res) => {
  try {
    const appointments = await Appointment.find({ patientId: req.session.userId })
      .populate({ path: 'doctorId', populate: { path: 'userId', select: 'name' } })
      .populate('categoryId', 'name icon')
      .sort({ createdAt: -1 });

    res.json({ success: true, appointments });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Get doctor's appointment requests
const getDoctorAppointments = async (req, res) => {
  try {
    const doctorId = req.session.doctorId;
    const appointments = await Appointment.find({ doctorId })
      .populate('patientId', 'name email phone age gender')
      .populate('categoryId', 'name icon')
      .sort({ createdAt: -1 });

    res.json({ success: true, appointments });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Update appointment status (doctor)
const updateStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, doctorNotes } = req.body;
    const doctorId = req.session.doctorId;

    const appointment = await Appointment.findOne({ _id: id, doctorId });
    if (!appointment) {
      return res.status(404).json({ success: false, message: 'Appointment not found' });
    }

    appointment.status = status;
    if (doctorNotes) appointment.doctorNotes = doctorNotes;
    await appointment.save();

    res.json({ success: true, message: `Appointment ${status}`, appointment });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Mark appointment as completed (doctor)
const completeAppointment = async (req, res) => {
  try {
    const { id } = req.params;
    const doctorId = req.session.doctorId;

    const appointment = await Appointment.findOneAndUpdate(
      { _id: id, doctorId, status: 'accepted' },
      { status: 'completed' },
      { new: true }
    );
    if (!appointment) return res.status(404).json({ success: false, message: 'Appointment not found' });

    res.json({ success: true, message: 'Appointment marked as completed', appointment });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Get all appointments (admin)
const getAllAppointments = async (req, res) => {
  try {
    const appointments = await Appointment.find()
      .populate('patientId', 'name email')
      .populate({ path: 'doctorId', populate: { path: 'userId', select: 'name' } })
      .populate('categoryId', 'name')
      .sort({ createdAt: -1 });

    res.json({ success: true, appointments });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { bookAppointment, getPatientAppointments, getDoctorAppointments, updateStatus, completeAppointment, getAllAppointments };
