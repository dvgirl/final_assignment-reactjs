const express = require('express');
const router = express.Router();
const {
  getDashboardStats,
  exportCSV,
  getNotifications,
} = require('../controllers/reportController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

router.get('/dashboard-stats', protect, getDashboardStats);
router.get('/notifications', protect, getNotifications);
router.get('/export-csv', protect, authorize('admin', 'security'), exportCSV);

module.exports = router;
