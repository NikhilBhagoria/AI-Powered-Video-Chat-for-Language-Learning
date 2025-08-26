const Message = require('../models/Message');
const Chat = require('../models/Chat');
const User = require('../models/User');

// Get all messages for a chat
const getMessages = async (req, res) => {
  try {
    const { chatId } = req.params;
    const userId = req.user.userId;

    // Verify chat exists and user is a participant
    const chat = await Chat.findOne({
      _id: chatId,
      $or: [
        { user1Id: userId },
        { user2Id: userId }
      ]
    });

    if (!chat) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to access this chat'
      });
    }

    // Get messages
    const messages = await Message.find({ chatId })
      .sort({ timestamp: 1 })
      .populate('sender', 'username')
      .lean();

    // Mark messages as read
    if (messages.length > 0) {
      const currentTime = new Date().toISOString().slice(0, 19).replace('T', ' ');
      
      await Message.updateMany(
        {
          chatId,
          sender: { $ne: userId },
          read: false
        },
        {
          $set: {
            read: true,
            readAt: currentTime
          }
        }
      );

      // Update unread count in chat
      await Chat.findByIdAndUpdate(chatId, {
        $set: { unreadCount: 0 }
      });
    }

    res.json(messages);

  } catch (error) {
    console.error('Get messages error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching messages'
    });
  }
};

// Send a new message
const sendMessage = async (req, res) => {
  try {
    const { chatId } = req.params;
    const { content } = req.body;
    const userId = req.user.userId;
    const currentTime = new Date().toISOString().slice(0, 19).replace('T', ' ');

    // Validate content
    if (!content || !content.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Message content is required'
      });
    }

    // Verify chat exists and user is a participant
    const chat = await Chat.findOne({
      _id: chatId,
      $or: [
        { user1Id: userId },
        { user2Id: userId }
      ]
    });

    if (!chat) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to send messages in this chat'
      });
    }

    // Create new message
    const newMessage = await Message.create({
      chatId,
      sender: userId,
      content: content.trim(),
      timestamp: currentTime
    });

    // Update chat's last message and activity
    await Chat.findByIdAndUpdate(chatId, {
      $set: {
        lastMessage: {
          content: content.trim(),
          sender: userId,
          timestamp: currentTime
        },
        lastActivity: currentTime
      },
      $inc: { unreadCount: 1 }
    });

    // Populate sender details
    const populatedMessage = await Message.findById(newMessage._id)
      .populate('sender', 'username')
      .lean();

    res.status(201).json(populatedMessage);

  } catch (error) {
    console.error('Send message error:', error);
    res.status(500).json({
      success: false,
      message: 'Error sending message'
    });
  }
};

// Delete a message
const deleteMessage = async (req, res) => {
  try {
    const { chatId, messageId } = req.params;
    const userId = req.user.userId;

    // Find message and verify ownership
    const message = await Message.findOne({
      _id: messageId,
      chatId,
      sender: userId
    });

    if (!message) {
      return res.status(404).json({
        success: false,
        message: 'Message not found or not authorized to delete'
      });
    }

    // Delete message
    await Message.findByIdAndDelete(messageId);

    // Update chat's last message if needed
    const lastMessage = await Message.findOne({ chatId })
      .sort({ timestamp: -1 })
      .lean();

    if (lastMessage) {
      await Chat.findByIdAndUpdate(chatId, {
        lastMessage: {
          content: lastMessage.content,
          sender: lastMessage.sender,
          timestamp: lastMessage.timestamp
        }
      });
    }

    res.json({
      success: true,
      message: 'Message deleted successfully'
    });

  } catch (error) {
    console.error('Delete message error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting message'
    });
  }
};

// Mark messages as read
const markAsRead = async (req, res) => {
  try {
    const { chatId } = req.params;
    const userId = req.user.userId;
    const currentTime = new Date().toISOString().slice(0, 19).replace('T', ' ');

    // Update unread messages
    await Message.updateMany(
      {
        chatId,
        sender: { $ne: userId },
        read: false
      },
      {
        $set: {
          read: true,
          readAt: currentTime
        }
      }
    );

    // Reset unread count in chat
    await Chat.findByIdAndUpdate(chatId, {
      $set: { unreadCount: 0 }
    });

    res.json({
      success: true,
      message: 'Messages marked as read'
    });

  } catch (error) {
    console.error('Mark as read error:', error);
    res.status(500).json({
      success: false,
      message: 'Error marking messages as read'
    });
  }
};

module.exports = {
  getMessages,
  sendMessage,
  deleteMessage,
  markAsRead
};