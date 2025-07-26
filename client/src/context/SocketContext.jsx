import React, { createContext, useContext, useEffect, useState } from 'react';
import io from 'socket.io-client';
import { useAuth } from './AuthContext';

const SocketContext = createContext(null);

export const useSocket = () => useContext(SocketContext);

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const { user } = useAuth();
  const SOCKET_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

  useEffect(() => {
    let newSocket;

    if (user && !socket) {
      // Initialize socket with auth token
      newSocket = io(SOCKET_URL, {
        auth: {
          token: localStorage.getItem('token')
        },
        transports: ['websocket'],
        reconnection: true,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 5000,
        reconnectionAttempts: 5
      });

      // Socket connection handlers
      newSocket.on('connect', () => {
        console.log('Socket Connected!');
        // Set initial user status
        newSocket.emit('setUserStatus', {
          userId: user.id,
          status: 'online'
        });
      });

      newSocket.on('connect_error', (error) => {
        console.error('Socket connection error:', error);
        if (error.message === 'Authentication error') {
          // Handle authentication errors
          localStorage.removeItem('token');
          window.location.href = '/login';
        }
      });

      newSocket.on('disconnect', () => {
        console.log('Socket Disconnected!');
      });

      // Custom event handlers
      newSocket.on('userStatusUpdate', (data) => {
        console.log('User status update:', data);
      });

      newSocket.on('matchUpdate', (data) => {
        console.log('Match update received:', data);
      });

      newSocket.on('chatMessage', (data) => {
        console.log('New chat message:', data);
      });

      setSocket(newSocket);
    }

    // Cleanup on unmount or user logout
    return () => {
      if (newSocket) {
        newSocket.off('connect');
        newSocket.off('disconnect');
        newSocket.off('userStatusUpdate');
        newSocket.off('matchUpdate');
        newSocket.off('chatMessage');
        newSocket.close();
        setSocket(null);
      }
    };
  }, [user, SOCKET_URL]);

  // Helper functions for socket interactions
  const emitEvent = (eventName, data) => {
    if (socket) {
      socket.emit(eventName, data);
    } else {
      console.error('Socket not connected');
    }
  };

  const subscribeToChatRoom = (roomId) => {
    if (socket) {
      socket.emit('joinRoom', { roomId });
    }
  };

  const leaveChatRoom = (roomId) => {
    if (socket) {
      socket.emit('leaveRoom', { roomId });
    }
  };

  const sendMessage = (roomId, message) => {
    if (socket) {
      socket.emit('chatMessage', {
        roomId,
        message,
        sender: user.id
      });
    }
  };

  const value = {
    socket,
    isConnected: !!socket?.connected,
    emitEvent,
    subscribeToChatRoom,
    leaveChatRoom,
    sendMessage
  };

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  );
};

// Custom hook for socket events
export const useSocketEvent = (eventName, callback) => {
  const { socket } = useSocket();

  useEffect(() => {
    if (!socket) return;

    socket.on(eventName, callback);

    return () => {
      socket.off(eventName, callback);
    };
  }, [socket, eventName, callback]);
};

// Example usage in components:
/*
import { useSocket, useSocketEvent } from '../context/SocketContext';

const MyComponent = () => {
  const { isConnected, sendMessage } = useSocket();

  useSocketEvent('chatMessage', (data) => {
    console.log('New message received:', data);
  });

  const handleSend = () => {
    sendMessage('room123', 'Hello!');
  };

  return (
    <div>
      {isConnected ? 'Connected' : 'Disconnecting...'}
      <button onClick={handleSend}>Send Message</button>
    </div>
  );
};
*/