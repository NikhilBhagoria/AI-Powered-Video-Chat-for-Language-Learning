const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  chatId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Chat',
    required: true
  },
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  content: {
    type: String,
    required: true,
    trim: true
  },
  timestamp: {
    type: String,
    default: () => new Date().toISOString().slice(0, 19).replace('T', ' ')
  },
  read: {
    type: Boolean,
    default: false
  },
  readAt: {
    type: String,
    default: null
  }
});

module.exports = mongoose.model('Message', messageSchema);