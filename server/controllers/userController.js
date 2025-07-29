const User = require('../models/User');
const Chat = require('../models/Chat');
const LanguageProgress = require('../models/LanguageProgress');

// Helper function for UTC datetime
const getUTCDateTime = () => {
  return new Date().toISOString().slice(0, 19).replace('T', ' ');
};

const userController = {
  // Get user data including stats, active chats, and language progress
  getUserData: async (req, res) => {
    try {
      const userId = req.user.userId; // From auth middleware
      const currentDateTime = getUTCDateTime();

      // Get user with populated data
      const user = await User.findById(userId)
        .select('-password')
        .lean();

      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      // Get active chats
      const activeChats = await Chat.find({
        $or: [
          { user1Id: userId },
          { user2Id: userId }
        ],
        status: 'active'
      })
      .populate('user1Id user2Id', 'username profilePicture lastLogin isOnline')
      .select('lastMessage lastActivity unreadCount')
      .sort({ lastActivity: -1 })
      .lean();

      // Format active chats data
      const formattedChats = activeChats.map(chat => {
        const partner = chat.user1Id._id.toString() === userId ? 
          chat.user2Id : chat.user1Id;
        
        return {
          id: chat._id,
          partnerId: partner._id,
          partnerName: partner.username,
          partnerAvatar: partner.profilePicture,
          lastMessage: chat.lastMessage,
          lastActivity: chat.lastActivity,
          unreadCount: chat.unreadCount,
          isPartnerOnline: partner.isOnline,
          partnerLastLogin: partner.lastLogin
        };
      });

      // Get language progress
      const languageStats = await LanguageProgress.findOne({ userId })
        .select('languages totalPracticeTime lastPracticeSession')
        .lean();

      // Format language stats
      const formattedLanguageStats = languageStats?.languages.map(lang => ({
        language: lang.name,
        proficiency: lang.proficiency,
        sessions: lang.sessionsCompleted,
        hoursPracticed: Math.round(lang.practiceTime / 60), // Convert minutes to hours
        lastPractice: lang.lastPracticeDate
      })) || [];

      // Get recent matches/partners
      const recentMatches = await Chat.find({
        $or: [{ user1Id: userId }, { user2Id: userId }],
        createdAt: { 
          $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // Last 30 days
        }
      })
      .populate('user1Id user2Id', 'username nativeLanguage learningLanguages profilePicture')
      .sort({ createdAt: -1 })
      .limit(5)
      .lean();

      // Format recent matches
      const formattedMatches = recentMatches.map(match => {
        const partner = match.user1Id._id.toString() === userId ? 
          match.user2Id : match.user1Id;

        return {
          id: match._id,
          name: partner.username,
          avatar: partner.profilePicture,
          nativeLanguage: partner.nativeLanguage,
          learningLanguage: partner.learningLanguages[0],
          sessionCount: match.sessionCount || 0
        };
      });

      // Update user's last data fetch time
      await User.findByIdAndUpdate(userId, {
        lastDataFetch: currentDateTime
      });

      // Return formatted response
      res.json({
        success: true,
        data: {
          user: {
            id: user._id,
            username: user.username,
            email: user.email,
            nativeLanguage: user.nativeLanguage,
            learningLanguages: user.learningLanguages,
            lastLogin: user.lastLogin,
            createdAt: user.createdAt
          },
          activeChats: formattedChats,
          languageStats: formattedLanguageStats,
          recentMatches: formattedMatches,
          lastUpdated: currentDateTime
        }
      });

    } catch (error) {
      console.error('Get user data error:', error);
      res.status(500).json({
        success: false,
        message: 'Error fetching user data'
      });
    }
  }
};

module.exports = userController;