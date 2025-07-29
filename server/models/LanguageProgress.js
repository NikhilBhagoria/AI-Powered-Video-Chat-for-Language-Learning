const mongoose = require('mongoose');

const languageProgressSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  languages: [{
    name: {
      type: String,
      required: true
    },
    proficiency: {
      type: Number,
      default: 0,
      min: 0,
      max: 100
    },
    sessionsCompleted: {
      type: Number,
      default: 0
    },
    practiceTime: {
      type: Number, // In minutes
      default: 0
    },
    lastPracticeDate: {
      type: String,
      default: () => new Date().toISOString().slice(0, 19).replace('T', ' ')
    }
  }],
  totalPracticeTime: {
    type: Number,
    default: 0
  },
  lastPracticeSession: {
    type: String,
    default: () => new Date().toISOString().slice(0, 19).replace('T', ' ')
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

module.exports = mongoose.model('LanguageProgress', languageProgressSchema);