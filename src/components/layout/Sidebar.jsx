import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { USER_ROLES } from "../../utils/constants";
import { useState, useMemo } from "react";

const Sidebar = () => {
  const { user } = useAuth();
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);

  /**
   * Menu items configuration by role
   * Memoized to prevent unnecessary re-renders
   */
  const menuItems = useMemo(
    () => ({
      [USER_ROLES.ADMIN]: [
        { path: "/admin", label: "Dashboard", icon: "📊" },
        { path: "/admin/users", label: "Manage Users", icon: "👥" },
        { path: "/admin/notices", label: "Manage Notices", icon: "📢" },
        { path: "/admin/courses", label: "Manage Courses", icon: "📚" },
        { path: "/admin/lost-found", label: "Lost & Found", icon: "🔍" },
        { path: "/admin/chats", label: "Chat Access", icon: "💬" },
        { path: "/messages", label: "Messages", icon: "💬" },
      ],

      [USER_ROLES.TEACHER]: [
        { path: "/teacher", label: "Dashboard", icon: "📊" },
        { path: "/teacher/courses", label: "My Courses", icon: "📚" },
        { path: "/teacher/assignments", label: "Assignments", icon: "📝" },
        { path: "/notices", label: "Notices", icon: "📢" },
        { path: "/lost-found", label: "Lost & Found", icon: "🔍" },
        { path: "/lost-found/report", label: "Report Item", icon: "➕" },
        { path: "/messages", label: "Messages", icon: "💬" },
      ],

      [USER_ROLES.STUDENT]: [
        { path: "/student", label: "Dashboard", icon: "📊" },
        { path: "/student/courses", label: "My Courses", icon: "📚" },
        { path: "/student/assignments", label: "Assignments", icon: "📝" },
        { path: "/student/attendance", label: "Attendance", icon: "✅" },
        { path: "/student/documents", label: "My Documents", icon: "🗂️" },
        { path: "/student/notices", label: "Notices", icon: "📢" },
        { path: "/lost-found", label: "Lost & Found", icon: "🔍" },
        { path: "/lost-found/report", label: "Report Item", icon: "➕" },
        { path: "/messages", label: "Messages", icon: "💬" },
      ],

      [USER_ROLES.CR]: [
        { path: "/cr", label: "Dashboard", icon: "📊" },
        { path: "/cr/attendance", label: "Mark Attendance", icon: "✅" },
        { path: "/notices", label: "Notices", icon: "📢" },
        { path: "/lost-found", label: "Lost & Found", icon: "🔍" },
        { path: "/lost-found/report", label: "Report Item", icon: "➕" },
        { path: "/messages", label: "Messages", icon: "💬" },
      ],

      [USER_ROLES.ALUMNI]: [
        { path: "/alumni", label: "Dashboard", icon: "📊" },
        { path: "/alumni/network", label: "Network", icon: "🌐" },
        { path: "/notices", label: "Notices", icon: "📢" },
        { path: "/lost-found", label: "Lost & Found", icon: "🔍" },
        { path: "/lost-found/report", label: "Report Item", icon: "➕" },
        { path: "/messages", label: "Messages", icon: "💬" },
      ],
    }),
    []
  );

  const items = useMemo(() => {
    return user ? menuItems[user.role] || [] : [];
  }, [user, menuItems]);

  const isActive = (path) => {
    return (
      location.pathname === path || location.pathname.startsWith(path + "/")
    );
  };

  return (
    <>
      {/* Mobile menu button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 rounded-md bg-white shadow-md"
      >
        <svg
          className="h-6 w-6"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          {isOpen ? (
            <path d="M6 18L18 6M6 6l12 12" />
          ) : (
            <path d="M4 6h16M4 12h16M4 18h16" />
          )}
        </svg>
      </button>

      {/* Sidebar */}
      <aside
        className={`fixed top-16 left-0 z-50 h-screen w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        } lg:translate-x-0`}
      >
        <div className="h-full flex flex-col pt-16 lg:pt-0">
          <div className="flex-1 overflow-y-auto py-4">
            <nav className="space-y-1 px-3">
              {items.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setIsOpen(false)}
                  className={`flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
                    isActive(item.path)
                      ? "bg-primary-100 text-primary-700"
                      : "text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  <span className="mr-3 text-lg">{item.icon}</span>
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>
        </div>
      </aside>

      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-30"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  );
};

export default Sidebar;
