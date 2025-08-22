import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Search Users
export const searchUsers = createAsyncThunk(
  'chat/searchUsers',
  async ({ query, language }, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(
        `${API_URL}/users/search?q=${query}&language=${language}`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Failed to search users');
    }
  }
);

// Initialize Chat
export const initiateChat = createAsyncThunk(
  'chat/initiateChat',
  async (userId, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        `${API_URL}/chats/initiate`,
        { userId },
        {
          headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (!response.data.success) {
        throw new Error(response.data.message);
      }

      return {
        chatId: response.data.chatId,
        chat: response.data.chat
      };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to start chat');
    }
  }
);

// Get Active Chats
export const getActiveChats = createAsyncThunk(
  'chat/getActiveChats',
  async (_, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(
        `${API_URL}/chats/active`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Failed to fetch active chats');
    }
  }
);

// Fetch Messages
export const fetchMessages = createAsyncThunk(
  'chat/fetchMessages',
  async (chatId, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(
        `${API_URL}/chats/${chatId}/messages`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Failed to fetch messages');
    }
  }
);

// Send Message
export const sendMessage = createAsyncThunk(
  'chat/sendMessage',
  async ({ chatId, content }, { rejectWithValue, getState }) => {
    try {
      const token = localStorage.getItem('token');
      const currentTime = new Date().toISOString().slice(0, 19).replace('T', ' ');
      const currentUser = getState().auth.user;

      const response = await axios.post(
        `${API_URL}/chats/${chatId}/messages`,
        {
          content,
          timestamp: currentTime
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      return {
        chatId,
        message: response.data,
        lastMessage: {
          content,
          sender: currentUser._id,
          timestamp: currentTime
        }
      };
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Failed to send message');
    }
  }
);

// Mark Messages as Read
export const markMessagesAsRead = createAsyncThunk(
  'chat/markMessagesAsRead',
  async (chatId, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.put(
        `${API_URL}/chats/${chatId}/read`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      return { chatId, data: response.data };
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Failed to mark messages as read');
    }
  }
);

const chatSlice = createSlice({
  name: 'chat',
  initialState: {
    searchResults: [],
    activeChats: [],
    currentChat: null,
    messages: [],
    loading: false,
    error: null,
    unreadCounts: {},
    lastTypingTimestamp: null
  },
  reducers: {
    clearSearch: (state) => {
      state.searchResults = [];
    },
    clearMessages: (state) => {
      state.messages = [];
    },
    setCurrentChat: (state, action) => {
      state.currentChat = action.payload;
    },
    updateLastMessage: (state, action) => {
      const { chatId, lastMessage } = action.payload;
      const chat = state.activeChats.find(c => c._id === chatId);
      if (chat) {
        chat.lastMessage = lastMessage;
        chat.lastActivity = lastMessage.timestamp;
      }
      if (state.currentChat?._id === chatId) {
        state.currentChat.lastMessage = lastMessage;
        state.currentChat.lastActivity = lastMessage.timestamp;
      }
    },
    updateUnreadCount: (state, action) => {
      const { chatId, count } = action.payload;
      state.unreadCounts[chatId] = count;
    },
    updateUserStatus: (state, action) => {
      const { userId, isOnline, lastLogin } = action.payload;
      state.activeChats = state.activeChats.map(chat => {
        if (chat.user1Id._id === userId) {
          chat.user1Id.isOnline = isOnline;
          chat.user1Id.lastLogin = lastLogin;
        }
        if (chat.user2Id._id === userId) {
          chat.user2Id.isOnline = isOnline;
          chat.user2Id.lastLogin = lastLogin;
        }
        return chat;
      });

      if (state.currentChat) {
        if (state.currentChat.user1Id._id === userId) {
          state.currentChat.user1Id.isOnline = isOnline;
          state.currentChat.user1Id.lastLogin = lastLogin;
        }
        if (state.currentChat.user2Id._id === userId) {
          state.currentChat.user2Id.isOnline = isOnline;
          state.currentChat.user2Id.lastLogin = lastLogin;
        }
      }
    },
    setTypingStatus: (state, action) => {
      state.lastTypingTimestamp = new Date().toISOString().slice(0, 19).replace('T', ' ');
    }
  },
  extraReducers: (builder) => {
    builder
      // Search Users
      .addCase(searchUsers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(searchUsers.fulfilled, (state, action) => {
        state.loading = false;
        state.searchResults = action.payload;
      })
      .addCase(searchUsers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Initiate Chat
      .addCase(initiateChat.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(initiateChat.fulfilled, (state, action) => {
        state.loading = false;
        state.currentChat = action.payload.chat;
        if (!state.activeChats.find(chat => chat._id === action.payload.chatId)) {
          state.activeChats.push(action.payload.chat);
        }
      })
      .addCase(initiateChat.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Get Active Chats
      .addCase(getActiveChats.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getActiveChats.fulfilled, (state, action) => {
        state.loading = false;
        state.activeChats = action.payload;
      })
      .addCase(getActiveChats.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Fetch Messages
      .addCase(fetchMessages.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMessages.fulfilled, (state, action) => {
        state.loading = false;
        state.messages = action.payload;
      })
      .addCase(fetchMessages.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Send Message
      .addCase(sendMessage.pending, (state) => {
        state.error = null;
      })
      .addCase(sendMessage.fulfilled, (state, action) => {
        const { message, chatId, lastMessage } = action.payload;
        state.messages.push(message);
        
        // Update last message in chat
        const chat = state.activeChats.find(c => c._id === chatId);
        if (chat) {
          chat.lastMessage = lastMessage;
          chat.lastActivity = lastMessage.timestamp;
        }
        if (state.currentChat?._id === chatId) {
          state.currentChat.lastMessage = lastMessage;
          state.currentChat.lastActivity = lastMessage.timestamp;
        }
      })
      .addCase(sendMessage.rejected, (state, action) => {
        state.error = action.payload;
      })

      // Mark Messages as Read
      .addCase(markMessagesAsRead.fulfilled, (state, action) => {
        const { chatId } = action.payload;
        state.unreadCounts[chatId] = 0;
        state.messages = state.messages.map(msg => ({
          ...msg,
          read: true
        }));
      });
  }
});

export const {
  clearSearch,
  clearMessages,
  setCurrentChat,
  updateLastMessage,
  updateUnreadCount,
  updateUserStatus,
  setTypingStatus
} = chatSlice.actions;

export default chatSlice.reducer;