const Message = require('../models/Message');
const Student = require('../models/Student');
const Admin = require('../models/Admin');

// Send a new message
const sendMessage = async (req, res) => {
  try {
    const { recipientId, recipientModel, content } = req.body;
    const senderId = req.user.id; // From authenticated user (student or admin)
    const senderModel = req.user.role === 'student' ? 'Student' : 'Admin';

    if (!recipientId || !recipientModel || !content) {
      return res.status(400).json({ message: 'Recipient ID, model, and content are required.' });
    }

    // Verify recipient exists
    let RecipientModel;
    if (recipientModel === 'Student') {
      RecipientModel = Student;
    } else if (recipientModel === 'Admin') {
      RecipientModel = Admin;
    } else {
      return res.status(400).json({ message: 'Invalid recipient model.' });
    }

    const recipient = await RecipientModel.findById(recipientId);
    if (!recipient) {
      return res.status(404).json({ message: 'Recipient not found.' });
    }

    const newMessage = new Message({
      sender: senderId,
      onModel: senderModel,
      recipient: recipientId,
      onRecipientModel: recipientModel,
      content
    });

    await newMessage.save();
    res.status(201).json(newMessage);
  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).json({ message: 'Server error sending message.' });
  }
};

// Get conversation history between two users
const getConversation = async (req, res) => {
  try {
    const { otherUserId } = req.params;
    const currentUserId = req.user.id;

    const messages = await Message.find({
      $or: [
        { sender: currentUserId, recipient: otherUserId },
        { sender: otherUserId, recipient: currentUserId }
      ]
    }).sort('timestamp'); // Sort by timestamp for chronological order

    res.status(200).json(messages);
  } catch (error) {
    console.error('Error fetching conversation:', error);
    res.status(500).json({ message: 'Server error fetching conversation.' });
  }
};

// Mark messages as read (e.g., when a user views a conversation)
const markMessagesAsRead = async (req, res) => {
  try {
    const { otherUserId } = req.body; // The ID of the user whose messages we want to mark as read
    const currentUserId = req.user.id;

    await Message.updateMany(
      { sender: otherUserId, recipient: currentUserId, read: false },
      { $set: { read: true } }
    );

    res.status(200).json({ message: 'Messages marked as read.' });
  } catch (error) {
    console.error('Error marking messages as read:', error);
    res.status(500).json({ message: 'Server error marking messages as read.' });
  }
};

// Get count of unread messages for the current user
const getUnreadMessageCount = async (req, res) => {
  try {
    const currentUserId = req.user.id; // Authenticated user's ID

    const unreadCount = await Message.countDocuments({
      recipient: currentUserId,
      read: false
    });

    res.status(200).json({ count: unreadCount });
  } catch (error) {
    console.error('Error fetching unread message count:', error);
    res.status(500).json({ message: 'Server error fetching unread message count.' });
  }
};

// Get all notifications for the current user
const getNotifications = async (req, res) => {
  try {
    const currentUserId = req.user.id;

    const notifications = await Message.find({ recipient: currentUserId })
      .populate('sender', 'name email')
      .sort('-createdAt'); // Most recent first

    res.status(200).json(notifications);
  } catch (error) {
    console.error('Error fetching notifications:', error);
    res.status(500).json({ message: 'Server error fetching notifications.' });
  }
};

module.exports = {
  sendMessage,
  getConversation,
  markMessagesAsRead,
  getUnreadMessageCount,
  getNotifications
}; 