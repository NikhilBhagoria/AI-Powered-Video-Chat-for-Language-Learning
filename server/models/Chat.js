const mongoose = require('mongoose');

const chatSchema = new mongoose.Schema({
  user1Id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  user2Id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  status: {
    type: String,
    enum: ['active', 'archived', 'blocked'],
    default: 'active'
  },
  lastMessage: {
    content: String,
    sender: mongoose.Schema.Types.ObjectId,
    timestamp: {
      type: String,
      default: () => new Date().toISOString().slice(0, 19).replace('T', ' ')
    }
  },
  lastActivity: {
    type: String,
    default: () => new Date().toISOString().slice(0, 19).replace('T', ' ')
  },
  unreadCount: {
    type: Number,
    default: 0
  },
  sessionCount: {
    type: Number,
    default: 0
  },
  createdAt: {
    type: String,
    default: () => new Date().toISOString().slice(0, 19).replace('T', ' ')
  },
  updatedAt: {
    type: String,
    default: () => new Date().toISOString().slice(0, 19).replace('T', ' ')
  }
});

module.exports = mongoose.model('Chat', chatSchema);