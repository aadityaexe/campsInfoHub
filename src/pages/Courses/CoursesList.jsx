import { useState, useEffect } from "react";
import { coursesAPI } from "../../api/api";
import { useAuth } from "../../hooks/useAuth";
import { getItemId, formatDate } from "../../utils/helpers";
import { USER_ROLES } from "../../utils/constants";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import PageHeader from "../../components/common/PageHeader";
import LoadingWrapper from "../../components/common/LoadingWrapper";
import ErrorAlert from "../../components/common/ErrorAlert";
import EmptyState from "../../components/common/EmptyState";
import { Link } from "react-router-dom";

const CoursesList = () => {
  const { user } = useAuth();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      const response = await coursesAPI.getAll();
      setCourses(response.data || []);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to fetch courses");
    } finally {
      setLoading(false);
    }
  };

  /**
   * Handle course enrollment
   */
  const handleEnroll = async (courseId) => {
    try {
      const response = await coursesAPI.enroll(courseId);
      const chatRoom = response.data?.chatRoom;
      const courseName = response.data?.course?.name;
      let message = "Successfully enrolled in course";
      if (courseName) {
        message = `Successfully enrolled in ${courseName}`;
      }
      if (chatRoom) {
        message += "\nA private chat with your instructor is now available in Messages.";
      }
      alert(message);
      fetchCourses();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to enroll");
    }
  };

  return (
    <LoadingWrapper loading={loading}>
      <div className="container-custom py-8">
        <PageHeader
          title="Courses"
          description="Browse available courses"
          action={
            user?.role === USER_ROLES.ADMIN
              ? {
                  label: "Create Course",
                  to: "/admin/courses",
                  variant: "primary",
                }
              : null
          }
        />

        <ErrorAlert message={error} onDismiss={() => setError("")} />

        {courses.length === 0 ? (
          <Card>
            <EmptyState
              title="No courses available"
              message="No courses have been added yet"
            />
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses.map((course) => {
              const courseId = getItemId(course);
              return (
                <Card key={courseId}>
                  <h2 className="text-xl font-bold text-gray-900 mb-2">
                    {course.name}
                  </h2>
                  <p className="text-gray-600 mb-4">{course.description}</p>
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-gray-500">
                      <p>Code: {course.code}</p>
                      {course.instructor && (
                        <p>Instructor: {course.instructor}</p>
                      )}
                    </div>
                    <div className="flex space-x-2">
                      <Link to={`/courses/${courseId}`}>
                        <Button variant="outline" size="sm">
                          View
                        </Button>
                      </Link>
                      {user?.role === USER_ROLES.STUDENT && (
                        <Button
                          variant="primary"
                          size="sm"
                          onClick={() => handleEnroll(courseId)}
                        >
                          Enroll
                        </Button>
                      )}
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </LoadingWrapper>
  );
};

export default CoursesList;
