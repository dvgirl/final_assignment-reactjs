const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { generateOTP, verifyOTP } = require('../utils/otpService');
const { sendEmail, sendSMS } = require('../utils/notificationService');

/**
 * Generate JWT Token helper
 */
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'supersecretvisitorpasskey2026', {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });
};

/**
 * @desc    Register a new user (Visitor, Employee, Security, Admin)
 * @route   POST /api/auth/register
 * @access  Public
 */
const register = async (req, res) => {
  try {
    const { name, email, password, role, department, phone, organization } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide name, email, and password',
      });
    }

    // Check if user already exists
    const userExists = await User.findOne({ email: email.toLowerCase() });
    if (userExists) {
      return res.status(400).json({
        success: false,
        message: 'A user with this email address already exists',
      });
    }

    // Create user
    const user = await User.create({
      name,
      email: email.toLowerCase(),
      password,
      role: role || 'visitor',
      department: department || (role === 'security' ? 'Security' : 'General'),
      phone: phone || '',
      organization: organization || 'TechCorp Solutions HQ',
    });

    const token = generateToken(user._id);

    // Send welcome notification
    sendEmail({
      to: user.email,
      subject: 'Welcome to Visitor Pass Management System',
      plainText: `Hello ${user.name}, your account has been successfully created with role: ${user.role}.`,
    });

    return res.status(201).json({
      success: true,
      message: 'Registration successful',
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        department: user.department,
        phone: user.phone,
        organization: user.organization,
      },
    });
  } catch (error) {
    console.error('Register Error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Server error during registration',
    });
  }
};

/**
 * @desc    Authenticate user & get token
 * @route   POST /api/auth/login
 * @access  Public
 */
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both email and password',
      });
    }

    // Find user and explicitly select password
    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials. User not found.',
      });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials. Incorrect password.',
      });
    }

    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message: 'Account is deactivated. Please contact admin.',
      });
    }

    const token = generateToken(user._id);

    return res.status(200).json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        department: user.department,
        phone: user.phone,
        organization: user.organization,
      },
    });
  } catch (error) {
    console.error('Login Error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Server error during login',
    });
  }
};

/**
 * @desc    Get currently logged in user info
 * @route   GET /api/auth/me
 * @access  Private
 */
const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    return res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * @desc    Update user profile
 * @route   PUT /api/auth/profile
 * @access  Private
 */
const updateProfile = async (req, res) => {
  try {
    const { name, phone, department, organization } = req.body;
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (name) user.name = name;
    if (phone !== undefined) user.phone = phone;
    if (department) user.department = department;
    if (organization) user.organization = organization;

    await user.save();

    return res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      user,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * @desc    Send OTP to phone/email (Bonus Feature)
 * @route   POST /api/auth/send-otp
 * @access  Public
 */
const sendOtpCode = async (req, res) => {
  try {
    const { target, type } = req.body; // target: email or phone
    if (!target) {
      return res.status(400).json({ success: false, message: 'Target email or phone is required' });
    }

    const { code } = generateOTP(target);

    if (type === 'phone' || target.match(/^\+?[0-9]{7,15}$/)) {
      sendSMS({
        to: target,
        message: `Your Visitor Pass verification code is ${code}. Valid for 5 minutes.`,
      });
    } else {
      sendEmail({
        to: target,
        subject: 'Your Visitor Pass Verification Code',
        plainText: `Your OTP is: ${code}. Valid for 5 minutes. Use code 123456 for instant demo testing.`,
      });
    }

    return res.status(200).json({
      success: true,
      message: `OTP sent successfully to ${target}. (Hint: Demo code is 123456 or check console/notifications)`,
      demoOtp: code,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc    Verify OTP (Bonus Feature)
 * @route   POST /api/auth/verify-otp
 * @access  Public
 */
const verifyOtpCode = async (req, res) => {
  try {
    const { target, code } = req.body;
    if (!target || !code) {
      return res.status(400).json({ success: false, message: 'Target and code are required' });
    }

    const isValid = verifyOTP(target, code);
    if (!isValid) {
      return res.status(400).json({ success: false, message: 'Invalid or expired OTP code' });
    }

    return res.status(200).json({
      success: true,
      message: 'OTP verified successfully',
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  register,
  login,
  getMe,
  updateProfile,
  sendOtpCode,
  verifyOtpCode,
};
