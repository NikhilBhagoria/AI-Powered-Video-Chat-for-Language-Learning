const Chat = require('../models/Chat');
const User = require('../models/User');

const initiateChat = async (req, res) => {
  try {
    const { userId } = req.body;
    const currentUserId = req.user.userId;

    if (userId === currentUserId) {
      return res.status(400).json({
        success: false,
        message: "Cannot initiate chat with yourself"
      });
    }

    // Check if chat already exists
    const existingChat = await Chat.findOne({
      $or: [
        { user1Id: currentUserId, user2Id: userId },
        { user1Id: userId, user2Id: currentUserId }
      ]
    }).populate('user1Id user2Id', 'username isOnline');

    if (existingChat) {
      return res.json({
        success: true,
        chatId: existingChat._id,
        chat: existingChat
      });
    }

    // Create new chat
    const newChat = await Chat.create({
      user1Id: currentUserId,
      user2Id: userId,
      status: 'active',
      createdAt: new Date().toISOString().slice(0, 19).replace('T', ' '),
      lastActivity: new Date().toISOString().slice(0, 19).replace('T', ' ')
    });

    // Populate user details
    const populatedChat = await Chat.findById(newChat._id)
      .populate('user1Id user2Id', 'username isOnline');

    res.json({
      success: true,
      chatId: newChat._id,
      chat: populatedChat
    });

  } catch (error) {
    console.error('Initiate chat error:', error);
    res.status(500).json({
      success: false,
      message: 'Error initiating chat'
    });
  }
};

module.exports = { initiateChat };