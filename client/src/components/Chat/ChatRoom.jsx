import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router';
import { useDispatch, useSelector } from 'react-redux';
import { fetchMessages, sendMessage, markMessagesAsRead } from '../../store/slices/chatSlice';

const ChatRoom = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { chatId } = useParams();
  const messagesEndRef = useRef(null);
  const [messageInput, setMessageInput] = useState('');

  const { messages, currentChat, loading } = useSelector(state => state.chat);
  const { user: currentUser } = useSelector(state => state.auth);

  // Format timestamp to YYYY-MM-DD HH:MM:SS
  const formatTimestamp = (timestamp) => {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    return date.toISOString().slice(0, 19).replace('T', ' ');
  };

  // Scroll to bottom of messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Load messages and mark as read
  useEffect(() => {
    if (chatId) {
      dispatch(fetchMessages(chatId));
      dispatch(markMessagesAsRead(chatId));
    }
  }, [chatId, dispatch]);

  // Scroll to bottom on new messages
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Handle message submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!messageInput.trim()) return;

    try {
      await dispatch(sendMessage({
        chatId,
        content: messageInput
      })).unwrap();
      
      setMessageInput('');
      scrollToBottom();
    } catch (error) {
      alert('Failed to send message');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!currentChat) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <p className="text-gray-500">Chat not found</p>
      </div>
    );
  }

  const partner = currentChat.user1Id._id === currentUser._id 
    ? currentChat.user2Id 
    : currentChat.user1Id;

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm p-4 fixed top-0 w-full z-10">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigate('/chats')}
              className="text-gray-600 hover:text-gray-900"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <img
              src={partner.profilePicture || '/default-avatar.png'}
              alt={partner.username}
              className="w-10 h-10 rounded-full bg-gray-200"
            />
            <div>
              <h2 className="font-semibold text-gray-900">
                {partner.username}
                {partner.isOnline && (
                  <span className="ml-2 inline-block w-2 h-2 bg-green-500 rounded-full"/>
                )}
              </h2>
              <p className="text-sm text-gray-500">
                {partner.isOnline ? 'Online' : 'Offline'}
              </p>
            </div>
          </div>
          <div className="text-sm text-gray-500">
            {formatTimestamp(new Date())}
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 pt-20 pb-24">
        <div className="max-w-4xl mx-auto space-y-4">
          {messages.length === 0 ? (
            <div className="text-center text-gray-500 my-8">
              <p>Start your conversation with {partner.username}</p>
              <p className="text-sm mt-2">
                {formatTimestamp(new Date())}
              </p>
            </div>
          ) : (
            messages.map((msg, index) => (
              <div
                key={index}
                className={`flex ${
                  msg.sender._id === currentUser._id ? 'justify-end' : 'justify-start'
                }`}
              >
                <div
                  className={`max-w-[70%] rounded-lg p-3 ${
                    msg.sender._id === currentUser._id
                      ? 'bg-blue-600 text-white'
                      : 'bg-white text-gray-900'
                  } shadow-sm`}
                >
                  <p className="text-sm">{msg.content}</p>
                  <div className="flex items-center justify-end mt-1 space-x-1">
                    <p className={`text-xs ${
                      msg.sender._id === currentUser._id
                        ? 'text-blue-100'
                        : 'text-gray-500'
                    }`}>
                      {formatTimestamp(msg.timestamp)}
                    </p>
                    {msg.sender._id === currentUser._id && (
                      <span className="text-xs text-blue-100">
                        {msg.read ? '✓✓' : '✓'}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Message Input */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t shadow-lg p-4">
        <form 
          onSubmit={handleSubmit}
          className="max-w-4xl mx-auto flex items-center space-x-4"
        >
          <input
            type="text"
            value={messageInput}
            onChange={(e) => setMessageInput(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <button
            type="submit"
            disabled={!messageInput.trim()}
            className={`px-6 py-2 rounded-lg transition-colors ${
              messageInput.trim()
                ? 'bg-blue-600 text-white hover:bg-blue-700'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            Send
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChatRoom;