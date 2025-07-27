import React, { useState, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  selectCurrentChat,
  sendMessage,
  setTypingStatus,
  translateMessage
} from '../../store/slices/chatSlice';
import styles from './ChatWindow.module.css';

const ChatWindow = ({ chatId }) => {
  const dispatch = useDispatch();
  const currentChat = useSelector(selectCurrentChat);
  const [messageInput, setMessageInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  // Auto scroll to bottom when new messages arrive
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [currentChat.messages]);

  // Typing indicator logic
  useEffect(() => {
    let typingTimer;
    if (isTyping) {
      dispatch(setTypingStatus({ chatId, isTyping: true }));
      typingTimer = setTimeout(() => {
        setIsTyping(false);
        dispatch(setTypingStatus({ chatId, isTyping: false }));
      }, 2000);
    }
    return () => clearTimeout(typingTimer);
  }, [isTyping, chatId, dispatch]);

  const handleInputChange = (e) => {
    setMessageInput(e.target.value);
    setIsTyping(true);
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!messageInput.trim()) return;

    try {
      await dispatch(sendMessage({
        chatId,
        message: messageInput,
        targetLanguage: currentChat.partner.nativeLanguage
      })).unwrap();
      setMessageInput('');
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  };

  const formatMessageTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className={styles.chatWindow}>
      <div className={styles.chatHeader}>
        <div className={styles.partnerInfo}>
          <img 
            src={currentChat.partner?.avatar} 
            alt={currentChat.partner?.username}
            className={styles.avatar}
          />
          <div>
            <h3>{currentChat.partner?.username}</h3>
            <span className={styles.status}>
              {currentChat.status === 'typing' ? 'typing...' : currentChat.status}
            </span>
          </div>
        </div>
      </div>

      <div className={styles.messageContainer}>
        {currentChat.messages.map((message) => (
          <div 
            key={message.id}
            className={`${styles.message} ${
              message.senderId === currentChat.partner.id ? styles.received : styles.sent
            }`}
          >
            <div className={styles.messageContent}>
              <p>{message.content}</p>
              {message.translation && (
                <p className={styles.translation}>{message.translation}</p>
              )}
              <span className={styles.timestamp}>
                {formatMessageTime(message.timestamp)}
              </span>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSendMessage} className={styles.inputForm}>
        <input
          type="text"
          value={messageInput}
          onChange={handleInputChange}
          placeholder="Type your message..."
          className={styles.messageInput}
        />
        <button type="submit" className={styles.sendButton}>
          Send
        </button>
      </form>
    </div>
  );
};

export default ChatWindow;