const express = require('express');
const router = express.Router();
const {
  register,
  login,
  getMe,
  updateProfile,
  sendOtpCode,
  verifyOtpCode,
} = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

router.post('/register', register);
router.post('/login', login);
router.get('/me', protect, getMe);
router.put('/profile', protect, updateProfile);

// OTP Verification endpoints
router.post('/send-otp', sendOtpCode);
router.post('/verify-otp', verifyOtpCode);

module.exports = router;
