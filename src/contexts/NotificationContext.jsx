import { createContext, useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';

export const NotificationContext = createContext(null);

export const NotificationProvider = ({ children }) => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    if (!user) {
      setNotifications([]);
      return;
    }
    
    // Load notifications from localStorage
    const userId = user._id || user.id;
    const stored = localStorage.getItem(`notifications_${userId}`);
    if (stored) {
      try {
        setNotifications(JSON.parse(stored));
      } catch {
        setNotifications([]);
      }
    } else {
      // Initialize with some mock notifications
      const initialNotifications = [
        {
          id: 'notif1',
          type: 'assignment',
          title: 'New Assignment Uploaded',
          message: 'Prof. Michael Chen uploaded a new assignment: Calculus Problem Set 1',
          courseId: 'course2',
          courseName: 'Calculus I',
          read: false,
          createdAt: new Date().toISOString(),
        },
        {
          id: 'notif2',
          type: 'notice',
          title: 'New Notice',
          message: 'Welcome Back to Campus!',
          read: false,
          createdAt: new Date(Date.now() - 3600000).toISOString(),
        },
      ];
      setNotifications(initialNotifications);
      if (userId) {
        localStorage.setItem(
          `notifications_${userId}`,
          JSON.stringify(initialNotifications)
        );
      }
    }
  }, [user]);

  const addNotification = (notification) => {
    const newNotification = {
      id: `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      ...notification,
      read: false,
      createdAt: new Date().toISOString(),
    };
    setNotifications((prev) => {
      const updated = [newNotification, ...prev];
      if (user?._id || user?.id) {
        localStorage.setItem(
          `notifications_${user._id || user.id}`,
          JSON.stringify(updated)
        );
      }
      return updated;
    });
  };

  const markAsRead = (id) => {
    setNotifications((prev) => {
      const updated = prev.map((notif) =>
        notif.id === id ? { ...notif, read: true } : notif
      );
      if (user?._id || user?.id) {
        localStorage.setItem(
          `notifications_${user._id || user.id}`,
          JSON.stringify(updated)
        );
      }
      return updated;
    });
  };

  const markAllAsRead = () => {
    setNotifications((prev) => {
      const updated = prev.map((notif) => ({ ...notif, read: true }));
      if (user?._id || user?.id) {
        localStorage.setItem(
          `notifications_${user._id || user.id}`,
          JSON.stringify(updated)
        );
      }
      return updated;
    });
  };

  const deleteNotification = (id) => {
    setNotifications((prev) => {
      const updated = prev.filter((notif) => notif.id !== id);
      if (user?._id || user?.id) {
        localStorage.setItem(
          `notifications_${user._id || user.id}`,
          JSON.stringify(updated)
        );
      }
      return updated;
    });
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        addNotification,
        markAsRead,
        markAllAsRead,
        deleteNotification,
        unreadCount,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

