import Loader from '../ui/Loader';
import Card from '../ui/Card';

/**
 * Wrapper component for loading states
 * @param {boolean} loading - Loading state
 * @param {ReactNode} children - Content to show when not loading
 * @param {string} size - Loader size (sm, md, lg)
 * @param {boolean} fullScreen - Show full screen loader
 */
const LoadingWrapper = ({ loading, children, size = 'lg', fullScreen = true }) => {
  if (loading) {
    if (fullScreen) {
      return (
        <div className="flex items-center justify-center min-h-screen">
          <Loader size={size} />
        </div>
      );
    }
    return (
      <div className="flex items-center justify-center py-12">
        <Loader size={size} />
      </div>
    );
  }

  return <>{children}</>;
};

export default LoadingWrapper;

