const mongoose = require('mongoose');

const chatHistorySchema = new mongoose.Schema({
  participants: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  messages: [{
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    content: String,
    translation: String,
    correction: String,
    timestamp: {
      type: Date,
      default: Date.now
    }
  }],
  sessionStart: {
    type: Date,
    default: Date.now
  },
  sessionEnd: Date,
  language: {
    from: String,
    to: String
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('ChatHistory', chatHistorySchema);