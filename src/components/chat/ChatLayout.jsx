import { useState, useEffect } from 'react';
import { useChatRooms } from '../../hooks/useChatRooms';
import ChatSidebar from './ChatSidebar';
import ChatWindow from './ChatWindow';
import LoadingWrapper from '../common/LoadingWrapper';
import ErrorAlert from '../common/ErrorAlert';
import { getItemId } from '../../utils/helpers';

/**
 * ChatLayout component - Main chat interface layout
 * Combines sidebar and chat window
 */
const ChatLayout = () => {
  const { rooms, organizedRooms, loading, error, refetch } = useChatRooms();
  const [activeRoomId, setActiveRoomId] = useState(null);
  const [activeRoom, setActiveRoom] = useState(null);

  // Set first room as active when rooms load
  useEffect(() => {
    if (rooms.length > 0 && !activeRoomId) {
      const firstRoom = rooms[0];
      const firstRoomId = getItemId(firstRoom);
      setActiveRoomId(firstRoomId);
      setActiveRoom(firstRoom);
    }
  }, [rooms, activeRoomId]);

  // Update active room when activeRoomId changes
  useEffect(() => {
    if (activeRoomId) {
      const room = rooms.find((r) => getItemId(r) === activeRoomId);
      setActiveRoom(room || null);
    } else {
      setActiveRoom(null);
    }
  }, [activeRoomId, rooms]);

  const handleRoomSelect = (room) => {
    const roomId = getItemId(room);
    setActiveRoomId(roomId);
    setActiveRoom(room);
  };

  return (
    <div className="flex h-full bg-gray-50">
      <LoadingWrapper loading={loading} fullScreen={false}>
        <div className="flex flex-1 overflow-hidden">
          {/* Sidebar */}
          <ChatSidebar
            rooms={rooms}
            organizedRooms={organizedRooms}
            activeRoomId={activeRoomId}
            onRoomSelect={handleRoomSelect}
            loading={loading}
          />

          {/* Chat Window */}
          <div className="flex-1 flex flex-col min-w-0">
            {error && (
              <div className="p-4">
                <ErrorAlert message={error} onDismiss={() => refetch()} />
              </div>
            )}
            <ChatWindow roomId={activeRoomId} room={activeRoom} />
          </div>
        </div>
      </LoadingWrapper>
    </div>
  );
};

export default ChatLayout;

