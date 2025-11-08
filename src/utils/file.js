import { generateId } from './helpers';

export const DOCUMENT_FILE_TYPES = ['application/pdf', 'image/jpeg', 'image/png'];

export const readFileAsDataUrl = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

export const formatFileSize = (bytes) => {
  if (!bytes) return '0 B';
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  const size = bytes / Math.pow(1024, i);
  return `${size.toFixed(size > 9 ? 0 : 1)} ${sizes[i]}`;
};

export const toAttachment = async (file, { prefix = 'file' } = {}) => ({
  id: generateId(prefix),
  name: file.name,
  type: file.type,
  size: file.size,
  url: await readFileAsDataUrl(file),
});

export const filesToAttachments = async (files, options = {}) => {
  const list = Array.from(files || []);
  return Promise.all(list.map((file) => toAttachment(file, options)));
};

export const isFileTypeAllowed = (file, allowedTypes = DOCUMENT_FILE_TYPES) =>
  allowedTypes.includes(file.type);

export const isFileSizeValid = (file, maxFileSizeMB = 10) =>
  file.size <= maxFileSizeMB * 1024 * 1024;

export const describeAttachmentType = (type) =>
  type?.includes('pdf') ? 'PDF Document' : 'Image';


