import { Link } from 'react-router-dom';
import Button from '../ui/Button';

/**
 * Reusable page header component
 * @param {string} title - Page title
 * @param {string} description - Page description
 * @param {object} action - Action button config { label, to, onClick, variant }
 * @param {ReactNode} children - Additional header content
 */
const PageHeader = ({ title, description, action, children }) => {
  return (
    <div className="mb-8">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex-1">
          <h1 className="text-3xl font-bold text-gray-900">{title}</h1>
          {description && <p className="mt-2 text-gray-600">{description}</p>}
        </div>
        <div className="flex items-center space-x-2">
          {children}
          {action && (
            <>
              {action.to ? (
                <Link to={action.to}>
                  <Button variant={action.variant || 'primary'} size={action.size || 'md'}>
                    {action.label}
                  </Button>
                </Link>
              ) : (
                <Button
                  variant={action.variant || 'primary'}
                  size={action.size || 'md'}
                  onClick={action.onClick}
                >
                  {action.label}
                </Button>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default PageHeader;

