import Card from '../ui/Card';

/**
 * Reusable error alert component
 * @param {string} message - Error message to display
 * @param {Function} onDismiss - Optional dismiss handler
 */
const ErrorAlert = ({ message, onDismiss }) => {
  if (!message) return null;

  return (
    <Card className="mb-6 bg-red-50 border-red-200">
      <div className="flex items-center justify-between">
        <p className="text-red-700">{message}</p>
        {onDismiss && (
          <button
            onClick={onDismiss}
            className="ml-4 text-red-700 hover:text-red-900"
            aria-label="Dismiss error"
          >
            ×
          </button>
        )}
      </div>
    </Card>
  );
};

export default ErrorAlert;

