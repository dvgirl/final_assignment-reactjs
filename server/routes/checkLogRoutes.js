const express = require('express');
const router = express.Router();
const {
  checkInVisitor,
  checkOutVisitor,
  getActiveCheckedInVisitors,
  getCheckLogs,
} = require('../controllers/checkLogController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

// Security check-in / check-out
router.post('/check-in', protect, authorize('security', 'admin'), checkInVisitor);
router.post('/check-out', protect, authorize('security', 'admin'), checkOutVisitor);

// Active visitors & audit logs
router.get('/active', protect, authorize('security', 'admin', 'employee'), getActiveCheckedInVisitors);
router.get('/', protect, authorize('security', 'admin'), getCheckLogs);

module.exports = router;
