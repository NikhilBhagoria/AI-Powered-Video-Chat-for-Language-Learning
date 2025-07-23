const socketIO = require('socket.io');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const activeUsers = new Map(); // Store active users and their socket IDs

module.exports = (server) => {
  const io = socketIO(server, {
    cors: {
      origin: process.env.FRONTEND_URL || "http://localhost:3000",
      methods: ["GET", "POST"]
    }
  });

  // Authentication middleware
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      if (!token) {
        return next(new Error('Authentication error'));
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.userId);
      if (!user) {
        return next(new Error('User not found'));
      }

      socket.user = user;
      next();
    } catch (error) {
      next(new Error('Authentication error'));
    }
  });

  io.on('connection', (socket) => {
    const userId = socket.user._id;
    activeUsers.set(userId.toString(), socket.id);

    // Update user's online status
    User.findByIdAndUpdate(userId, { onlineStatus: true, lastActive: new Date() }).exec();

    // Join language-specific rooms
    socket.user.learningLanguages.forEach(lang => {
      socket.join(`learning_${lang}`);
    });
    socket.join(`native_${socket.user.nativeLanguage}`);

    // Handle matchmaking
    socket.on('findMatch', async (data) => {
      const { targetLanguage } = data;
      const potentialMatches = Array.from(io.sockets.adapter.rooms.get(`native_${targetLanguage}`));
      
      // Find first available match
      const match = potentialMatches.find(id => {
        const socket = io.sockets.sockets.get(id);
        return socket.user.learningLanguages.includes(socket.user.nativeLanguage);
      });

      if (match) {
        const matchSocket = io.sockets.sockets.get(match);
        // Notify both users
        socket.emit('matchFound', {
          partnerId: matchSocket.user._id,
          partnerName: matchSocket.user.username
        });
        matchSocket.emit('matchFound', {
          partnerId: socket.user._id,
          partnerName: socket.user.username
        });
      } else {
        socket.emit('waiting');
      }
    });

    // Handle disconnection
    socket.on('disconnect', () => {
      activeUsers.delete(userId.toString());
      User.findByIdAndUpdate(userId, { onlineStatus: false, lastActive: new Date() }).exec();
    });
  });

  return io;
};