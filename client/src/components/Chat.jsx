import { useSocket, useSocketEvent } from '../context/SocketContext';

function Chat() {
  const { isConnected, sendMessage } = useSocket();

  useSocketEvent('chatMessage', (message) => {
    // Handle incoming message
    console.log('New message:', message);
  });

  return (
    <div>
      <p>Status: {isConnected ? 'Connected' : 'Disconnected'}</p>
      <button onClick={() => sendMessage('roomId', 'Hello!')}>
        Send Message
      </button>
    </div>
  );
}