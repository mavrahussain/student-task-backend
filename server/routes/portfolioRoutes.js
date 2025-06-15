const express = require('express');
const router = express.Router();
const portfolioController = require('../controllers/portfolioController');
const { authenticateToken, isAdmin } = require('../middleware/auth');

// Student routes
router.get('/student/portfolio', authenticateToken, portfolioController.getStudentPortfolio);
router.post('/student/portfolio', authenticateToken, portfolioController.updateStudentPortfolio);
router.put('/student/portfolio/visibility', authenticateToken, portfolioController.togglePortfolioVisibility);

// Admin routes
router.get('/admin/portfolios', authenticateToken, isAdmin, portfolioController.getAllPortfolios);
router.put('/admin/portfolios/:id/approve', authenticateToken, isAdmin, portfolioController.approvePortfolio);
router.put('/admin/portfolios/:id/reject', authenticateToken, isAdmin, portfolioController.rejectPortfolio);

module.exports = router; 