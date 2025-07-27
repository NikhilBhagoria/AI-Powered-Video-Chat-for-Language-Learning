import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Helper function to format UTC datetime
export const formatUTCDateTime = (date = new Date()) => {
  return date.toISOString().slice(0, 19).replace('T', ' ');
};

// Async thunk for fetching user data
export const fetchUserData = createAsyncThunk(
  'user/fetchUserData',
  async (_, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/user/data`, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Failed to fetch user data');
    }
  }
);

// Async thunk for updating user status
export const updateUserStatus = createAsyncThunk(
  'user/updateStatus',
  async (status, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.put(
        `${API_URL}/user/status`,
        { status },
        {
          headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Failed to update status');
    }
  }
);

const userSlice = createSlice({
  name: 'user',
  initialState: {
    currentUser: {
      username: 'NikhilBhagoria',
      lastLogin: formatUTCDateTime(),
      status: 'online'
    },
    activeChats: [],
    recentMatches: [],
    languageStats: [],
    notifications: [],
    loading: false,
    error: null,
    lastUpdated: formatUTCDateTime()
  },
  reducers: {
    setUserStatus: (state, action) => {
      state.currentUser.status = action.payload;
    },
    addNotification: (state, action) => {
      state.notifications.unshift(action.payload);
    },
    clearNotifications: (state) => {
      state.notifications = [];
    },
    updateLastLogin: (state) => {
      state.currentUser.lastLogin = formatUTCDateTime();
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch User Data
      .addCase(fetchUserData.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUserData.fulfilled, (state, action) => {
        state.loading = false;
        state.activeChats = action.payload.activeChats;
        state.recentMatches = action.payload.recentMatches;
        state.languageStats = action.payload.languageStats;
        state.lastUpdated = formatUTCDateTime();
      })
      .addCase(fetchUserData.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Update User Status
      .addCase(updateUserStatus.fulfilled, (state, action) => {
        state.currentUser.status = action.payload.status;
      });
  }
});

// Selectors
export const selectCurrentUser = (state) => state.user.currentUser;
export const selectActiveChats = (state) => state.user.activeChats;
export const selectRecentMatches = (state) => state.user.recentMatches;
export const selectLanguageStats = (state) => state.user.languageStats;
export const selectNotifications = (state) => state.user.notifications;

// Action creators
export const { 
  setUserStatus, 
  addNotification, 
  clearNotifications,
  updateLastLogin 
} = userSlice.actions;

export default userSlice.reducer;