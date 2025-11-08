import { useState, useRef, useEffect } from 'react';
import Button from '../ui/Button';
import {
  DOCUMENT_FILE_TYPES,
  describeAttachmentType,
  filesToAttachments,
  isFileSizeValid,
  isFileTypeAllowed,
} from '../../utils/file';

const MAX_FILE_SIZE_MB = 10;

/**
 * MessageInput component - Input field for sending messages
 * @param {Function} onSend - Callback function when message is sent
 * @param {boolean} disabled - Whether input is disabled
 */
const MessageInput = ({ onSend, disabled = false }) => {
  const [message, setMessage] = useState('');
  const [attachments, setAttachments] = useState([]);
  const [error, setError] = useState('');
  const textareaRef = useRef(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [message]);

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (disabled) return;
    if (!message.trim() && attachments.length === 0) {
      setError('Add a message or attachment before sending.');
      return;
    }

    try {
      await onSend({ text: message, attachments });
      setMessage('');
      setAttachments([]);
      setError('');
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
    } catch (err) {
      console.error('Failed to send message', err);
      setError('Failed to send message. Please try again.');
    }
  };

  const handleKeyDown = (event) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      handleSubmit(event);
    }
  };

  const handleFileSelect = async (event) => {
    const files = Array.from(event.target.files || []);
    if (files.length === 0) {
      return;
    }

    for (const file of files) {
      if (!isFileTypeAllowed(file, DOCUMENT_FILE_TYPES)) {
        setError('Only PDF, JPG, and PNG files are allowed.');
        event.target.value = '';
        return;
      }
      if (!isFileSizeValid(file, MAX_FILE_SIZE_MB)) {
        setError(`Files must be smaller than ${MAX_FILE_SIZE_MB} MB.`);
        event.target.value = '';
        return;
      }
    }

    try {
      const processed = await filesToAttachments(files, { prefix: 'chatFile' });
      setAttachments((prev) => [...prev, ...processed]);
      setError('');
      event.target.value = '';
    } catch (fileError) {
      console.error('Failed to process attachments', fileError);
      setError('Failed to process selected files. Please try again.');
    }
  };

  const handleRemoveAttachment = (attachmentId) => {
    setAttachments((prev) => prev.filter((file) => file.id !== attachmentId));
  };

  return (
    <form onSubmit={handleSubmit} className="border-t border-gray-200 p-4 bg-white">
      <div className="flex flex-col space-y-3">
        {attachments.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {attachments.map((file) => (
              <div
                key={file.id}
                className="flex items-center space-x-2 bg-gray-100 border border-gray-200 rounded-full px-3 py-1"
              >
                <span className="text-xs text-gray-700">
                  {file.name} • {describeAttachmentType(file.type)}
                </span>
                <button
                  type="button"
                  onClick={() => handleRemoveAttachment(file.id)}
                  className="text-xs text-red-600 hover:text-red-700"
                  aria-label="Remove attachment"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        )}

        {error && (
          <p className="text-xs text-red-600">{error}</p>
        )}

        <div className="flex items-end space-x-2">
          <div className="flex items-center space-x-2">
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,image/jpeg,image/png"
              multiple
              onChange={handleFileSelect}
              className="hidden"
              disabled={disabled}
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
              disabled={disabled}
            >
              Attach
            </Button>
          </div>

          <div className="flex-1">
            <textarea
              ref={textareaRef}
              value={message}
              onChange={(event) => {
                setMessage(event.target.value);
                if (error) setError('');
              }}
              onKeyDown={handleKeyDown}
              placeholder="Type your message... (Enter to send, Shift+Enter for new line)"
              disabled={disabled}
              rows={1}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none disabled:bg-gray-100 disabled:cursor-not-allowed"
              style={{ minHeight: '44px', maxHeight: '140px' }}
            />
          </div>
          <Button
            type="submit"
            variant="primary"
            disabled={disabled || (!message.trim() && attachments.length === 0)}
            className="px-6"
          >
            Send
          </Button>
        </div>
      </div>
    </form>
  );
};

export default MessageInput;

