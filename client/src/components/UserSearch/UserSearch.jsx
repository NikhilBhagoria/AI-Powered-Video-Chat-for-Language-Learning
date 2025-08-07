import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { searchUsers, initiateChat } from '../../store/slices/chatSlice';
import { useNavigate } from 'react-router-dom';

const UserSearch = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState('');
  
  const { searchResults, loading } = useSelector(state => state.chat);
  const { user: currentUser } = useSelector(state => state.auth);

  const languages = [
    'English', 'Spanish', 'French', 'German', 
    'Chinese', 'Japanese', 'Hindi'
  ];

  const handleSearch = (e) => {
    e.preventDefault();
    dispatch(searchUsers({ query: searchQuery, language: selectedLanguage }));
  };

  const startChat = async (userId) => {
    try {
      const chatSession = await dispatch(initiateChat(userId)).unwrap();
      navigate(`/chat/${chatSession.chatId}`);
    } catch (error) {
      console.error('Failed to start chat:', error);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Search Form */}
      <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
        <form onSubmit={handleSearch} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Search Users
              </label>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by username or native language..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Language
              </label>
              <select
                value={selectedLanguage}
                onChange={(e) => setSelectedLanguage(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">All Languages</option>
                {languages.map(lang => (
                  <option key={lang} value={lang}>{lang}</option>
                ))}
              </select>
            </div>
          </div>
          <button
            type="submit"
            className="w-full md:w-auto px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Search
          </button>
        </form>
      </div>

      {/* Search Results */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-gray-900">Search Results</h2>
        {loading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : searchResults?.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {searchResults.map(user => (
              <div 
                key={user._id}
                className="bg-white rounded-lg shadow-sm p-4 border border-gray-200 hover:border-blue-500 transition-colors"
              >
                <div className="flex items-center space-x-4">
                  <img
                    src={user.profilePicture || '/default-avatar.png'}
                    alt={user.username}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-medium text-gray-900">
                      {user.username}
                      {user.isOnline && (
                        <span className="ml-2 inline-block w-2 h-2 bg-green-500 rounded-full"></span>
                      )}
                    </h3>
                    <p className="text-sm text-gray-500">
                      Native: {user.nativeLanguage}
                    </p>
                    <p className="text-sm text-gray-500">
                      Learning: {user.learningLanguages.join(', ')}
                    </p>
                  </div>
                  <button
                    onClick={() => startChat(user._id)}
                    className="px-4 py-2 bg-blue-600 text-white text-sm rounded-full hover:bg-blue-700 transition-colors"
                    disabled={user._id === currentUser._id}
                  >
                    Chat
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-center text-gray-500 py-8">
            No users found. Try adjusting your search criteria.
          </p>
        )}
      </div>
    </div>
  );
};

export default UserSearch;