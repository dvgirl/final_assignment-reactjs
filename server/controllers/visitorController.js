const Visitor = require('../models/Visitor');

/**
 * @desc    Create or update visitor profile
 * @route   POST /api/visitors
 * @access  Public / Authenticated
 */
const registerVisitor = async (req, res) => {
  try {
    const { fullName, email, phone, company, idType, idNumber, photo, address } = req.body;

    if (!fullName || !email || !phone) {
      return res.status(400).json({
        success: false,
        message: 'Please provide visitor full name, email, and phone number',
      });
    }

    // Check if visitor with same email or phone exists
    let visitor = await Visitor.findOne({
      $or: [{ email: email.toLowerCase() }, { phone }],
    });

    if (visitor) {
      // Update existing visitor record
      visitor.fullName = fullName;
      visitor.email = email.toLowerCase();
      visitor.phone = phone;
      if (company) visitor.company = company;
      if (idType) visitor.idType = idType;
      if (idNumber) visitor.idNumber = idNumber;
      if (photo) visitor.photo = photo;
      if (address) visitor.address = address;
      if (req.user) visitor.userAccount = req.user._id;

      await visitor.save();

      return res.status(200).json({
        success: true,
        message: 'Visitor profile updated',
        visitor,
      });
    }

    // Create new visitor
    visitor = await Visitor.create({
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

    return res.status(201).json({
      success: true,
      message: 'Visitor registered successfully',
      visitor,
    });
  } catch (error) {
    console.error('Visitor Registration Error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc    Get all visitors with search & filters
 * @route   GET /api/visitors
 * @access  Private (Admin, Security, Employee)
 */
const getVisitors = async (req, res) => {
  try {
    const { search } = req.query;
    let query = {};

    if (search) {
      query.$or = [
        { fullName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } },
        { company: { $regex: search, $options: 'i' } },
      ];
    }

    const visitors = await Visitor.find(query).sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: visitors.length,
      visitors,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc    Get visitor by ID
 * @route   GET /api/visitors/:id
 * @access  Private / Public
 */
const getVisitorById = async (req, res) => {
  try {
    const visitor = await Visitor.findById(req.params.id);
    if (!visitor) {
      return res.status(404).json({ success: false, message: 'Visitor not found' });
    }

    return res.status(200).json({
      success: true,
      visitor,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  registerVisitor,
  getVisitors,
  getVisitorById,
};
