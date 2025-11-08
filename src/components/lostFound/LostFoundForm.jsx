import { useState, useMemo } from 'react';
import Button from '../ui/Button';
import Loader from '../ui/Loader';

const DEFAULT_FORM = {
  title: '',
  description: '',
  type: 'lost',
  location: '',
  date: new Date().toISOString().split('T')[0],
  attachments: [],
};

const ACCEPTED_TYPES = ['application/pdf', 'image/jpeg', 'image/png'];
const MAX_FILE_SIZE_MB = 10;

const formatBytes = (bytes) => {
  if (!bytes) return '0 B';
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  const size = bytes / Math.pow(1024, i);
  return `${size.toFixed(size > 9 ? 0 : 1)} ${sizes[i]}`;
};

const readFileAsDataUrl = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

const LostFoundForm = ({
  initialValues = DEFAULT_FORM,
  loading = false,
  onSubmit,
  onCancel,
  submitLabel = 'Submit Report',
}) => {
  const [formValues, setFormValues] = useState({
    ...DEFAULT_FORM,
    ...initialValues,
    attachments: initialValues.attachments || [],
  });
  const [errors, setErrors] = useState('');
  const [fileError, setFileError] = useState('');

  const isEditing = useMemo(() => Boolean(initialValues?._id || initialValues?.id), [initialValues]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormValues((prev) => ({
      ...prev,
      [name]: value,
    }));
    setErrors('');
  };

  const handleFileChange = async (event) => {
    const files = Array.from(event.target.files || []);
    if (files.length === 0) {
      return;
    }

    const allowedFiles = [];
    for (const file of files) {
      if (!ACCEPTED_TYPES.includes(file.type)) {
        setFileError('Only PDF, JPG, and PNG files are allowed.');
        return;
      }
      if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
        setFileError(`Files must be smaller than ${MAX_FILE_SIZE_MB} MB.`);
        return;
      }
      allowedFiles.push(file);
    }

    try {
      const processedFiles = await Promise.all(
        allowedFiles.map(async (file) => ({
          id: `${Date.now()}_${file.name}`,
          name: file.name,
          type: file.type,
          size: file.size,
          url: await readFileAsDataUrl(file),
        }))
      );

      setFormValues((prev) => ({
        ...prev,
        attachments: [...(prev.attachments || []), ...processedFiles],
      }));
      setFileError('');
    } catch (error) {
      console.error('Failed to process files', error);
      setFileError('Failed to process selected files. Please try again.');
    }
  };

  const handleRemoveAttachment = (attachmentId) => {
    setFormValues((prev) => ({
      ...prev,
      attachments: prev.attachments.filter((attachment) => attachment.id !== attachmentId),
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!formValues.title?.trim()) {
      setErrors('Title is required.');
      return;
    }

    if (!formValues.description?.trim()) {
      setErrors('Description is required.');
      return;
    }

    try {
      await onSubmit?.({ ...formValues });
      setErrors('');
    } catch (error) {
      setErrors(error?.message || 'Failed to submit. Please try again.');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {errors && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {errors}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2" htmlFor="type">
            Category
          </label>
          <select
            id="type"
            name="type"
            value={formValues.type}
            onChange={handleChange}
            disabled={loading}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 disabled:bg-gray-100"
          >
            <option value="lost">Lost</option>
            <option value="found">Found</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2" htmlFor="date">
            Date
          </label>
          <input
            id="date"
            name="date"
            type="date"
            value={formValues.date?.slice(0, 10) || ''}
            onChange={handleChange}
            disabled={loading}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 disabled:bg-gray-100"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2" htmlFor="title">
          Title
        </label>
        <input
          id="title"
          name="title"
          value={formValues.title}
          onChange={handleChange}
          disabled={loading}
          required
          placeholder="e.g., Lost iPhone 12"
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 disabled:bg-gray-100"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2" htmlFor="location">
          Location
        </label>
        <input
          id="location"
          name="location"
          value={formValues.location}
          onChange={handleChange}
          disabled={loading}
          placeholder="Where was it lost or found?"
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 disabled:bg-gray-100"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2" htmlFor="description">
          Description
        </label>
        <textarea
          id="description"
          name="description"
          value={formValues.description}
          onChange={handleChange}
          disabled={loading}
          required
          rows={5}
          placeholder="Describe the item in detail"
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 disabled:bg-gray-100"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2" htmlFor="attachments">
          Attachments (PDF, JPG, PNG)
        </label>
        <input
          id="attachments"
          name="attachments"
          type="file"
          accept=".pdf,image/jpeg,image/png"
          onChange={handleFileChange}
          disabled={loading}
          multiple
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 disabled:bg-gray-100"
        />
        <p className="text-xs text-gray-500 mt-1">Maximum file size {MAX_FILE_SIZE_MB} MB per file.</p>
        {fileError && <p className="text-xs text-red-600 mt-1">{fileError}</p>}

        {formValues.attachments?.length > 0 && (
          <div className="mt-4 space-y-2">
            {formValues.attachments.map((attachment) => (
              <div
                key={attachment.id}
                className="flex items-center justify-between bg-gray-100 border border-gray-200 rounded-lg px-3 py-2"
              >
                <div>
                  <p className="text-sm font-medium text-gray-800">{attachment.name}</p>
                  <p className="text-xs text-gray-500">
                    {attachment.type?.includes('pdf') ? 'PDF Document' : 'Image'} •{' '}
                    {formatBytes(attachment.size)}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => handleRemoveAttachment(attachment.id)}
                  className="text-xs text-red-600 hover:text-red-700"
                  disabled={loading}
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="flex items-center space-x-4">
        <Button type="submit" variant="primary" disabled={loading}>
          {loading ? <Loader size="sm" /> : submitLabel}
        </Button>
        {onCancel && (
          <Button type="button" variant="secondary" onClick={onCancel} disabled={loading}>
            Cancel
          </Button>
        )}
        {isEditing && (
          <p className="text-xs text-gray-500">Updating an item will notify moderators for re-verification.</p>
        )}
      </div>
    </form>
  );
};

export default LostFoundForm;

