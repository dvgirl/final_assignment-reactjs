const Appointment = require('../models/Appointment');
const Visitor = require('../models/Visitor');
const User = require('../models/User');
const Pass = require('../models/Pass');
const { generateQRCodeDataURL, generatePassCode } = require('../utils/qrGenerator');
const { sendEmail, sendSMS } = require('../utils/notificationService');

/**
 * @desc    Create an appointment / Pre-register visit
 * @route   POST /api/appointments
 * @access  Public / Authenticated
 */
const createAppointment = async (req, res) => {
  try {
    const {
      // Visitor info
      fullName,
      email,
      phone,
      company,
      idType,
      idNumber,
      photo,
      address,
      visitorId,
      // Appointment info
      hostId,
      purpose,
      customPurpose,
      visitDate,
      visitTime,
      expectedDuration,
      remarks,
      location,
      invitationType,
    } = req.body;

    if (!hostId || !visitDate || !purpose) {
      return res.status(400).json({
        success: false,
        message: 'Host, visit date, and purpose are required.',
      });
    }

    // Verify host exists
    const host = await User.findById(hostId);
    if (!host) {
      return res.status(404).json({ success: false, message: 'Selected host employee was not found.' });
    }

    let visitorDoc;

    if (visitorId) {
      visitorDoc = await Visitor.findById(visitorId);
    } else {
      if (!fullName || !email || !phone) {
        return res.status(400).json({
          success: false,
          message: 'Visitor full name, email, and phone number are required.',
        });
      }

      // Upsert visitor
      visitorDoc = await Visitor.findOne({
        $or: [{ email: email.toLowerCase() }, { phone }],
      });

      if (!visitorDoc) {
        visitorDoc = await Visitor.create({
          fullName,
          email: email.toLowerCase(),
          phone,
          company: company || 'Self / Independent',
          idType: idType || 'Driving License',
          idNumber: idNumber || '',
          photo: photo || '',
          address: address || '',
          userAccount: req.user ? req.user._id : null,
        });
      } else {
        // Update photo / details if provided
        if (photo) visitorDoc.photo = photo;
        if (company) visitorDoc.company = company;
        await visitorDoc.save();
      }
    }

    // Determine initial status:
    // If created by employee host or admin, it can be auto-approved
    const isHostOrAdmin = req.user && (req.user.role === 'admin' || req.user._id.toString() === hostId.toString());
    const initialStatus = isHostOrAdmin ? 'Approved' : 'Pending';

    const appointment = await Appointment.create({
      visitor: visitorDoc._id,
      host: host._id,
      purpose,
      customPurpose: customPurpose || '',
      visitDate: new Date(visitDate),
      visitTime: visitTime || '10:00 AM',
      expectedDuration: expectedDuration || '1 Hour',
      status: initialStatus,
      remarks: remarks || '',
      location: location || 'TechCorp Solutions HQ, Building A',
      invitationType: invitationType || (isHostOrAdmin ? 'HostInvited' : 'VisitorPreRegistered'),
    });

    let passDoc = null;

    // If auto-approved, issue digital pass immediately!
    if (initialStatus === 'Approved') {
      const passCode = generatePassCode();
      const qrPayload = {
        passCode,
        appointmentId: appointment._id,
        visitorName: visitorDoc.fullName,
        hostName: host.name,
        visitDate: appointment.visitDate,
        validUntil: new Date(new Date(visitDate).setHours(23, 59, 59, 999)),
      };

      const qrCode = await generateQRCodeDataURL(qrPayload);

      passDoc = await Pass.create({
        passCode,
        appointment: appointment._id,
        visitor: visitorDoc._id,
        host: host._id,
        qrCode,
        validFrom: new Date(visitDate),
        validUntil: new Date(new Date(visitDate).setHours(23, 59, 59, 999)),
        location: appointment.location,
        status: 'Active',
        issuedBy: req.user ? req.user._id : host._id,
      });

      // Notify visitor with pass code
      sendEmail({
        to: visitorDoc.email,
        subject: `Your Visitor Pass is Confirmed! (Pass #${passCode})`,
        plainText: `Hello ${visitorDoc.fullName}, your appointment with ${host.name} on ${new Date(visitDate).toLocaleDateString()} at ${visitTime} is approved. Your digital pass code is ${passCode}.`,
      });
    } else {
      // Notify Host about pending request
      sendEmail({
        to: host.email,
        subject: `New Visitor Appointment Request from ${visitorDoc.fullName}`,
        plainText: `Hello ${host.name}, visitor ${visitorDoc.fullName} (${visitorDoc.company}) has requested an appointment for "${purpose}" on ${new Date(visitDate).toLocaleDateString()} at ${visitTime}. Please login to approve or reject.`,
      });
    }

    const populatedAppointment = await Appointment.findById(appointment._id)
      .populate('visitor')
      .populate('host', 'name email department phone organization');

    return res.status(201).json({
      success: true,
      message: initialStatus === 'Approved' ? 'Appointment approved and Pass issued!' : 'Pre-registration submitted. Awaiting host approval.',
      appointment: populatedAppointment,
      pass: passDoc,
    });
  } catch (error) {
    console.error('Create Appointment Error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc    Get all appointments (Role-filtered)
 * @route   GET /api/appointments
 * @access  Private
 */
const getAppointments = async (req, res) => {
  try {
    const { status, search, date } = req.query;
    let query = {};

    // Role-based filtering
    if (req.user.role === 'employee') {
      // Employee only sees appointments where they are the host
      query.host = req.user._id;
    } else if (req.user.role === 'visitor') {
      // Visitor sees their appointments (find visitor doc linked to user or user's email)
      const visitor = await Visitor.findOne({
        $or: [{ userAccount: req.user._id }, { email: req.user.email }],
      });
      if (visitor) {
        query.visitor = visitor._id;
      } else {
        return res.status(200).json({ success: true, count: 0, appointments: [] });
      }
    }
    // Admin and Security see all appointments

    if (status && status !== 'All') {
      query.status = status;
    }

    if (date) {
      const start = new Date(date);
      start.setHours(0, 0, 0, 0);
      const end = new Date(date);
      end.setHours(23, 59, 59, 999);
      query.visitDate = { $gte: start, $lte: end };
    }

    const appointments = await Appointment.find(query)
      .populate('visitor')
      .populate('host', 'name email department phone organization')
      .sort({ visitDate: -1, createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: appointments.length,
      appointments,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc    Get appointment by ID
 * @route   GET /api/appointments/:id
 * @access  Public / Private
 */
const getAppointmentById = async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id)
      .populate('visitor')
      .populate('host', 'name email department phone organization');

    if (!appointment) {
      return res.status(404).json({ success: false, message: 'Appointment not found' });
    }

    // Check if pass exists for this appointment
    const pass = await Pass.findOne({ appointment: appointment._id });

    return res.status(200).json({
      success: true,
      appointment,
      pass,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc    Approve or Reject an Appointment
 * @route   PUT /api/appointments/:id/status
 * @access  Private (Host, Admin)
 */
const updateAppointmentStatus = async (req, res) => {
  try {
    const { status, rejectionReason } = req.body;
    const appointment = await Appointment.findById(req.params.id)
      .populate('visitor')
      .populate('host');

    if (!appointment) {
      return res.status(404).json({ success: false, message: 'Appointment not found' });
    }

    // Permission check: Host or Admin only
    if (
      req.user.role !== 'admin' &&
      appointment.host._id.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({
        success: false,
        message: 'Only the host employee or an admin can approve/reject this appointment',
      });
    }

    appointment.status = status;
    if (rejectionReason) appointment.rejectionReason = rejectionReason;
    await appointment.save();

    let pass = null;

    if (status === 'Approved') {
      // Check if pass already exists
      pass = await Pass.findOne({ appointment: appointment._id });

      if (!pass) {
        const passCode = generatePassCode();
        const qrPayload = {
          passCode,
          appointmentId: appointment._id,
          visitorName: appointment.visitor.fullName,
          hostName: appointment.host.name,
          visitDate: appointment.visitDate,
          validUntil: new Date(new Date(appointment.visitDate).setHours(23, 59, 59, 999)),
        };

        const qrCode = await generateQRCodeDataURL(qrPayload);

        pass = await Pass.create({
          passCode,
          appointment: appointment._id,
          visitor: appointment.visitor._id,
          host: appointment.host._id,
          qrCode,
          validFrom: new Date(appointment.visitDate),
          validUntil: new Date(new Date(appointment.visitDate).setHours(23, 59, 59, 999)),
          location: appointment.location,
          status: 'Active',
          issuedBy: req.user._id,
        });
      }

      // Notify visitor
      sendEmail({
        to: appointment.visitor.email,
        subject: `Appointment Approved! Digital Pass #${pass.passCode}`,
        plainText: `Great news ${appointment.visitor.fullName}! Your visit with ${appointment.host.name} on ${new Date(appointment.visitDate).toLocaleDateString()} has been APPROVED. Digital Pass Code: ${pass.passCode}`,
      });

      sendSMS({
        to: appointment.visitor.phone,
        message: `Your visit with ${appointment.host.name} is approved. Pass #${pass.passCode}. Show this at the security gate.`,
      });
    } else if (status === 'Rejected') {
      sendEmail({
        to: appointment.visitor.email,
        subject: `Appointment Update: Visit Request Declined`,
        plainText: `Hello ${appointment.visitor.fullName}, your visit request with ${appointment.host.name} on ${new Date(appointment.visitDate).toLocaleDateString()} could not be approved at this time. Reason: ${rejectionReason || 'Host unavailable'}`,
      });
    }

    return res.status(200).json({
      success: true,
      message: `Appointment ${status.toLowerCase()} successfully`,
      appointment,
      pass,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  createAppointment,
  getAppointments,
  getAppointmentById,
  updateAppointmentStatus,
};
