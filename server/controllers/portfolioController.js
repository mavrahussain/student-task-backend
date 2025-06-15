const Portfolio = require('../models/Portfolio');
const User = require('../models/User');

// Get student's portfolio
exports.getStudentPortfolio = async (req, res) => {
  try {
    let portfolio = await Portfolio.findOne({ student: req.user._id })
      .populate('student', 'name email');

    if (!portfolio) {
      // If no portfolio exists, create a new one
      portfolio = new Portfolio({
        student: req.user._id,
        githubProfile: '', // Initialize with empty strings
        linkedinProfile: '',
        isPublic: false,
        isApproved: false
      });
      await portfolio.save();
      await portfolio.populate('student', 'name email');
    }

    res.json(portfolio);
  } catch (error) {
    console.error('Error fetching or creating portfolio:', error);
    res.status(500).json({ message: 'Error fetching or creating portfolio' });
  }
};

// Create or update student's portfolio
exports.updateStudentPortfolio = async (req, res) => {
  try {
    const { githubProfile, linkedinProfile } = req.body;

    let portfolio = await Portfolio.findOne({ student: req.user._id });

    if (portfolio) {
      // Update existing portfolio
      portfolio.githubProfile = githubProfile;
      portfolio.linkedinProfile = linkedinProfile;
      portfolio.isApproved = false; // Reset approval status when updated
      portfolio.approvedBy = null;
      portfolio.approvedAt = null;
    } else {
      // Create new portfolio
      portfolio = new Portfolio({
        student: req.user._id,
        githubProfile,
        linkedinProfile
      });
    }

    await portfolio.save();
    await portfolio.populate('student', 'name email');

    res.json(portfolio);
  } catch (error) {
    console.error('Error updating portfolio:', error);
    if (error.name === 'ValidationError') {
      return res.status(400).json({ message: error.message });
    }
    res.status(500).json({ message: 'Error updating portfolio' });
  }
};

// Toggle portfolio visibility
exports.togglePortfolioVisibility = async (req, res) => {
  try {
    const portfolio = await Portfolio.findOne({ student: req.user._id });

    if (!portfolio) {
      return res.status(404).json({ message: 'Portfolio not found' });
    }

    if (!portfolio.isApproved) {
      return res.status(400).json({ message: 'Portfolio must be approved before making it public' });
    }

    portfolio.isPublic = !portfolio.isPublic;
    await portfolio.save();
    await portfolio.populate('student', 'name email');

    res.json(portfolio);
  } catch (error) {
    console.error('Error toggling portfolio visibility:', error);
    res.status(500).json({ message: 'Error toggling portfolio visibility' });
  }
};

// Get all portfolios (admin)
exports.getAllPortfolios = async (req, res) => {
  try {
    const portfolios = await Portfolio.find()
      .populate('student', 'name email')
      .populate('approvedBy', 'name');

    res.json(portfolios);
  } catch (error) {
    console.error('Error fetching portfolios:', error);
    res.status(500).json({ message: 'Error fetching portfolios' });
  }
};

// Approve portfolio (admin)
exports.approvePortfolio = async (req, res) => {
  try {
    const portfolio = await Portfolio.findById(req.params.id);

    if (!portfolio) {
      return res.status(404).json({ message: 'Portfolio not found' });
    }

    portfolio.isApproved = true;
    portfolio.approvedBy = req.user._id;
    portfolio.approvedAt = Date.now();
    await portfolio.save();
    await portfolio.populate('student', 'name email');
    await portfolio.populate('approvedBy', 'name');

    res.json(portfolio);
  } catch (error) {
    console.error('Error approving portfolio:', error);
    res.status(500).json({ message: 'Error approving portfolio' });
  }
};

// Reject portfolio (admin)
exports.rejectPortfolio = async (req, res) => {
  try {
    const portfolio = await Portfolio.findById(req.params.id);

    if (!portfolio) {
      return res.status(404).json({ message: 'Portfolio not found' });
    }

    portfolio.isApproved = false;
    portfolio.approvedBy = null;
    portfolio.approvedAt = null;
    portfolio.isPublic = false; // Make it private when rejected
    await portfolio.save();
    await portfolio.populate('student', 'name email');

    res.json(portfolio);
  } catch (error) {
    console.error('Error rejecting portfolio:', error);
    res.status(500).json({ message: 'Error rejecting portfolio' });
  }
}; 