// routes/dashboardRoutes.js
const express = require('express');
const router = express.Router();
const { getDashboardStats } = require('../controllers/dashboardController');
const { isAuthenticated, hasRole } = require('../middleware/auth');

router.get('/stats', isAuthenticated, hasRole('admin'), getDashboardStats);

module.exports = router;
