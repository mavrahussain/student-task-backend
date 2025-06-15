const express = require('express');
const router = express.Router();
const reportingController = require('../controllers/reportingController');
const { authenticateToken, isAdmin } = require('../middleware/auth');

// Route to generate PDF report (Admin only)
router.get('/generate-pdf-report', authenticateToken, isAdmin, reportingController.generatePdfReport);

// Route to generate Signed Certificate (Admin only)
router.post('/generate-certificate', authenticateToken, isAdmin, reportingController.generateCertificate);

// Route to publish Top Performers (Admin only)
router.post('/publish-top-performers', authenticateToken, isAdmin, reportingController.publishTopPerformers);

module.exports = router; 