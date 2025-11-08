import { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { getItemId } from '../../utils/helpers';

/**
 * ChatSidebar component - Lists all available chat rooms organized by type
 * @param {Array} rooms - Array of all chat rooms
 * @param {object} organizedRooms - Rooms organized by type
 * @param {string} activeRoomId - Currently active room ID
 * @param {Function} onRoomSelect - Callback when a room is selected
 * @param {boolean} loading - Loading state
 */
const ChatSidebar = ({
  rooms = [],
  organizedRooms = {},
  activeRoomId,
  onRoomSelect,
  loading = false,
}) => {
  const { user } = useAuth();
  const [expandedSections, setExpandedSections] = useState({
    private: true,
    courseGroup: true,
    coursePrivate: true,
  });

  const toggleSection = (section) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const getRoomDisplayName = (room) => {
    if (room.type === 'course_group') {
      return room.courseName || room.courseCode || 'Course Chat';
    }
    
    if (room.type === 'course_private') {
      return `${room.courseName || room.courseCode || 'Course'} - Private`;
    }
    
    // Private chat - show other participant's name
    if (room.participantsInfo && room.participantsInfo.length > 0) {
      const otherParticipant = room.participantsInfo.find(
        (p) => p.id !== (user?._id || user?.id)
      );
      return otherParticipant?.name || 'Private Chat';
    }
    
    return 'Private Chat';
  };

  const renderRoomItem = (room) => {
    const roomId = getItemId(room);
    const isActive = roomId === activeRoomId;
    
    return (
      <button
        key={roomId}
        onClick={() => onRoomSelect(room)}
        className={`w-full text-left px-4 py-3 rounded-lg transition-colors ${
          isActive
            ? 'bg-primary-100 text-primary-700 font-medium'
            : 'hover:bg-gray-100 text-gray-700'
        }`}
      >
        <div className="font-medium">{getRoomDisplayName(room)}</div>
        {room.type === 'course_group' && (
          <div className="text-xs text-gray-500 mt-1">
            {room.participantsInfo?.length || 0} participants
          </div>
        )}
      </button>
    );
  };

  if (loading) {
    return (
      <div className="w-64 bg-gray-50 border-r border-gray-200 p-4">
        <div className="text-gray-500">Loading chats...</div>
      </div>
    );
  }

  return (
    <div className="w-64 bg-gray-50 border-r border-gray-200 flex flex-col flex-shrink-0">
      <div className="p-4 border-b border-gray-200">
        <h2 className="text-lg font-bold text-gray-900">Messages</h2>
      </div>

      <div className="flex-1 overflow-y-auto">
        {/* Private Chats */}
        {organizedRooms.private && organizedRooms.private.length > 0 && (
          <div className="p-2">
            <button
              onClick={() => toggleSection('private')}
              className="w-full flex items-center justify-between px-2 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-100 rounded-lg"
            >
              <span>💬 Private Chats</span>
              <span>{expandedSections.private ? '▼' : '▶'}</span>
            </button>
            {expandedSections.private && (
              <div className="mt-1 space-y-1">
                {organizedRooms.private.map(renderRoomItem)}
              </div>
            )}
          </div>
        )}

        {/* Course Group Chats */}
        {organizedRooms.courseGroup && organizedRooms.courseGroup.length > 0 && (
          <div className="p-2">
            <button
              onClick={() => toggleSection('courseGroup')}
              className="w-full flex items-center justify-between px-2 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-100 rounded-lg"
            >
              <span>👥 Course Group Chats</span>
              <span>{expandedSections.courseGroup ? '▼' : '▶'}</span>
            </button>
            {expandedSections.courseGroup && (
              <div className="mt-1 space-y-1">
                {organizedRooms.courseGroup.map(renderRoomItem)}
              </div>
            )}
          </div>
        )}

        {/* Course Private Chats */}
        {organizedRooms.coursePrivate && organizedRooms.coursePrivate.length > 0 && (
          <div className="p-2">
            <button
              onClick={() => toggleSection('coursePrivate')}
              className="w-full flex items-center justify-between px-2 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-100 rounded-lg"
            >
              <span>📚 Course Private Chats</span>
              <span>{expandedSections.coursePrivate ? '▼' : '▶'}</span>
            </button>
            {expandedSections.coursePrivate && (
              <div className="mt-1 space-y-1">
                {organizedRooms.coursePrivate.map(renderRoomItem)}
              </div>
            )}
          </div>
        )}

        {/* Empty State */}
        {rooms.length === 0 && (
          <div className="p-4 text-center text-gray-500">
            <p className="text-sm">No chats available</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatSidebar;

