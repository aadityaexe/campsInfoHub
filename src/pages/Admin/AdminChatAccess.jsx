import { useEffect, useMemo, useState } from 'react';
import Card from '../../components/ui/Card';
import PageHeader from '../../components/common/PageHeader';
import LoadingWrapper from '../../components/common/LoadingWrapper';
import ErrorAlert from '../../components/common/ErrorAlert';
import Button from '../../components/ui/Button';
import ChatWindow from '../../components/chat/ChatWindow';
import { useChatRooms } from '../../hooks/useChatRooms';
import { usersAPI, chatAPI } from '../../api/api';
import { USER_ROLES } from '../../utils/constants';
import { getItemId } from '../../utils/helpers';

const AdminChatAccess = () => {
  const { rooms, loading: roomsLoading, error: roomsError, refetch } = useChatRooms();
  const [users, setUsers] = useState({ teachers: [], students: [] });
  const [usersLoading, setUsersLoading] = useState(true);
  const [usersError, setUsersError] = useState('');
  const [activeRoomId, setActiveRoomId] = useState(null);
  const [creatingRoom, setCreatingRoom] = useState(false);

  useEffect(() => {
    if (!activeRoomId && rooms.length > 0) {
      setActiveRoomId(getItemId(rooms[0]));
    }
  }, [rooms, activeRoomId]);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setUsersLoading(true);
        const response = await usersAPI.getAll();
        const data = response.data || [];
        const teachers = data.filter((user) => user.role === USER_ROLES.TEACHER);
        const students = data.filter((user) => user.role === USER_ROLES.STUDENT);
        setUsers({ teachers, students });
        setUsersError('');
      } catch (err) {
        setUsersError(err.response?.data?.message || 'Failed to load users');
      } finally {
        setUsersLoading(false);
      }
    };

    fetchUsers();
  }, []);

  const activeRoom = useMemo(() => {
    if (!activeRoomId) return null;
    return rooms.find((room) => getItemId(room) === activeRoomId) || null;
  }, [rooms, activeRoomId]);

  const startChatWithUser = async (userId) => {
    if (!userId) return;
    try {
      setCreatingRoom(true);
      const response = await chatAPI.createRoom([userId]);
      const room = response.data;
      await refetch();
      setActiveRoomId(getItemId(room));
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to open chat');
    } finally {
      setCreatingRoom(false);
    }
  };

  const renderUserList = (title, list) => (
    <Card className="space-y-3">
      <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
      {list.length === 0 ? (
        <p className="text-sm text-gray-500">No users found.</p>
      ) : (
        <ul className="space-y-2">
          {list.map((user) => (
            <li
              key={user._id || user.id}
              className="flex items-center justify-between bg-gray-50 border border-gray-200 rounded-lg px-3 py-2"
            >
              <div>
                <p className="text-sm font-medium text-gray-900">{user.name}</p>
                <p className="text-xs text-gray-500">{user.email}</p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => startChatWithUser(user._id || user.id)}
                disabled={creatingRoom}
              >
                {creatingRoom ? 'Opening...' : 'Open Chat'}
              </Button>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );

  const renderRoomsList = () => (
    <Card>
      <h3 className="text-lg font-semibold text-gray-900 mb-3">Active Conversations</h3>
      {rooms.length === 0 ? (
        <p className="text-sm text-gray-500">No conversations yet. Start a chat from the list above.</p>
      ) : (
        <ul className="space-y-2">
          {rooms.map((room) => {
            const roomId = getItemId(room);
            const displayName = getRoomDisplayName(room);
            const isActive = roomId === activeRoomId;
            return (
              <li key={roomId}>
                <button
                  onClick={() => setActiveRoomId(roomId)}
                  className={`w-full text-left px-3 py-2 rounded-lg border transition-colors ${
                    isActive
                      ? 'bg-primary-50 border-primary-200 text-primary-700'
                      : 'bg-white border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  <p className="text-sm font-medium">{displayName}</p>
                  {room.courseName && (
                    <p className="text-xs text-gray-500">{room.courseName}</p>
                  )}
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </Card>
  );

  return (
    <div className="container-custom py-8 space-y-6">
      <PageHeader
        title="Admin Chat Access"
        description="Start conversations with any student or teacher and manage ongoing discussions"
      />

      <ErrorAlert
        message={roomsError || usersError}
        onDismiss={() => {
          if (usersError) setUsersError('');
          if (roomsError) refetch();
        }}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="space-y-4">
          <LoadingWrapper loading={usersLoading}>
            {renderUserList('Teachers', users.teachers)}
            {renderUserList('Students', users.students)}
          </LoadingWrapper>
        </div>
        <div className="space-y-4">
          <LoadingWrapper loading={roomsLoading}>{renderRoomsList()}</LoadingWrapper>
        </div>
        <div className="lg:col-span-2 lg:col-start-2">
          <Card className="h-[70vh] flex flex-col">
            <h3 className="text-lg font-semibold text-gray-900 px-4 pt-4">
              {activeRoom ? getRoomDisplayName(activeRoom) : 'Select a conversation'}
            </h3>
            <div className="flex-1 mt-4 border-t border-gray-200">
              {activeRoom ? (
                <div className="h-full">
                  <ChatWindow roomId={activeRoomId} room={activeRoom} />
                </div>
              ) : (
                <div className="h-full flex items-center justify-center text-gray-500">
                  Choose a chat from the left to start messaging.
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

const getRoomDisplayName = (room) => {
  if (!room) return 'Chat';
  if (room.type === 'course_group') {
    return room.courseName || room.courseCode || 'Course Chat';
  }
  if (room.type === 'course_private') {
    return `${room.courseName || room.courseCode || 'Course'} • Private`;
  }
  const otherParticipant = room.participantsInfo?.find(
    (participant) => participant.role === USER_ROLES.STUDENT || participant.role === USER_ROLES.TEACHER
  );
  return otherParticipant?.name || 'Private Chat';
};

export default AdminChatAccess;


