import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import NotificationDropdown from "./NotificationDropdown";

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <nav className="bg-white w-screen fixed z-50 shadow-md border-b border-gray-200">
      <div className="container-custom">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="text-2xl font-bold text-primary-600">
              Smart Campus
            </Link>
          </div>

          <div className="flex items-center space-x-4">
            {user ? (
              <>
                <NotificationDropdown />
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-700">
                    {user.name || user.email}
                  </span>
                  <span className="px-2 py-1 text-xs font-medium bg-primary-100 text-primary-800 rounded-full">
                    {user.role}
                  </span>
                </div>
                <button
                  onClick={handleLogout}
                  className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  Logout
                </button>
              </>
            ) : (
              <Link
                to="/login"
                className="px-4 py-2 text-sm font-medium text-primary-600 hover:text-primary-700"
              >
                Login
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
