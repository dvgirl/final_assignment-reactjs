const express = require('express');
const router = express.Router();
const {
  createAppointment,
  getAppointments,
  getAppointmentById,
  updateAppointmentStatus,
} = require('../controllers/appointmentController');
const { protect } = require('../middleware/authMiddleware');

// Public pre-registration / authenticated appointment creation
// If auth token provided in headers, optionalAuth or protect middleware will set req.user
const optionalAuth = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer')) {
    return protect(req, res, next);
  }
  next();
};

router.post('/', optionalAuth, createAppointment);
router.get('/', protect, getAppointments);
router.get('/:id', getAppointmentById);
router.put('/:id/status', protect, updateAppointmentStatus);

module.exports = router;
