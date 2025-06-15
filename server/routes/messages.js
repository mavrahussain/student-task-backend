const express = require('express');
const auth = require('../middleware/auth');
const { sendMessage, getConversation, markMessagesAsRead, getUnreadMessageCount, getNotifications } = require('../controllers/messageController');
const router = express.Router();

// Send a message
router.post('/', auth, sendMessage);

// Get conversation history with a specific user
router.get('/:otherUserId', auth, getConversation);

// Mark messages as read
router.post('/read', auth, markMessagesAsRead);

// Get unread message count for the current user
router.get('/unread/count', auth, getUnreadMessageCount);

// Get all notifications for the current user
router.get('/notifications', auth, getNotifications);

module.exports = router; 