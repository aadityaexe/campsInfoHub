import { useState, useEffect } from 'react';
import { chatAPI } from '../api/api';
import { useAuth } from './useAuth';

/**
 * Custom hook for managing chat rooms
 * @returns {object} { rooms, loading, error, refetch }
 */
export const useChatRooms = () => {
  const { user } = useAuth();
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchRooms = async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const response = await chatAPI.getRooms();
      setRooms(response.data || []);
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || 'Failed to fetch chat rooms';
      setError(errorMessage);
      console.error('Error fetching chat rooms:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRooms();
  }, [user]);

  /**
   * Organize rooms by type
   */
  const organizedRooms = {
    private: rooms.filter((room) => room.type === 'private'),
    courseGroup: rooms.filter((room) => room.type === 'course_group'),
    coursePrivate: rooms.filter((room) => room.type === 'course_private'),
  };

  return {
    rooms,
    organizedRooms,
    loading,
    error,
    refetch: fetchRooms,
  };
};

