// controllers/dashboardController.js - Admin analytics
const Appointment = require('../models/Appointment');
const Doctor = require('../models/Doctor');
const User = require('../models/User');
const Category = require('../models/Category');
const Rating = require('../models/Rating');

const getDashboardStats = async (req, res) => {
  try {
    // Totals
    const totalAppointments = await Appointment.countDocuments();
    const totalPatients = await User.countDocuments({ role: 'patient' });
    const totalDoctors = await Doctor.countDocuments();

    // Appointment status breakdown
    const statusCounts = await Appointment.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);
    const statusMap = {};
    statusCounts.forEach(s => { statusMap[s._id] = s.count; });

    // Appointments per category
    const categoryStats = await Appointment.aggregate([
      { $group: { _id: '$categoryId', count: { $sum: 1 } } },
      { $lookup: { from: 'categories', localField: '_id', foreignField: '_id', as: 'category' } },
      { $unwind: '$category' },
      { $project: { name: '$category.name', count: 1, icon: '$category.icon' } }
    ]);

    // Doctor-wise appointments (top 8)
    const doctorStats = await Appointment.aggregate([
      { $group: { _id: '$doctorId', count: { $sum: 1 } } },
      { $lookup: { from: 'doctors', localField: '_id', foreignField: '_id', as: 'doctor' } },
      { $unwind: '$doctor' },
      { $lookup: { from: 'users', localField: 'doctor.userId', foreignField: '_id', as: 'user' } },
      { $unwind: '$user' },
      { $project: { name: '$user.name', count: 1, specialization: '$doctor.specialization' } },
      { $sort: { count: -1 } },
      { $limit: 8 }
    ]);

    // Monthly appointments trend (last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    const monthlyTrend = await Appointment.aggregate([
      { $match: { createdAt: { $gte: sixMonthsAgo } } },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);

    const totalRevenue = await Appointment.aggregate([
      { $match: { status: { $in: ['accepted', 'completed'] } } },
      { $lookup: { from: 'doctors', localField: 'doctorId', foreignField: '_id', as: 'doctor' } },
      { $unwind: '$doctor' },
      { $group: { _id: null, total: { $sum: '$doctor.fee' } } }
    ]);

    res.json({
      success: true,
      stats: {
        totalAppointments,
        totalPatients,
        totalDoctors,
        totalRevenue: totalRevenue[0]?.total || 0,
        statusBreakdown: {
          pending: statusMap.pending || 0,
          accepted: statusMap.accepted || 0,
          rejected: statusMap.rejected || 0,
          completed: statusMap.completed || 0
        },
        categoryStats,
        doctorStats,
        monthlyTrend
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { getDashboardStats };
