const express = require('express');
const router = express.Router();
const {
  getAllUsers,
  getHostEmployees,
  createStaffUser,
  updateUser,
  deleteUser,
} = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

// Public/authenticated endpoint for booking appointment dropdowns
router.get('/hosts', getHostEmployees);

// Admin-only endpoints
router.get('/', protect, authorize('admin'), getAllUsers);
router.post('/', protect, authorize('admin'), createStaffUser);
router.put('/:id', protect, authorize('admin'), updateUser);
router.delete('/:id', protect, authorize('admin'), deleteUser);

module.exports = router;
