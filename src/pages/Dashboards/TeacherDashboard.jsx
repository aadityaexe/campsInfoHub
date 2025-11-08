import { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { coursesAPI, assignmentsAPI, noticesAPI } from '../../api/api';
import Card from '../../components/ui/Card';
import Loader from '../../components/ui/Loader';
import Button from '../../components/ui/Button';
import { Link } from 'react-router-dom';

const TeacherDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    courses: 0,
    assignments: 0,
    pendingSubmissions: 0,
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
        courses: courses.length,
        assignments: assignments.length,
        pendingSubmissions: assignments.filter(a => !a.graded).length,
      });

      setRecentNotices(noticesRes.data?.slice(0, 5) || []);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
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
    <div className="container-custom py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          Welcome, {user?.name || 'Teacher'}!
        </h1>
        <p className="mt-2 text-gray-600">Manage your courses and assignments</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">My Courses</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{stats.courses}</p>
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
              <p className="text-3xl font-bold text-gray-900 mt-2">{stats.assignments}</p>
            </div>
            <div className="p-3 bg-accent-100 rounded-full">
              <span className="text-2xl">📝</span>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Pending Grading</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{stats.pendingSubmissions}</p>
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Link to="/teacher/courses">
            <Button variant="outline" className="w-full">View Courses</Button>
          </Link>
          <Link to="/teacher/assignments">
            <Button variant="outline" className="w-full">Manage Assignments</Button>
          </Link>
        </div>
      </Card>

      {/* Recent Notices */}
      <Card>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-900">Recent Notices</h2>
          <Link to="/notices">
            <Button variant="primary" size="sm">View All</Button>
          </Link>
        </div>
        {recentNotices.length === 0 ? (
          <p className="text-gray-500">No notices yet</p>
        ) : (
          <div className="space-y-4">
            {recentNotices.map((notice) => (
              <div key={notice._id || notice.id} className="border-b border-gray-200 pb-4 last:border-0">
                <h3 className="font-semibold text-gray-900">{notice.title}</h3>
                <p className="text-sm text-gray-600 mt-1">{notice.content?.substring(0, 100)}...</p>
                <p className="text-xs text-gray-500 mt-2">
                  {new Date(notice.createdAt || notice.date).toLocaleDateString()}
                </p>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
};

export default TeacherDashboard;

