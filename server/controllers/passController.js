const Pass = require('../models/Pass');
const Appointment = require('../models/Appointment');
const Visitor = require('../models/Visitor');
const User = require('../models/User');
const { generateQRCodeDataURL, generatePassCode } = require('../utils/qrGenerator');
const { generatePassPDF } = require('../utils/pdfBadge');
const { sendEmail, sendSMS } = require('../utils/notificationService');

/**
 * @desc    Issue On-Spot / Walk-in Pass (Frontdesk / Security / Admin)
 * @route   POST /api/passes/issue-walkin
 * @access  Private (Admin, Security)
 */
const issueWalkInPass = async (req, res) => {
  try {
    const {
      fullName,
      email,
      phone,
      company,
      idType,
      idNumber,
      photo,
      hostId,
      purpose,
      gateNumber,
      location,
      durationHours,
    } = req.body;

    if (!fullName || !phone || !hostId) {
      return res.status(400).json({
        success: false,
        message: 'Visitor name, phone, and host employee are required',
      });
    }

    const host = await User.findById(hostId);
    if (!host) {
      return res.status(404).json({ success: false, message: 'Host employee not found' });
    }

    // Upsert Visitor
    let visitor = await Visitor.findOne({
      $or: [{ phone }, { email: email ? email.toLowerCase() : 'none' }],
    });

    if (!visitor) {
      visitor = await Visitor.create({
        fullName,
        email: email ? email.toLowerCase() : `${phone}@visitor.local`,
        phone,
        company: company || 'Walk-in Guest',
        idType: idType || 'Driving License',
        idNumber: idNumber || '',
        photo: photo || '',
      });
    } else {
      if (photo) visitor.photo = photo;
      if (company) visitor.company = company;
      await visitor.save();
    }

    const now = new Date();
    const validUntil = new Date(now.getTime() + (parseInt(durationHours) || 8) * 60 * 60 * 1000);

    // Create Appointment record for walk-in
    const appointment = await Appointment.create({
      visitor: visitor._id,
      host: host._id,
      purpose: purpose || 'Official Visit',
      visitDate: now,
      visitTime: now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      expectedDuration: `${durationHours || 8} Hours`,
      status: 'Approved',
      invitationType: 'WalkInFrontDesk',
      location: location || 'TechCorp HQ - Main Building',
    });

    // Generate Pass & QR
    const passCode = generatePassCode();
    const qrPayload = {
      passCode,
      appointmentId: appointment._id,
      visitorName: visitor.fullName,
      hostName: host.name,
      validUntil,
    };

    const qrCode = await generateQRCodeDataURL(qrPayload);

    const pass = await Pass.create({
      passCode,
      appointment: appointment._id,
      visitor: visitor._id,
      host: host._id,
      qrCode,
      validFrom: now,
      validUntil,
      gateNumber: gateNumber || 'Gate 1',
      location: appointment.location,
      status: 'Active',
      issuedBy: req.user._id,
    });

    // Send notifications if email/phone valid
    if (visitor.email && !visitor.email.includes('@visitor.local')) {
      sendEmail({
        to: visitor.email,
        subject: `Your On-Spot Visitor Pass: ${passCode}`,
        plainText: `Hello ${visitor.fullName}, your on-spot pass #${passCode} for visiting ${host.name} has been issued at ${gateNumber || 'Gate 1'}.`,
      });
    }

    sendSMS({
      to: visitor.phone,
      message: `Visitor Pass #${passCode} issued for ${host.name}. Valid until ${validUntil.toLocaleTimeString()}.`,
    });

    const populatedPass = await Pass.findById(pass._id)
      .populate('visitor')
      .populate('host', 'name email department phone organization')
      .populate('appointment');

    return res.status(201).json({
      success: true,
      message: 'On-spot walk-in pass issued successfully',
      pass: populatedPass,
    });
  } catch (error) {
    console.error('Walk-in Pass Error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc    Get all passes (Role-filtered)
 * @route   GET /api/passes
 * @access  Private
 */
const getPasses = async (req, res) => {
  try {
    const { status, search } = req.query;
    let query = {};

    if (req.user.role === 'employee') {
      query.host = req.user._id;
    } else if (req.user.role === 'visitor') {
      const visitor = await Visitor.findOne({
        $or: [{ userAccount: req.user._id }, { email: req.user.email }],
      });
      if (visitor) {
        query.visitor = visitor._id;
      } else {
        return res.status(200).json({ success: true, count: 0, passes: [] });
      }
    }

    if (status && status !== 'All') {
      query.status = status;
    }

    if (search) {
      query.passCode = { $regex: search, $options: 'i' };
    }

    const passes = await Pass.find(query)
      .populate('visitor')
      .populate('host', 'name email department phone organization')
      .populate('appointment')
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: passes.length,
      passes,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc    Get pass by ID or Code (Public/Private verification)
 * @route   GET /api/passes/:identifier
 * @access  Public
 */
const getPassByIdentifier = async (req, res) => {
  try {
    const { identifier } = req.params;

    // Check if identifier is MongoDB ObjectId or PassCode string
    let query = {};
    if (identifier.match(/^[0-9a-fA-F]{24}$/)) {
      query._id = identifier;
    } else {
      query.passCode = identifier.toUpperCase();
    }

    const pass = await Pass.findOne(query)
      .populate('visitor')
      .populate('host', 'name email department phone organization')
      .populate('appointment');

    if (!pass) {
      return res.status(404).json({
        success: false,
        message: 'Visitor pass not found with code/ID: ' + identifier,
      });
    }

    // Check if expired
    const isExpired = new Date() > new Date(pass.validUntil);

    return res.status(200).json({
      success: true,
      pass,
      isExpired,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc    Download Pass as PDF Badge
 * @route   GET /api/passes/:id/pdf
 * @access  Public
 */
const downloadPassPDF = async (req, res) => {
  try {
    const { id } = req.params;
    let query = id.match(/^[0-9a-fA-F]{24}$/) ? { _id: id } : { passCode: id.toUpperCase() };

    const pass = await Pass.findOne(query)
      .populate('visitor')
      .populate('host', 'name email department phone organization')
      .populate('appointment');

    if (!pass) {
      return res.status(404).json({ success: false, message: 'Pass not found' });
    }

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `inline; filename="Visitor-Pass-${pass.passCode}.pdf"`);

    generatePassPDF(pass, res);
  } catch (error) {
    console.error('PDF generation error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  issueWalkInPass,
  getPasses,
  getPassByIdentifier,
  downloadPassPDF,
};
