// routes/appointmentRoutes.js
const express = require('express');
const router = express.Router();
const {
  bookAppointment, getPatientAppointments, getDoctorAppointments,
  updateStatus, completeAppointment, getAllAppointments
} = require('../controllers/appointmentController');
const { isAuthenticated, hasRole } = require('../middleware/auth');

router.post('/', isAuthenticated, hasRole('patient'), bookAppointment);
router.get('/my', isAuthenticated, hasRole('patient'), getPatientAppointments);
router.get('/doctor', isAuthenticated, hasRole('doctor'), getDoctorAppointments);
router.put('/:id/status', isAuthenticated, hasRole('doctor'), updateStatus);
router.put('/:id/complete', isAuthenticated, hasRole('doctor'), completeAppointment);
router.get('/all', isAuthenticated, hasRole('admin'), getAllAppointments);

module.exports = router;
