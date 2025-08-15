import React, { useEffect } from 'react';
import { useParams } from 'react-router';
import { useSelector } from 'react-redux';

const Chat = () => {
  const { chatId } = useParams();
  const { currentChat, loading } = useSelector(state => state.chat);
  const { user: currentUser } = useSelector(state => state.auth);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!currentChat) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p className="text-gray-600">Chat not found</p>
      </div>
    );
  }

  const partner = currentChat.user1Id._id === currentUser._id 
    ? currentChat.user2Id 
    : currentChat.user1Id;

  return (
    <div className="flex flex-col h-screen bg-gray-100">
      {/* Chat Header */}
      <div className="bg-white shadow-sm p-4">
        <div className="flex items-center space-x-4">
          <img
            src={partner.profilePicture || '/default-avatar.png'}
            alt={partner.username}
            className="w-10 h-10 rounded-full"
          />
          <div>
            <h2 className="font-semibold text-gray-900">
              {partner.username}
              {partner.isOnline && (
                <span className="ml-2 inline-block w-2 h-2 bg-green-500 rounded-full"></span>
              )}
            </h2>
          </div>
        </div>
      </div>

      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto p-4">
        {/* Messages will be added here */}
        <p className="text-center text-gray-500">
          Start your conversation with {partner.username}
        </p>
      </div>

      {/* Message Input */}
      <div className="bg-white p-4 border-t">
        <div className="flex space-x-4">
          <input
            type="text"
            placeholder="Type a message..."
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <button className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            Send
          </button>
        </div>
      </div>
    </div>
  );
};

export default Chat;