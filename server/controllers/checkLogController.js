const CheckLog = require('../models/CheckLog');
const Pass = require('../models/Pass');
const Visitor = require('../models/Visitor');
const User = require('../models/User');
const { sendEmail, sendSMS } = require('../utils/notificationService');

/**
 * @desc    Security QR Scan Check-In
 * @route   POST /api/checklogs/check-in
 * @access  Private (Security, Admin)
 */
const checkInVisitor = async (req, res) => {
  try {
    const { passCode, gate, belongings, laptopSerialNumber, temperature, remarks } = req.body;

    if (!passCode) {
      return res.status(400).json({ success: false, message: 'Pass code is required for check-in' });
    }

    // Lookup pass
    const pass = await Pass.findOne({ passCode: passCode.trim().toUpperCase() })
      .populate('visitor')
      .populate('host')
      .populate('appointment');

    if (!pass) {
      return res.status(404).json({
        success: false,
        message: `Pass #${passCode} was not found in system. Please verify.`,
      });
    }

    // Check pass expiration
    const now = new Date();
    if (now > new Date(pass.validUntil)) {
      return res.status(400).json({
        success: false,
        message: `Pass #${passCode} has EXPIRED on ${new Date(pass.validUntil).toLocaleString()}. Entry denied.`,
      });
    }

    if (pass.status === 'Revoked') {
      return res.status(400).json({
        success: false,
        message: `Pass #${passCode} has been REVOKED. Entry denied.`,
      });
    }

    // Check if visitor is already checked in and hasn't checked out
    const activeLog = await CheckLog.findOne({
      pass: pass._id,
      status: 'CheckedIn',
    });

    if (activeLog) {
      return res.status(400).json({
        success: false,
        message: `Visitor ${pass.visitor.fullName} is ALREADY CHECKED IN at ${new Date(activeLog.checkInTime).toLocaleTimeString()} (Gate: ${activeLog.gate}). Please check out first.`,
        activeLog,
      });
    }

    // Create CheckLog entry
    const log = await CheckLog.create({
      pass: pass._id,
      visitor: pass.visitor._id,
      appointment: pass.appointment ? pass.appointment._id : null,
      checkInTime: now,
      checkedInBy: req.user._id,
      gate: gate || pass.gateNumber || 'Main Entrance - Gate 1',
      belongings: belongings || 'Standard bag / personal belongings',
      laptopSerialNumber: laptopSerialNumber || '',
      temperature: temperature || '98.4 °F',
      status: 'CheckedIn',
      remarks: remarks || 'Entry verified successfully via QR scan',
    });

    // Update Pass status
    pass.status = 'CheckedIn';
    await pass.save();

    // Notify Host that visitor has arrived!
    if (pass.host && pass.host.email) {
      sendEmail({
        to: pass.host.email,
        subject: `🔔 Visitor Arrived: ${pass.visitor.fullName}`,
        plainText: `Hello ${pass.host.name}, your visitor ${pass.visitor.fullName} (${pass.visitor.company}) has just checked in at ${log.gate} at ${now.toLocaleTimeString()}.`,
      });
    }

    sendSMS({
      to: pass.visitor.phone,
      message: `Welcome to TechCorp! You checked in at ${now.toLocaleTimeString()}. Please show your badge at exit.`,
    });

    const populatedLog = await CheckLog.findById(log._id)
      .populate('pass')
      .populate('visitor')
      .populate('checkedInBy', 'name email role');

    return res.status(200).json({
      success: true,
      message: `✓ Check-in SUCCESSFUL for ${pass.visitor.fullName}`,
      log: populatedLog,
      pass,
    });
  } catch (error) {
    console.error('Check-in Error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc    Security QR Scan Check-Out
 * @route   POST /api/checklogs/check-out
 * @access  Private (Security, Admin)
 */
const checkOutVisitor = async (req, res) => {
  try {
    const { passCode, remarks } = req.body;

    if (!passCode) {
      return res.status(400).json({ success: false, message: 'Pass code is required for check-out' });
    }

    const pass = await Pass.findOne({ passCode: passCode.trim().toUpperCase() })
      .populate('visitor')
      .populate('host');

    if (!pass) {
      return res.status(404).json({ success: false, message: `Pass #${passCode} was not found.` });
    }

    // Find active check-in record
    const activeLog = await CheckLog.findOne({
      pass: pass._id,
      status: 'CheckedIn',
    }).sort({ checkInTime: -1 });

    if (!activeLog) {
      return res.status(400).json({
        success: false,
        message: `No active check-in found for Pass #${passCode}. Visitor is already checked out or never checked in today.`,
      });
    }

    const now = new Date();
    activeLog.checkOutTime = now;
    activeLog.checkedOutBy = req.user._id;
    activeLog.status = 'CheckedOut';
    if (remarks) activeLog.remarks += ` | Exit remarks: ${remarks}`;
    await activeLog.save();

    // Update pass status to Completed
    pass.status = 'Completed';
    await pass.save();

    // Log & notify
    sendSMS({
      to: pass.visitor.phone,
      message: `Thank you for visiting TechCorp! You checked out at ${now.toLocaleTimeString()}. Have a great day!`,
    });

    const populatedLog = await CheckLog.findById(activeLog._id)
      .populate('pass')
      .populate('visitor')
      .populate('checkedInBy', 'name email role')
      .populate('checkedOutBy', 'name email role');

    return res.status(200).json({
      success: true,
      message: `✓ Check-out SUCCESSFUL for ${pass.visitor.fullName}`,
      log: populatedLog,
      pass,
    });
  } catch (error) {
    console.error('Check-out Error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc    Get live currently checked-in visitors
 * @route   GET /api/checklogs/active
 * @access  Private (Admin, Security, Employee)
 */
const getActiveCheckedInVisitors = async (req, res) => {
  try {
    const activeLogs = await CheckLog.find({ status: 'CheckedIn' })
      .populate({
        path: 'pass',
        populate: { path: 'host', select: 'name email department phone' },
      })
      .populate('visitor')
      .populate('checkedInBy', 'name email')
      .sort({ checkInTime: -1 });

    return res.status(200).json({
      success: true,
      count: activeLogs.length,
      logs: activeLogs,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc    Get check-in / check-out audit logs with search, filters, pagination
 * @route   GET /api/checklogs
 * @access  Private (Admin, Security)
 */
const getCheckLogs = async (req, res) => {
  try {
    const { status, gate, date, search } = req.query;
    let query = {};

    if (status && status !== 'All') {
      query.status = status;
    }

    if (gate && gate !== 'All') {
      query.gate = gate;
    }

    if (date) {
      const start = new Date(date);
      start.setHours(0, 0, 0, 0);
      const end = new Date(date);
      end.setHours(23, 59, 59, 999);
      query.checkInTime = { $gte: start, $lte: end };
    }

    const logs = await CheckLog.find(query)
      .populate({
        path: 'pass',
        populate: { path: 'host', select: 'name email department' },
      })
      .populate('visitor')
      .populate('checkedInBy', 'name email')
      .populate('checkedOutBy', 'name email')
      .sort({ checkInTime: -1 });

    // Client-side search filter if search term provided
    let filteredLogs = logs;
    if (search) {
      const s = search.toLowerCase();
      filteredLogs = logs.filter(
        (log) =>
          (log.visitor && log.visitor.fullName.toLowerCase().includes(s)) ||
          (log.pass && log.pass.passCode.toLowerCase().includes(s)) ||
          (log.gate && log.gate.toLowerCase().includes(s))
      );
    }

    return res.status(200).json({
      success: true,
      count: filteredLogs.length,
      logs: filteredLogs,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  checkInVisitor,
  checkOutVisitor,
  getActiveCheckedInVisitors,
  getCheckLogs,
};
