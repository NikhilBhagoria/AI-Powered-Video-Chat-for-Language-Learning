import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Async Thunks
export const fetchChatHistory = createAsyncThunk(
  'chat/fetchHistory',
  async (chatId, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/chat/${chatId}/history`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Failed to fetch chat history');
    }
  }
);

export const sendMessage = createAsyncThunk(
  'chat/sendMessage',
  async ({ chatId, message, targetLanguage }, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        `${API_URL}/chat/${chatId}/message`,
        { 
          content: message,
          targetLanguage 
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Failed to send message');
    }
  }
);

export const translateMessage = createAsyncThunk(
  'chat/translateMessage',
  async ({ messageId, targetLanguage }, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        `${API_URL}/chat/translate`,
        { messageId, targetLanguage },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Failed to translate message');
    }
  }
);

// Chat (UserSearch)
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

export const initiateChat = createAsyncThunk(
  'chat/initiateChat',
  async (userId, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        `${API_URL}/chats/initiate`,
        { userId },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Failed to start chat');
    }
  }
);



// Initial state
const initialState = {
  searchResults: [],
  activeChats: [],
  currentChat: {
    id: null,
    partner: null,
    messages: [],
    status: 'idle', // 'idle' | 'typing' | 'recording' | 'translating'
    lastMessageTime: null,
    unreadCount: 0
  },
  chatHistory: {},
  loading: false,
  error: null,
  lastUpdated: new Date().toISOString()
};

const chatSlice = createSlice({
  name: 'chat',
  initialState,
  reducers: {
    clearSearch: (state) => {
      state.searchResults = [];
    },
    setCurrentChat: (state, action) => {
      state.currentChat = {
        ...state.currentChat,
        ...action.payload,
        messages: state.chatHistory[action.payload.id] || []
      };
    },
    addMessage: (state, action) => {
      const { chatId, message } = action.payload;
      if (!state.chatHistory[chatId]) {
        state.chatHistory[chatId] = [];
      }
      state.chatHistory[chatId].push(message);
      
      if (state.currentChat.id === chatId) {
        state.currentChat.messages.push(message);
        state.currentChat.lastMessageTime = message.timestamp;
      }
    },
    updateChatStatus: (state, action) => {
      const { chatId, status } = action.payload;
      if (state.currentChat.id === chatId) {
        state.currentChat.status = status;
      }
    },
    setTypingStatus: (state, action) => {
      const { chatId, isTyping, userId } = action.payload;
      if (state.currentChat.id === chatId) {
        state.currentChat.status = isTyping ? 'typing' : 'idle';
      }
    },
    updateUnreadCount: (state, action) => {
      const { chatId, count } = action.payload;
      const chatIndex = state.activeChats.findIndex(chat => chat.id === chatId);
      if (chatIndex !== -1) {
        state.activeChats[chatIndex].unreadCount = count;
      }
    },
    clearChatHistory: (state, action) => {
      const chatId = action.payload;
      if (state.chatHistory[chatId]) {
        delete state.chatHistory[chatId];
      }
      if (state.currentChat.id === chatId) {
        state.currentChat.messages = [];
      }
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch Chat History
      .addCase(fetchChatHistory.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchChatHistory.fulfilled, (state, action) => {
        const { chatId, messages } = action.payload;
        state.loading = false;
        state.chatHistory[chatId] = messages;
        if (state.currentChat.id === chatId) {
          state.currentChat.messages = messages;
        }
        state.lastUpdated = new Date().toISOString();
      })
      .addCase(fetchChatHistory.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Send Message
      .addCase(sendMessage.pending, (state) => {
        state.error = null;
      })
      .addCase(sendMessage.fulfilled, (state, action) => {
        const { chatId, message } = action.payload;
        if (!state.chatHistory[chatId]) {
          state.chatHistory[chatId] = [];
        }
        state.chatHistory[chatId].push(message);
        if (state.currentChat.id === chatId) {
          state.currentChat.messages.push(message);
          state.currentChat.lastMessageTime = message.timestamp;
        }
      })
      .addCase(sendMessage.rejected, (state, action) => {
        state.error = action.payload;
      })
      // Translate Message
      .addCase(translateMessage.fulfilled, (state, action) => {
        const { messageId, chatId, translation } = action.payload;
        const updateMessage = (messages) => {
          const messageIndex = messages.findIndex(msg => msg.id === messageId);
          if (messageIndex !== -1) {
            messages[messageIndex].translation = translation;
          }
        };

        if (state.chatHistory[chatId]) {
          updateMessage(state.chatHistory[chatId]);
        }
        if (state.currentChat.id === chatId) {
          updateMessage(state.currentChat.messages);
        }
      })
      // UserSearch
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
      .addCase(initiateChat.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(initiateChat.fulfilled, (state, action) => {
        state.loading = false;
        state.activeChats = [...state.activeChats, action.payload];
      })
      .addCase(initiateChat.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  }
});

// Selectors
export const selectCurrentChat = (state) => state.chat.currentChat;
export const selectChatHistory = (state) => state.chat.chatHistory;
export const selectActiveChats = (state) => state.chat.activeChats;
export const selectChatLoading = (state) => state.chat.loading;
export const selectChatError = (state) => state.chat.error;

// Action creators
export const {
  clearSearch,
  setCurrentChat,
  addMessage,
  updateChatStatus,
  setTypingStatus,
  updateUnreadCount,
  clearChatHistory
} = chatSlice.actions;

export default chatSlice.reducer;