import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { ROLE_ROUTES } from "../utils/constants";
import ProtectedRoute from "./ProtectedRoute";

// Auth Pages
import Login from "../pages/Auth/Login";
import Register from "../pages/Auth/Register";

// Dashboard Pages
import AdminDashboard from "../pages/Dashboards/AdminDashboard";
import TeacherDashboard from "../pages/Dashboards/TeacherDashboard";
import StudentDashboard from "../pages/Dashboards/StudentDashboard";
import CRDashboard from "../pages/Dashboards/CRDashboard";
import AlumniDashboard from "../pages/Dashboards/AlumniDashboard";

// Notices
import NoticesList from "../pages/Notices/NoticesList";
import CreateNotice from "../pages/Notices/CreateNotice";
import NoticeDetails from "../pages/Notices/NoticeDetails";
// Courses
import CoursesList from "../pages/Courses/CoursesList";
import CourseDetails from "../pages/Courses/CourseDetails";

// Assignments
import StudentAssignments from "../pages/Assignments/StudentAssignments";
import TeacherAssignments from "../pages/Assignments/TeacherAssignments";

// Attendance
import MarkAttendance from "../pages/Attendance/MarkAttendance";
import AttendanceRecords from "../pages/Attendance/AttendanceRecords";
import MyAttendance from "../pages/Attendance/MyAttendance";

// Lost & Found
import LostFoundList from "../pages/LostFound/LostFoundList";
import ReportItem from "../pages/LostFound/ReportItem";
import LostFoundDetail from "../pages/LostFound/LostFoundDetail";

// Admin Pages
import ManageUsers from "../pages/Admin/ManageUsers";
import ManageNotices from "../pages/Admin/ManageNotices";
import ManageCourses from "../pages/Admin/ManageCourses";
import ManageLostFound from "../pages/Admin/ManageLostFound";
import AdminChatAccess from "../pages/Admin/AdminChatAccess";

// Student Pages
import StudentCourses from "../pages/Student/StudentCourses";
import StudentNotices from "../pages/Student/StudentNotices";
import MyDocuments from "../pages/Student/MyDocuments";

// Teacher Pages
import TeacherCourses from "../pages/Teacher/TeacherCourses";

// Alumni Pages
import AlumniNetwork from "../pages/Alumni/AlumniNetwork";

// Messages
import MessagesPage from "../pages/Messages/MessagesPage";

const AppRoutes = () => {
  const { user, isAuthenticated } = useAuth();

  /**
   * Get default route based on user role
   * Redirects authenticated users to their role-specific dashboard
   */
  const getDefaultRoute = () => {
    if (!isAuthenticated) return "/login";
    return ROLE_ROUTES[user?.role] || "/login";
  };

  return (
    <Routes>
      {/* Public Routes */}
      <Route
        path="/login"
        element={
          isAuthenticated ? (
            <Navigate to={getDefaultRoute()} replace />
          ) : (
            <Login />
          )
        }
      />
      <Route
        path="/register"
        element={
          isAuthenticated ? (
            <Navigate to={getDefaultRoute()} replace />
          ) : (
            <Register />
          )
        }
      />

      {/* Root redirect */}
      <Route path="/" element={<Navigate to={getDefaultRoute()} replace />} />

      {/* Admin Routes */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute role="admin">
            <AdminDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/users"
        element={
          <ProtectedRoute role="admin">
            <ManageUsers />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/notices"
        element={
          <ProtectedRoute role="admin">
            <ManageNotices />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/courses"
        element={
          <ProtectedRoute role="admin">
            <ManageCourses />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/lost-found"
        element={
          <ProtectedRoute role="admin">
            <ManageLostFound />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/chats"
        element={
          <ProtectedRoute role="admin">
            <AdminChatAccess />
          </ProtectedRoute>
        }
      />

      {/* Teacher Routes */}
      <Route
        path="/teacher"
        element={
          <ProtectedRoute role="teacher">
            <TeacherDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/teacher/courses"
        element={
          <ProtectedRoute role="teacher">
            <TeacherCourses />
          </ProtectedRoute>
        }
      />
      <Route
        path="/teacher/assignments"
        element={
          <ProtectedRoute role="teacher">
            <TeacherAssignments />
          </ProtectedRoute>
        }
      />

      {/* Student Routes */}
      <Route
        path="/student"
        element={
          <ProtectedRoute role="student">
            <StudentDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/student/courses"
        element={
          <ProtectedRoute role="student">
            <StudentCourses />
          </ProtectedRoute>
        }
      />
      <Route
        path="/student/assignments"
        element={
          <ProtectedRoute role="student">
            <StudentAssignments />
          </ProtectedRoute>
        }
      />
      <Route
        path="/student/notices"
        element={
          <ProtectedRoute role="student">
            <StudentNotices />
          </ProtectedRoute>
        }
      />
      <Route
        path="/student/attendance"
        element={
          <ProtectedRoute role="student">
            <MyAttendance />
          </ProtectedRoute>
        }
      />
      <Route
        path="/student/documents"
        element={
          <ProtectedRoute role="student">
            <MyDocuments />
          </ProtectedRoute>
        }
      />

      {/* CR Routes */}
      <Route
        path="/cr"
        element={
          <ProtectedRoute role="cr">
            <CRDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/cr/attendance"
        element={
          <ProtectedRoute role="cr">
            <MarkAttendance />
          </ProtectedRoute>
        }
      />

      {/* Alumni Routes */}
      <Route
        path="/alumni"
        element={
          <ProtectedRoute role="alumni">
            <AlumniDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/alumni/network"
        element={
          <ProtectedRoute role="alumni">
            <AlumniNetwork />
          </ProtectedRoute>
        }
      />

      {/* Shared Routes */}
      <Route
        path="/notices"
        element={
          <ProtectedRoute>
            <NoticesList />
          </ProtectedRoute>
        }
      />

      <Route
        path="/notices/create"
        element={
          <ProtectedRoute>
            <CreateNotice />
          </ProtectedRoute>
        }
      />

      <Route
        path="/notices/:id"
        element={
          <ProtectedRoute>
            <NoticeDetails />
          </ProtectedRoute>
        }
      />

      <Route
        path="/courses"
        element={
          <ProtectedRoute>
            <CoursesList />
          </ProtectedRoute>
        }
      />
      <Route
        path="/courses/:id"
        element={
          <ProtectedRoute>
            <CourseDetails />
          </ProtectedRoute>
        }
      />
      <Route
        path="/lost-found"
        element={
          <ProtectedRoute>
            <LostFoundList />
          </ProtectedRoute>
        }
      />
      <Route
        path="/lost-found/report"
        element={
          <ProtectedRoute>
            <ReportItem />
          </ProtectedRoute>
        }
      />
      <Route
        path="/lost-found/:id"
        element={
          <ProtectedRoute>
            <LostFoundDetail />
          </ProtectedRoute>
        }
      />
      <Route
        path="/lost-found/:id/edit"
        element={
          <ProtectedRoute>
            <ReportItem />
          </ProtectedRoute>
        }
      />
      <Route
        path="/attendance/records"
        element={
          <ProtectedRoute>
            <AttendanceRecords />
          </ProtectedRoute>
        }
      />

      {/* Messages */}
      <Route
        path="/messages"
        element={
          <ProtectedRoute>
            <MessagesPage />
          </ProtectedRoute>
        }
      />

      {/* 404 */}
      <Route path="*" element={<Navigate to={getDefaultRoute()} replace />} />
    </Routes>
  );
};

export default AppRoutes;
