const express = require('express');
const router = express.Router();
const {
  registerVisitor,
  getVisitors,
  getVisitorById,
} = require('../controllers/visitorController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

// Public visitor registration
router.post('/', registerVisitor);

// Protected routes
router.get('/', protect, authorize('admin', 'security', 'employee'), getVisitors);
router.get('/:id', protect, getVisitorById);

module.exports = router;
