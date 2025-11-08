import { useState, useEffect, useRef } from 'react';
import { chatAPI } from '../api/api';
import { useAuth } from './useAuth';

/**
 * Custom hook for managing messages in a chat room
 * @param {string} roomId - ID of the chat room
 * @param {boolean} autoRefresh - Whether to auto-refresh messages (default: true)
 * @returns {object} { messages, loading, error, sendMessage, refetch }
 */
export const useMessages = (roomId, autoRefresh = true) => {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const intervalRef = useRef(null);

  const fetchMessages = async () => {
    if (!roomId || !user) {
      setLoading(false);
      return;
    }

    try {
      setError(null);
      const response = await chatAPI.getMessages(roomId);
      setMessages(response.data || []);
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || 'Failed to fetch messages';
      setError(errorMessage);
      console.error('Error fetching messages:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (roomId) {
      setLoading(true);
      fetchMessages();
    } else {
      setMessages([]);
      setLoading(false);
    }

    // Cleanup on unmount or room change
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [roomId, user]);

  // Auto-refresh messages every 3 seconds
  useEffect(() => {
    if (autoRefresh && roomId && user) {
      intervalRef.current = setInterval(() => {
        fetchMessages();
      }, 3000);

      return () => {
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
        }
      };
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roomId, autoRefresh, user]);

  const sendMessage = async ({ text = '', attachments = [] } = {}) => {
    if (!roomId) {
      return null;
    }

    const trimmedText = text.trim();
    if (!trimmedText && attachments.length === 0) {
      return null;
    }

    try {
      const response = await chatAPI.sendMessage(roomId, {
        content: trimmedText,
        attachments,
      });
      const newMessage = response.data;
      
      // Optimistically add message to list
      setMessages((prev) => [...prev, newMessage]);
      
      // Refresh to get latest messages
      setTimeout(() => {
        fetchMessages();
      }, 500);
      
      return newMessage;
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || 'Failed to send message';
      setError(errorMessage);
      throw err;
    }
  };

  return {
    messages,
    loading,
    error,
    sendMessage,
    refetch: fetchMessages,
  };
};

