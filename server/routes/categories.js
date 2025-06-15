const express = require('express');
const router = express.Router();
const { addCategory, getCategories, deleteCategory } = require('../controllers/categoryController');

// @route   POST /api/categories
// @desc    Add a new category
// @access  Admin (requires authentication and authorization)
router.post('/', addCategory);

// @route   GET /api/categories
// @desc    Get all categories
// @access  Admin (requires authentication and authorization)
router.get('/', getCategories);

// @route   DELETE /api/categories/:id
// @desc    Delete a category by ID
// @access  Admin (requires authentication and authorization)
router.delete('/:id', deleteCategory);

module.exports = router; 