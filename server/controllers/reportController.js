const Pass = require('../models/Pass');
const Appointment = require('../models/Appointment');
const Visitor = require('../models/Visitor');
const CheckLog = require('../models/CheckLog');
const User = require('../models/User');
const { getRecentNotifications } = require('../utils/notificationService');

/**
 * @desc    Get system dashboard KPI metrics & analytics
 * @route   GET /api/reports/dashboard-stats
 * @access  Private
 */
const getDashboardStats = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Filter counts based on role
    const isEmployee = req.user.role === 'employee';
    const isVisitor = req.user.role === 'visitor';

    let appointmentFilter = {};
    let passFilter = {};

    if (isEmployee) {
      appointmentFilter.host = req.user._id;
      passFilter.host = req.user._id;
    } else if (isVisitor) {
      const visitor = await Visitor.findOne({
        $or: [{ userAccount: req.user._id }, { email: req.user.email }],
      });
      if (visitor) {
        appointmentFilter.visitor = visitor._id;
        passFilter.visitor = visitor._id;
      }
    }

    const [
      totalVisitors,
      totalPasses,
      activeInside,
      pendingAppointments,
      approvedToday,
      totalEmployees,
    ] = await Promise.all([
      Visitor.countDocuments(),
      Pass.countDocuments(passFilter),
      CheckLog.countDocuments({ status: 'CheckedIn' }),
      Appointment.countDocuments({ ...appointmentFilter, status: 'Pending' }),
      Appointment.countDocuments({
        ...appointmentFilter,
        status: 'Approved',
        visitDate: { $gte: today, $lt: tomorrow },
      }),
      User.countDocuments({ role: 'employee', isActive: true }),
    ]);

    // Breakdown by Purpose
    const purposeStats = await Appointment.aggregate([
      { $match: appointmentFilter },
      { $group: { _id: '$purpose', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);

    // Recent 7 Days trend
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
    sevenDaysAgo.setHours(0, 0, 0, 0);

    const recentDailyPasses = await Pass.aggregate([
      { $match: { createdAt: { $gte: sevenDaysAgo } } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    // Notifications
    const notifications = getRecentNotifications().slice(0, 10);

    return res.status(200).json({
      success: true,
      stats: {
        totalVisitors,
        totalPasses,
        activeInside,
        pendingAppointments,
        approvedToday,
        totalEmployees,
        purposeStats,
        recentDailyPasses,
      },
      notifications,
    });
  } catch (error) {
    console.error('Stats Error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc    Export visitor / check-in logs in CSV format
 * @route   GET /api/reports/export-csv
 * @access  Private (Admin, Security)
 */
const exportCSV = async (req, res) => {
  try {
    const logs = await CheckLog.find()
      .populate('visitor')
      .populate('pass')
      .populate('checkedInBy', 'name')
      .populate('checkedOutBy', 'name')
      .sort({ checkInTime: -1 });

    let csvContent = 'LogID,PassCode,VisitorName,Phone,Company,Gate,CheckInTime,CheckOutTime,Status,CheckedInBy,Belongings\n';

    logs.forEach((log) => {
      const logId = log._id;
      const passCode = log.pass ? log.pass.passCode : 'N/A';
      const name = log.visitor ? `"${log.visitor.fullName}"` : 'Unknown';
      const phone = log.visitor ? log.visitor.phone : 'N/A';
      const company = log.visitor ? `"${log.visitor.company}"` : 'N/A';
      const gate = `"${log.gate || 'Gate 1'}"`;
      const inTime = log.checkInTime ? new Date(log.checkInTime).toISOString() : '';
      const outTime = log.checkOutTime ? new Date(log.checkOutTime).toISOString() : '';
      const status = log.status;
      const guard = log.checkedInBy ? `"${log.checkedInBy.name}"` : 'N/A';
      const belongings = `"${(log.belongings || '').replace(/"/g, '""')}"`;

      csvContent += `${logId},${passCode},${name},${phone},${company},${gate},${inTime},${outTime},${status},${guard},${belongings}\n`;
    });

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="Visitor-Logs-${Date.now()}.csv"`);
    return res.status(200).send(csvContent);
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc    Get live system notifications
 * @route   GET /api/reports/notifications
 * @access  Private
 */
const getNotifications = async (req, res) => {
  try {
    const notifications = getRecentNotifications();
    return res.status(200).json({
      success: true,
      count: notifications.length,
      notifications,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getDashboardStats,
  exportCSV,
  getNotifications,
};
