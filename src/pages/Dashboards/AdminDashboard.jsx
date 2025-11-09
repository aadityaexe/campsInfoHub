import { useState, useEffect } from "react";
import { useAuth } from "../../hooks/useAuth";
import {
  noticesAPI,
  usersAPI,
  coursesAPI,
  lostFoundAPI,
  assignmentsAPI,
} from "../../api/api";
import Card from "../../components/ui/Card";
import Loader from "../../components/ui/Loader";
import Button from "../../components/ui/Button";
import { Link } from "react-router-dom";

const AdminDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    users: 0,
    notices: 0,
    courses: 0,
    lostFound: 0,
    pendingPosts: 0,
    assignments: 0,
  });
  const [recentNotices, setRecentNotices] = useState([]);
  const [recentLostFound, setRecentLostFound] = useState([]);
  const [recentAssignments, setRecentAssignments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [usersRes, noticesRes, coursesRes, lostFoundRes, assignmentsRes] =
        await Promise.all([
          usersAPI.getAll().catch(() => ({ data: [] })),
          noticesAPI.getAll().catch(() => ({ data: [] })),
          coursesAPI.getAll().catch(() => ({ data: [] })),
          lostFoundAPI.getAll().catch(() => ({ data: [] })),
          assignmentsAPI.getAll().catch(() => ({ data: [] })),
        ]);

      const lostFound = lostFoundRes.data || [];
      const pendingPosts = lostFound.filter(
        (item) => item.status === "pending"
      ).length;

      setStats({
        users: usersRes.data?.length || 0,
        notices: noticesRes.data?.length || 0,
        courses: coursesRes.data?.length || 0,
        lostFound: lostFound.length,
        pendingPosts,
        assignments: assignmentsRes.data?.length || 0,
      });

      setRecentNotices(noticesRes.data?.slice(0, 5) || []);
      setRecentLostFound(lostFound.slice(0, 5));
      setRecentAssignments(assignmentsRes.data?.slice(0, 5) || []);
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id) => {
    try {
      await lostFoundAPI.verify(id);
      fetchDashboardData();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to approve item");
    }
  };

  const handleReject = async (id) => {
    try {
      await lostFoundAPI.reject(id);
      fetchDashboardData();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to reject item");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader size="lg" />
      </div>
    );
  }

  return (
    <div className="container-custom py-8 pt-20">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          Welcome back, {user?.name || "Admin"}!
        </h1>
        <p className="mt-2 text-gray-600">
          Here's what's happening in your campus
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6 mb-8">
        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Users</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">
                {stats.users}
              </p>
            </div>
            <div className="p-3 bg-primary-100 rounded-full">
              <span className="text-2xl">👥</span>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Notices</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">
                {stats.notices}
              </p>
            </div>
            <div className="p-3 bg-accent-100 rounded-full">
              <span className="text-2xl">📢</span>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Courses</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">
                {stats.courses}
              </p>
            </div>
            <div className="p-3 bg-yellow-100 rounded-full">
              <span className="text-2xl">📚</span>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Lost & Found</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">
                {stats.lostFound}
              </p>
            </div>
            <div className="p-3 bg-purple-100 rounded-full">
              <span className="text-2xl">🔍</span>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Pending Posts</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">
                {stats.pendingPosts}
              </p>
            </div>
            <div className="p-3 bg-orange-100 rounded-full">
              <span className="text-2xl">⏳</span>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Assignments</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">
                {stats.assignments}
              </p>
            </div>
            <div className="p-3 bg-indigo-100 rounded-full">
              <span className="text-2xl">📝</span>
            </div>
          </div>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card className="mb-8">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Link to="/admin/users">
            <Button variant="outline" className="w-full">
              Manage Users
            </Button>
          </Link>
          <Link to="/admin/notices">
            <Button variant="outline" className="w-full">
              Manage Notices
            </Button>
          </Link>
          <Link to="/admin/courses">
            <Button variant="outline" className="w-full">
              Manage Courses
            </Button>
          </Link>
          <Link to="/admin/lost-found">
            <Button variant="outline" className="w-full">
              Lost & Found
            </Button>
          </Link>
        </div>
      </Card>

      {/* Recent Lost & Found Posts */}
      <Card className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-900">
            Recent Lost & Found Posts
          </h2>
          <Link to="/admin/lost-found">
            <Button variant="primary" size="sm">
              View All
            </Button>
          </Link>
        </div>
        {recentLostFound.length === 0 ? (
          <p className="text-gray-500">No posts yet</p>
        ) : (
          <div className="space-y-4">
            {recentLostFound.map((item) => (
              <div
                key={item._id || item.id}
                className="border-b border-gray-200 pb-4 last:border-0"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900">
                      {item.title}
                    </h3>
                    <p className="text-sm text-gray-600 mt-1">
                      {item.description?.substring(0, 80)}...
                    </p>
                    <div className="flex items-center space-x-2 mt-2">
                      <span
                        className={`px-2 py-1 text-xs font-medium rounded-full ${
                          item.status === "approved"
                            ? "bg-green-100 text-green-800"
                            : item.status === "rejected"
                            ? "bg-red-100 text-red-800"
                            : "bg-yellow-100 text-yellow-800"
                        }`}
                      >
                        {item.status === "approved"
                          ? "Approved"
                          : item.status === "rejected"
                          ? "Rejected"
                          : "Pending"}
                      </span>
                      <span className="text-xs text-gray-500">
                        {new Date(
                          item.date || item.createdAt
                        ).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  {item.status === "pending" && (
                    <div className="flex space-x-2 ml-4">
                      <Button
                        variant="accent"
                        size="sm"
                        onClick={() => handleApprove(item._id || item.id)}
                      >
                        Approve
                      </Button>
                      <Button
                        variant="danger"
                        size="sm"
                        onClick={() => handleReject(item._id || item.id)}
                      >
                        Reject
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Recent Assignments */}
      <Card className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-900">
            Recent Assignment Uploads
          </h2>
          <Link to="/teacher/assignments">
            <Button variant="primary" size="sm">
              View All
            </Button>
          </Link>
        </div>
        {recentAssignments.length === 0 ? (
          <p className="text-gray-500">No assignments yet</p>
        ) : (
          <div className="space-y-4">
            {recentAssignments.map((assignment) => (
              <div
                key={assignment._id || assignment.id}
                className="border-b border-gray-200 pb-4 last:border-0"
              >
                <h3 className="font-semibold text-gray-900">
                  {assignment.title}
                </h3>
                <p className="text-sm text-gray-600 mt-1">
                  Course: {assignment.courseName || assignment.course}
                </p>
                <p className="text-xs text-gray-500 mt-2">
                  Due:{" "}
                  {assignment.dueDate
                    ? new Date(assignment.dueDate).toLocaleDateString()
                    : "N/A"}
                </p>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Recent Notices */}
      <Card>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-900">Recent Notices</h2>
          <Link to="/admin/notices">
            <Button variant="primary" size="sm">
              View All
            </Button>
          </Link>
        </div>
        {recentNotices.length === 0 ? (
          <p className="text-gray-500">No notices yet</p>
        ) : (
          <div className="space-y-4">
            {recentNotices.map((notice) => (
              <div
                key={notice._id || notice.id}
                className="border-b border-gray-200 pb-4 last:border-0"
              >
                <h3 className="font-semibold text-gray-900">{notice.title}</h3>
                <p className="text-sm text-gray-600 mt-1">
                  {notice.content?.substring(0, 100)}...
                </p>
                <p className="text-xs text-gray-500 mt-2">
                  {new Date(
                    notice.createdAt || notice.date
                  ).toLocaleDateString()}
                </p>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
};

export default AdminDashboard;
