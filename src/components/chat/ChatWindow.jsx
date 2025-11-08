import { useAuth } from '../../hooks/useAuth';
import { useMessages } from '../../hooks/useMessages';
import MessageList from './MessageList';
import MessageInput from './MessageInput';
import LoadingWrapper from '../common/LoadingWrapper';
import ErrorAlert from '../common/ErrorAlert';

/**
 * ChatWindow component - Main chat interface
 * @param {string} roomId - ID of the active chat room
 * @param {object} room - Room object with details
 */
const ChatWindow = ({ roomId, room }) => {
  const { user } = useAuth();
  const { messages, loading, error, sendMessage } = useMessages(roomId);

  const handleSendMessage = async (payload) => {
    try {
      await sendMessage(payload);
    } catch (err) {
      console.error('Failed to send message:', err);
    }
  };

  // Get room display name
  const getRoomDisplayName = () => {
    if (!room) return 'Select a chat';
    
    if (room.type === 'course_group') {
      return `${room.courseName || room.courseCode || 'Course Chat'}`;
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

  // Get room participants list
  const getParticipantsList = () => {
    if (!room || !room.participantsInfo) return [];
    return room.participantsInfo;
  };

  if (!roomId) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gray-50">
        <div className="text-center text-gray-500">
          <p className="text-xl mb-2">💬</p>
          <p>Select a chat to start messaging</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-white">
      {/* Chat Header */}
      <div className="border-b border-gray-200 p-4 bg-gray-50">
        <h2 className="text-lg font-semibold text-gray-900">{getRoomDisplayName()}</h2>
        {room?.type === 'course_group' && (
          <p className="text-sm text-gray-600 mt-1">
            Course Group Chat • {getParticipantsList().length} participants
          </p>
        )}
        {room?.type === 'private' && (
          <p className="text-sm text-gray-600 mt-1">Private Chat</p>
        )}
        {room?.type === 'course_private' && (
          <p className="text-sm text-gray-600 mt-1">Course Private Chat</p>
        )}
      </div>

      {/* Error Alert */}
      {error && (
        <div className="px-4 pt-4">
          <ErrorAlert message={error} />
        </div>
      )}

      {/* Messages List */}
      <LoadingWrapper loading={loading && messages.length === 0} fullScreen={false}>
        <MessageList messages={messages} loading={loading} />
      </LoadingWrapper>

      {/* Message Input */}
      <MessageInput onSend={handleSendMessage} disabled={loading} />
    </div>
  );
};

export default ChatWindow;

