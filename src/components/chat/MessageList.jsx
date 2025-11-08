import { useEffect, useRef } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { formatDateTime } from '../../utils/helpers';
import { describeAttachmentType } from '../../utils/file';

/**
 * MessageList component - Displays messages in a chat room
 * @param {Array} messages - Array of message objects
 * @param {boolean} loading - Loading state
 */
const MessageList = ({ messages = [], loading = false }) => {
  const { user } = useAuth();
  const messagesEndRef = useRef(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  if (loading && messages.length === 0) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-gray-500">Loading messages...</div>
      </div>
    );
  }

  if (messages.length === 0) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center text-gray-500">
          <p className="text-lg mb-2">No messages yet</p>
          <p className="text-sm">Start the conversation!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4">
      {messages.map((message) => {
        const isOwnMessage = (message.senderId === (user?._id || user?.id));
        
        return (
          <div
            key={message._id || message.id}
            className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                isOwnMessage
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-200 text-gray-900'
              }`}
            >
              {!isOwnMessage && (
                <div className="text-xs font-semibold mb-1 opacity-80">
                  {message.senderName || 'Unknown'}
                </div>
              )}
              {message.content && (
                <div className="text-sm whitespace-pre-wrap break-words">
                  {message.content}
                </div>
              )}
              {message.attachments?.length > 0 && (
                <div className="mt-2 space-y-2">
                  {message.attachments.map((attachment) => (
                    <div key={attachment.id} className="bg-white/80 rounded-md overflow-hidden border border-white/30">
                      {attachment.type?.includes('image') ? (
                        <a
                          href={attachment.url}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <img
                            src={attachment.url}
                            alt={attachment.name}
                            className="w-full max-h-48 object-cover"
                          />
                        </a>
                      ) : (
                        <a
                          href={attachment.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={`${
                            isOwnMessage ? 'text-primary-700' : 'text-primary-600'
                          } text-sm underline block px-3 py-2`}
                        >
                          📄 {attachment.name} ({describeAttachmentType(attachment.type)})
                        </a>
                      )}
                    </div>
                  ))}
                </div>
              )}
              <div
                className={`text-xs mt-1 ${
                  isOwnMessage ? 'text-primary-100' : 'text-gray-500'
                }`}
              >
                {formatDateTime(message.timestamp || message.createdAt)}
              </div>
            </div>
          </div>
        );
      })}
      <div ref={messagesEndRef} />
    </div>
  );
};

export default MessageList;

