import Button from '../ui/Button';
import { Link } from 'react-router-dom';

/**
 * Reusable empty state component
 * @param {string} title - Empty state title
 * @param {string} message - Empty state message
 * @param {object} action - Action button config
 */
const EmptyState = ({ title = 'No data available', message, action }) => {
  return (
    <div className="text-center py-12">
      <div className="text-6xl mb-4">📭</div>
      <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
      {message && <p className="text-gray-600 mb-6">{message}</p>}
      {action && (
        <>
          {action.to ? (
            <Link to={action.to}>
              <Button variant={action.variant || 'primary'}>{action.label}</Button>
            </Link>
          ) : (
            <Button variant={action.variant || 'primary'} onClick={action.onClick}>
              {action.label}
            </Button>
          )}
        </>
      )}
    </div>
  );
};

export default EmptyState;

