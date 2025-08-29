import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router';
import { getActiveChats } from '../../store/slices/chatSlice';

const ChatList = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { activeChats, loading } = useSelector(state => state.chat);
  const { user: currentUser } = useSelector(state => state.auth);

  useEffect(() => {
    dispatch(getActiveChats());
  }, [dispatch]);

  const formatTimestamp = (timestamp) => {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    });
  };

  const getPartnerInfo = (chat) => {
    const partner = chat.user1Id._id === currentUser._id ? chat.user2Id : chat.user1Id;
    return partner;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">Your Chats</h1>
        <button
          onClick={() => navigate('/chats/search')}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Find Users
        </button>
      </div>

      <div className="space-y-4">
        {activeChats.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500">No active chats</p>
            <button
              onClick={() => navigate('/chats/search')}
              className="mt-4 text-blue-600 hover:underline"
            >
              Start a new chat
            </button>
          </div>
        ) : (
          activeChats.map(chat => {
            const partner = getPartnerInfo(chat);
            return (
              <Link
                key={chat._id}
                to={`/chats/${chat._id}`}
                className="block bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow p-4 border border-gray-200"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <img
                      src={partner.profilePicture || '/default-avatar.png'}
                      alt={partner.username}
                      className="w-12 h-12 rounded-full bg-gray-200"
                    />
                    <div>
                      <h3 className="font-medium text-gray-900 flex items-center">
                        {partner.username}
                        {partner.isOnline && (
                          <span className="ml-2 w-2 h-2 bg-green-500 rounded-full"></span>
                        )}
                      </h3>
                      {chat.lastMessage && (
                        <p className="text-sm text-gray-500 truncate">
                          {chat.lastMessage.sender === currentUser._id ? 'You: ' : ''}
                          {chat.lastMessage.content}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-500">
                      {formatTimestamp(chat.lastActivity)}
                    </p>
                    {chat.unreadCount > 0 && (
                      <span className="inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white bg-blue-600 rounded-full">
                        {chat.unreadCount}
                      </span>
                    )}
                  </div>
                </div>
              </Link>
            );
          })
        )}
      </div>
    </div>
  );
};

export default ChatList;