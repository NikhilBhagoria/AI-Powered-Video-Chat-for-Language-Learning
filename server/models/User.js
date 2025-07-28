const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: [true, 'Username is required'],
    unique: true,
    trim: true,
    minlength: [3, 'Username must be at least 3 characters long'],
    maxlength: [30, 'Username cannot exceed 30 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    trim: true,
    lowercase: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters long']
  },
  nativeLanguage: {
    type: String,
    required: [true, 'Native language is required'],
    enum: ['English', 'Spanish', 'French', 'German', 'Chinese', 'Japanese', 'Hindi']
  },
  learningLanguages: [{
    type: String,
    enum: ['English', 'Spanish', 'French', 'German', 'Chinese', 'Japanese', 'Hindi']
  }],
  lastLogin: {
    type: String,
    default: () => new Date().toISOString().slice(0, 19).replace('T', ' ')
  },
  isOnline: {
    type: Boolean,
    default: false
  },
  profilePicture: {
    type: String,
    default: ''
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

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Update timestamps on save
userSchema.pre('save', function(next) {
  this.updatedAt = new Date().toISOString().slice(0, 19).replace('T', ' ');
  next();
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', userSchema);