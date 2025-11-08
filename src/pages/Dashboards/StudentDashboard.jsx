import { useState, useEffect } from "react";
import { useAuth } from "../../hooks/useAuth";
import { coursesAPI, assignmentsAPI, noticesAPI } from "../../api/api";
import Card from "../../components/ui/Card";
import Loader from "../../components/ui/Loader";
import Button from "../../components/ui/Button";
import { Link } from "react-router-dom";
import ReportItem from "../../pages/LostFound/ReportItem";
const StudentDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    enrolledCourses: 0,
    assignments: 0,
    pendingAssignments: 0,
  });
  const [recentNotices, setRecentNotices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [coursesRes, assignmentsRes, noticesRes] = await Promise.all([
        coursesAPI.getAll().catch(() => ({ data: [] })),
        assignmentsAPI.getAll().catch(() => ({ data: [] })),
        noticesAPI.getAll().catch(() => ({ data: [] })),
      ]);

      const courses = coursesRes.data || [];
      const assignments = assignmentsRes.data || [];

      setStats({
        enrolledCourses: courses.length,
        assignments: assignments.length,
        pendingAssignments: assignments.filter((a) => !a.submitted).length,
      });

      setRecentNotices(noticesRes.data?.slice(0, 5) || []);
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setLoading(false);
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
          Welcome, {user?.name || "Student"}!
        </h1>
        <p className="mt-2 text-gray-600">
          Stay updated with your courses and assignments
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">
                Enrolled Courses
              </p>
              <p className="text-3xl font-bold text-gray-900 mt-2">
                {stats.enrolledCourses}
              </p>
            </div>
            <div className="p-3 bg-primary-100 rounded-full">
              <span className="text-2xl">📚</span>
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
            <div className="p-3 bg-accent-100 rounded-full">
              <span className="text-2xl">📝</span>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Pending</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">
                {stats.pendingAssignments}
              </p>
            </div>
            <div className="p-3 bg-yellow-100 rounded-full">
              <span className="text-2xl">⏳</span>
            </div>
          </div>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card className="mb-8">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link to="/student/courses">
            <Button variant="outline" className="w-full">
              My Courses
            </Button>
          </Link>
          <Link to="/student/assignments">
            <Button variant="outline" className="w-full">
              Assignments
            </Button>
          </Link>
          <Link to="/student/notices">
            <Button variant="outline" className="w-full">
              Notices
            </Button>
          </Link>
        </div>
      </Card>

      {/* Recent Notices */}
      <Card>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-900">Recent Notices</h2>
          <Link to="/student/notices">
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

      <ReportItem />
    </div>
  );
};

export default StudentDashboard;
