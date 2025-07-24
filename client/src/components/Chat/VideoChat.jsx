import React, { useEffect, useRef, useState } from 'react';
import Peer from 'peerjs';
import { useSocket } from '../../context/SocketContext';
import { useAuth } from '../../context/AuthContext';

const VideoChat = ({ partner, onEnd }) => {
  const { user } = useAuth();
  const socket = useSocket();
  const [localStream, setLocalStream] = useState(null);
  const [remoteStream, setRemoteStream] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  
  const localVideoRef = useRef();
  const remoteVideoRef = useRef();
  const peerRef = useRef();

  useEffect(() => {
    const initializeMedia = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true
        });
        setLocalStream(stream);
        localVideoRef.current.srcObject = stream;

        const peer = new Peer(user.id);
        peerRef.current = peer;

        peer.on('call', (call) => {
          call.answer(stream);
          call.on('stream', (remoteStream) => {
            setRemoteStream(remoteStream);
            remoteVideoRef.current.srcObject = remoteStream;
          });
        });

        // Connect to partner
        if (partner) {
          const call = peer.call(partner.id, stream);
          call.on('stream', (remoteStream) => {
            setRemoteStream(remoteStream);
            remoteVideoRef.current.srcObject = remoteStream;
          });
        }
      } catch (error) {
        console.error('Error accessing media devices:', error);
      }
    };

    initializeMedia();

    return () => {
      if (localStream) {
        localStream.getTracks().forEach(track => track.stop());
      }
      if (peerRef.current) {
        peerRef.current.destroy();
      }
    };
  }, [partner, user.id]);

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/ai/translate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          text: inputMessage,
          targetLanguage: partner.nativeLanguage
        })
      });

      const { translation } = await response.json();

      socket.emit('chatMessage', {
        to: partner.id,
        content: inputMessage,
        translation
      });

      setMessages(prev => [...prev, {
        sender: user.id,
        content: inputMessage,
        translation
      }]);

      setInputMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  return (
    <div className="video-chat-container">
      <div className="video-grid">
        <div className="video-box">
          <video ref={localVideoRef} autoPlay muted playsInline />
          <span>You</span>
        </div>
        <div className="video-box">
          <video ref={remoteVideoRef} autoPlay playsInline />
          <span>{partner?.username || 'Partner'}</span>
        </div>
      </div>

      <div className="chat-section">
        <div className="messages">
          {messages.map((msg, idx) => (
            <div key={idx} className={`message ${msg.sender === user.id ? 'sent' : 'received'}`}>
              <p>{msg.content}</p>
              <p className="translation">{msg.translation}</p>
            </div>
          ))}
        </div>

        <div className="input-section">
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            placeholder="Type your message..."
          />
          <button onClick={handleSendMessage}>Send</button>
        </div>
      </div>

      <button className="end-call" onClick={onEnd}>End Call</button>
    </div>
  );
};

export default VideoChat;