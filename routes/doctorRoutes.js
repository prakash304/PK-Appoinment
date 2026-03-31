// routes/doctorRoutes.js
const express = require('express');
const router = express.Router();
const { getDoctors, getDoctorById, getMyProfile } = require('../controllers/doctorController');
const { isAuthenticated, hasRole } = require('../middleware/auth');

router.get('/', getDoctors);               // public
router.get('/me', isAuthenticated, hasRole('doctor'), getMyProfile);
router.get('/:id', getDoctorById);         // public

module.exports = router;
