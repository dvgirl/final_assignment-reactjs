const express = require('express');
const router = express.Router();
const {
  issueWalkInPass,
  getPasses,
  getPassByIdentifier,
  downloadPassPDF,
} = require('../controllers/passController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

// Public pass query and PDF badge download
router.get('/view/:identifier', getPassByIdentifier);
router.get('/:id/pdf', downloadPassPDF);

// Protected routes
router.get('/', protect, getPasses);
router.post('/issue-walkin', protect, authorize('admin', 'security'), issueWalkInPass);

module.exports = router;
