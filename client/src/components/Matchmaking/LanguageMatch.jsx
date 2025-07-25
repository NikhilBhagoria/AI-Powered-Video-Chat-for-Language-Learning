import React, { useState, useEffect } from 'react';
import { useSocket } from '../../context/SocketContext';
import { useAuth } from '../../context/AuthContext';

const LanguageMatch = ({ onMatch }) => {
  const { user } = useAuth();
  const socket = useSocket();
  const [searching, setSearching] = useState(false);
  const [targetLanguage, setTargetLanguage] = useState(user.learningLanguages[0]);

  useEffect(() => {
    if (!socket) return;

    const handleMatchFound = (data) => {
      setSearching(false);
      onMatch(data);
    };

    socket.on('matchFound', handleMatchFound);
    socket.on('waiting', () => console.log('Waiting for match...'));

    return () => {
      socket.off('matchFound', handleMatchFound);
      socket.off('waiting');
    };
  }, [socket, onMatch]);

  const startMatching = () => {
    setSearching(true);
    socket.emit('findMatch', { targetLanguage });
  };

  const cancelMatching = () => {
    setSearching(false);
    socket.emit('cancelMatch');
  };

  return (
    <div className="language-match">
      <h2>Find Language Partner</h2>
      
      <div className="language-selection">
        <label>
          I want to practice:
          <select 
            value={targetLanguage}
            onChange={(e) => setTargetLanguage(e.target.value)}
            disabled={searching}
          >
            {user.learningLanguages.map(lang => (
              <option key={lang} value={lang}>{lang}</option>
            ))}
          </select>
        </label>
      </div>

      {!searching ? (
        <button onClick={startMatching} className="start-matching">
          Start Matching
        </button>
      ) : (
        <div className="searching">
          <div className="spinner"></div>
          <p>Searching for partner...</p>
          <button onClick={cancelMatching}>Cancel</button>
        </div>
      )}
    </div>
  );
};

export default LanguageMatch;