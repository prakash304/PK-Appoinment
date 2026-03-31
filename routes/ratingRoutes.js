// routes/ratingRoutes.js
const express = require('express');
const router = express.Router();
const { submitRating, getDoctorRatings } = require('../controllers/ratingController');
const { isAuthenticated, hasRole } = require('../middleware/auth');

router.post('/', isAuthenticated, hasRole('patient'), submitRating);
router.get('/doctor/:doctorId', getDoctorRatings); // public

module.exports = router;
