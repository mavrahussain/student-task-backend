import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import io from 'socket.io-client'; // Import socket.io-client
import { useNavigate } from 'react-router-dom';
import './MessagingSystem.css';

const MessagingSystem = () => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [allUsers, setAllUsers] = useState([]); // All potential chat partners
  const [selectedRecipient, setSelectedRecipient] = useState(null); // The user currently chatting with

  const navigate = useNavigate();
  const socket = useRef(null); // Use useRef for the socket instance
  const messagesEndRef = useRef(null); // Ref for scrolling to the latest message

  // Scroll to the latest message
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Establish Socket.IO connection and handle messages
  useEffect(() => {
    // Connect to Socket.IO server
    socket.current = io('http://localhost:5000'); // Connect to your backend Socket.IO server

    socket.current.on('receiveMessage', (message) => {
      // Only add message if it's part of the current conversation
      if (
        (message.sender === selectedRecipient?._id && message.recipient === currentUser?.id) ||
        (message.sender === currentUser?.id && message.recipient === selectedRecipient?._id)
      ) {
        setMessages((prevMessages) => [...prevMessages, message]);
      }
    });

    return () => {
      if (socket.current) {
        socket.current.disconnect();
      }
    };
  }, [currentUser, selectedRecipient]);

  // Fetch current user and all potential chat partners
  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem(localStorage.getItem('role')); // 'student' or 'admin'
    const role = localStorage.getItem('role');

    if (!token || !userData || !role) {
      navigate('/login'); // Redirect to login if not authenticated
      return;
    }

    const parsedUser = JSON.parse(userData);
    setCurrentUser({ ...parsedUser, role }); // Add role to currentUser object
    console.log('MessagingSystem: Current User:', { ...parsedUser, role });

    // Fetch all users to chat with (opposite role)
    const fetchAllUsers = async () => {
      try {
        const usersResponse = await axios.get(
          `http://localhost:5000/api/${role === 'admin' ? 'students' : 'admin'}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setAllUsers(usersResponse.data);
        console.log('MessagingSystem: All Users:', usersResponse.data);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching all users:', err);
        setError('Failed to fetch users.');
        setLoading(false);
      }
    };

    fetchAllUsers();
  }, [navigate]);

  // Fetch messages when a recipient is selected
  useEffect(() => {
    if (selectedRecipient && currentUser) {
      fetchConversation(selectedRecipient._id);
    } else if (!selectedRecipient && allUsers.length > 0) {
      // Automatically select the first user if no recipient is selected and users exist
      setSelectedRecipient(allUsers[0]);
    }
  }, [selectedRecipient, currentUser, allUsers]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const fetchConversation = async (otherUserId) => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(
        `http://localhost:5000/api/messages/${otherUserId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setMessages(response.data);
      setLoading(false);
      // Mark messages as read after fetching conversation
      await markMessagesAsRead(otherUserId);
    } catch (err) {
      console.error('Error fetching conversation:', err);
      setError('Failed to fetch messages.');
      setLoading(false);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedRecipient) return;

    try {
      const token = localStorage.getItem('token');
      const messagePayload = {
        recipientId: selectedRecipient._id,
        recipientModel: selectedRecipient.role === 'student' ? 'Student' : 'Admin',
        content: newMessage
      };

      console.log('MessagingSystem: Sending Message Payload:', messagePayload);

      const response = await axios.post(
        'http://localhost:5000/api/messages',
        messagePayload,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      // Emit message via Socket.IO for real-time update
      if (socket.current) {
        socket.current.emit('sendMessage', {
          ...response.data, // Use the message saved in DB (with ID and timestamp)
          sender: currentUser.id, // Ensure sender ID is correct for frontend display
          onModel: currentUser.role === 'student' ? 'Student' : 'Admin',
          recipient: selectedRecipient._id,
          onRecipientModel: selectedRecipient.role === 'student' ? 'Student' : 'Admin',
          timestamp: new Date()
        });
      }

      setNewMessage('');
      // No need to fetchMessages() here, Socket.IO will handle real-time update
    } catch (err) {
      console.error('Error sending message:', err);
      setError(err.response?.data?.message || 'Failed to send message.');
    }
  };

  const markMessagesAsRead = async (otherUserId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.post(
        'http://localhost:5000/api/messages/read',
        { otherUserId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      // Update the UI to reflect messages as read (optional, can be done via socket if needed)
    } catch (err) {
      console.error('Error marking messages as read:', err);
    }
  };

  const handleDownloadChatHistory = async () => {
    if (!selectedRecipient) {
      alert('Please select a conversation to download history.');
      return;
    }
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(
        `http://localhost:5000/api/messages/${selectedRecipient._id}`,
        { 
          headers: { Authorization: `Bearer ${token}` },
          responseType: 'blob' // Important for downloading files
        }
      );
      const blob = new Blob([JSON.stringify(messages, null, 2)], { type: 'application/json' }); // Use current messages state
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `chat_history_with_${selectedRecipient.name || selectedRecipient.email}.json`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Error downloading chat history:', err);
      setError('Failed to download chat history.');
    }
  };

  if (loading) return <div className="loading">Loading...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="messaging-container">
      <div className="sidebar">
        <h2>{currentUser?.role === 'admin' ? 'Students' : 'Admins'}</h2>
        <ul className="user-list">
          {allUsers.map((user) => (
            <li
              key={user._id}
              className={selectedRecipient?._id === user._id ? 'active' : ''}
              onClick={() => setSelectedRecipient(user)}
            >
              {user.name || user.email || user.studentId}
            </li>
          ))}
        </ul>
      </div>
      <div className="chat-area">
        <div className="chat-header">
          <h2>{selectedRecipient ? `Chat with ${selectedRecipient.name || selectedRecipient.email || selectedRecipient.studentId}` : 'Select a user to chat'}</h2>
          {selectedRecipient && (
            <button onClick={handleDownloadChatHistory} className="download-button">
              Download Chat History
            </button>
          )}
        </div>
        <div className="messages-list">
          {!selectedRecipient ? (
            <div className="no-messages">Select a user from the sidebar to start chatting.</div>
          ) : messages.length === 0 ? (
            <div className="no-messages">No messages yet. Start the conversation!</div>
          ) : (
            <ul>
              {messages.map((message, index) => (
                <li
                  key={message._id || index} // Use message._id if available, fallback to index
                  className={`message-item ${message.sender === currentUser?.id ? 'sent' : 'received'}`}
                >
                  <div className="message-content">{message.content}</div>
                  <div className="message-timestamp">
                    {new Date(message.timestamp).toLocaleString()}
                  </div>
                </li>
              ))}
              <div ref={messagesEndRef} />
            </ul>
          )}
        </div>

        {selectedRecipient && (
          <form onSubmit={handleSendMessage} className="message-input-form">
            <input
              type="text"
              placeholder="Type your message..."
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              required
            />
            <button type="submit">Send</button>
          </form>
        )}
      </div>
    </div>
  );
};

export default MessagingSystem; 