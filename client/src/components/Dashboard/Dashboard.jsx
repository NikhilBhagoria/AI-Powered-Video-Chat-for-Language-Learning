import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchUserData } from '../../store/slices/userSlice';
import { logoutUser } from '../../store/slices/authSlice';
import { useNavigate } from 'react-router';
import styles from './Dashboard.module.css';

const Dashboard = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const { 
    activeChats, 
    recentMatches, 
    languageStats 
  } = useSelector((state) => state.user);

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
    <div className={styles.dashboardContainer}>
      {/* Header */}
      <header className={styles.header}>
        <div className={styles.userInfo}>
          <h2>Welcome, {user?.username}</h2>
          <p>{currentDateTime} UTC</p>
        </div>
        <button onClick={handleLogout} className={styles.logoutButton}>
          Logout
        </button>
      </header>

      {/* Main Content */}
      <div className={styles.content}>
        {/* Language Stats */}
        <section className={styles.statsSection}>
          <h3>Language Progress</h3>
          <div className={styles.languageStats}>
            {languageStats?.map((stat) => (
              <div key={stat.language} className={styles.statCard}>
                <h4>{stat.language}</h4>
                <p>Sessions: {stat.sessions}</p>
                <p>Hours Practiced: {stat.hoursPracticed}</p>
                <div className={styles.progressBar}>
                  <div 
                    style={{ width: `${stat.proficiency}%` }}
                    className={styles.progress}
                  />
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Active Chats */}
        <section className={styles.chatsSection}>
          <h3>Active Chats</h3>
          <div className={styles.chatsList}>
            {activeChats?.map((chat) => (
              <div key={chat.id} className={styles.chatCard}>
                <img src={chat.partnerAvatar} alt={chat.partnerName} />
                <div>
                  <h4>{chat.partnerName}</h4>
                  <p>{chat.language}</p>
                  <p>Last Active: {new Date(chat.lastActive).toLocaleString()}</p>
                </div>
                <button onClick={() => navigate(`/chat/${chat.id}`)}>
                  Continue
                </button>
              </div>
            ))}
          </div>
        </section>

        {/* Recent Matches */}
        <section className={styles.matchesSection}>
          <h3>Recent Language Partners</h3>
          <div className={styles.matchesList}>
            {recentMatches?.map((match) => (
              <div key={match.id} className={styles.matchCard}>
                <img src={match.avatar} alt={match.name} />
                <div>
                  <h4>{match.name}</h4>
                  <p>{match.nativeLanguage} → {match.learningLanguage}</p>
                  <p>Sessions: {match.sessionCount}</p>
                </div>
                <button onClick={() => navigate(`/profile/${match.id}`)}>
                  View Profile
                </button>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};

export default Dashboard;