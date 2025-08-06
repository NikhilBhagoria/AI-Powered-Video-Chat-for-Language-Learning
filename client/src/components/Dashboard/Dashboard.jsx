import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchUserData } from '../../store/slices/userSlice';
import { logoutUser } from '../../store/slices/authSlice';
import { useNavigate } from 'react-router';

const Dashboard = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const { activeChats, recentMatches, languageStats } = useSelector((state) => state.user);

  useEffect(() => {
    dispatch(fetchUserData());
  }, [dispatch]);

  const handleLogout = () => {
    dispatch(logoutUser());
    navigate('/login');
  };

  const currentDateTime = new Date().toLocaleString('en-US', {
    timeZone: 'UTC',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  });

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-gray-900">
                Welcome, {user?.username}
              </h2>
              <p className="text-sm text-gray-500 mt-1">
                {currentDateTime} UTC
              </p>
            </div>
            <button
              onClick={handleLogout}
              className="ml-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 gap-8">
          {/* Language Stats */}
          <section className="bg-white rounded-xl shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Language Progress
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {languageStats?.map((stat) => (
                <div
                  key={stat.language}
                  className="bg-gray-50 rounded-lg p-4 border border-gray-200"
                >
                  <h4 className="font-medium text-gray-900">{stat.language}</h4>
                  <div className="mt-2 space-y-2">
                    <p className="text-sm text-gray-600">
                      Sessions: {stat.sessions}
                    </p>
                    <p className="text-sm text-gray-600">
                      Hours: {stat.hoursPracticed}
                    </p>
                    <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        style={{ width: `${stat.proficiency}%` }}
                        className="h-full bg-blue-600 rounded-full"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Active Chats */}
          <section className="bg-white rounded-xl shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Active Chats
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {activeChats?.map((chat) => (
                <div
                  key={chat.id}
                  className="flex items-center space-x-4 p-4 border border-gray-200 rounded-lg hover:border-blue-500 transition-colors"
                >
                  <img
                    src={chat.partnerAvatar}
                    alt={chat.partnerName}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-medium text-gray-900 truncate">
                      {chat.partnerName}
                    </h4>
                    <p className="text-sm text-gray-500">{chat.language}</p>
                    <p className="text-xs text-gray-400">
                      Last active: {new Date(chat.lastActive).toLocaleString()}
                    </p>
                  </div>
                  <button
                    onClick={() => navigate(`/chat/${chat.id}`)}
                    className="px-3 py-1 bg-blue-600 text-white text-sm rounded-full hover:bg-blue-700 transition-colors"
                  >
                    Chat
                  </button>
                </div>
              ))}
            </div>
          </section>

          {/* Recent Matches */}
          <section className="bg-white rounded-xl shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Recent Language Partners
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {recentMatches?.map((match) => (
                <div
                  key={match.id}
                  className="flex items-center space-x-4 p-4 border border-gray-200 rounded-lg hover:border-blue-500 transition-colors"
                >
                  <img
                    src={match.avatar}
                    alt={match.name}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-medium text-gray-900 truncate">
                      {match.name}
                    </h4>
                    <p className="text-sm text-gray-500">
                      {match.nativeLanguage} → {match.learningLanguage}
                    </p>
                    <p className="text-xs text-gray-400">
                      Sessions: {match.sessionCount}
                    </p>
                  </div>
                  <button
                    onClick={() => navigate(`/profile/${match.id}`)}
                    className="px-3 py-1 bg-gray-600 text-white text-sm rounded-full hover:bg-gray-700 transition-colors"
                  >
                    Profile
                  </button>
                </div>
              ))}
            </div>
          </section>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;