import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { FaEnvelope } from 'react-icons/fa';
import io from 'socket.io-client';

const NotificationBadge = () => {
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchUnreadCount = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      setUnreadCount(0);
      return;
    }

    try {
      const response = await axios.get('/api/messages/unread/count', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUnreadCount(response.data.count);
    } catch (error) {
      console.error('Error fetching unread message count:', error);
      setUnreadCount(0);
    }
  };

  useEffect(() => {
    fetchUnreadCount(); // Initial fetch

    // Set up Socket.IO for real-time updates
    const socket = io('http://localhost:5000'); // Connect to your backend Socket.IO server

    socket.on('newMessage', () => {
      fetchUnreadCount(); // Fetch count again when a new message is received
    });

    socket.on('messageRead', () => {
      fetchUnreadCount(); // Fetch count again when messages are marked as read
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  return (
    <li className="nav-item">
      <Link to="/messages" className="nav-link position-relative">
        <FaEnvelope /> Messages
        {unreadCount > 0 && (
          <span className="badge rounded-pill bg-danger position-absolute top-0 start-100 translate-middle">
            {unreadCount}
            <span className="visually-hidden">unread messages</span>
          </span>
        )}
      </Link>
    </li>
  );
};

export default NotificationBadge; 