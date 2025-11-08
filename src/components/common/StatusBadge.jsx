import { getStatusBadgeClasses } from '../../utils/helpers';

/**
 * Reusable status badge component
 * @param {string} status - Status value
 * @param {string} label - Custom label (optional)
 */
const StatusBadge = ({ status, label }) => {
  const classes = getStatusBadgeClasses(status);
  const displayLabel = label || status?.charAt(0).toUpperCase() + status?.slice(1) || 'Unknown';

  return (
    <span className={`px-2 py-1 text-xs font-medium rounded-full ${classes}`}>
      {displayLabel}
    </span>
  );
};

export default StatusBadge;

