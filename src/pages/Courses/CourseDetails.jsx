import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { coursesAPI } from "../../api/api";
import Card from "../../components/ui/Card";
import Loader from "../../components/ui/Loader";
import Button from "../../components/ui/Button";
import { useAuth } from "../../hooks/useAuth";

const CourseDetails = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchCourse();
  }, [id]);

  const fetchCourse = async () => {
    try {
      setLoading(true);
      const response = await coursesAPI.getById(id);
      setCourse(response.data);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to fetch course details");
    } finally {
      setLoading(false);
    }
  };

  const handleEnroll = async () => {
    try {
      await coursesAPI.enroll(id);
      alert("Successfully enrolled in course");
      fetchCourse();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to enroll");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader size="lg" />
      </div>
    );
  }

  if (error || !course) {
    return (
      <div className="container-custom py-8 pt-20">
        <Card className="bg-red-50 border-red-200">
          <p className="text-red-700">{error || "Course not found"}</p>
          <Link to="/courses">
            <Button variant="primary" className="mt-4">
              Back to Courses
            </Button>
          </Link>
        </Card>
      </div>
    );
  }

  return (
    <div className="container-custom py-8">
      <div className="mb-6">
        <Link to="/courses">
          <Button variant="secondary" size="sm">
            ← Back to Courses
          </Button>
        </Link>
      </div>

      <Card>
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {course.name}
          </h1>
          <p className="text-lg text-gray-600">{course.code}</p>
        </div>

        <div className="mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Description
          </h2>
          <p className="text-gray-700">{course.description}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          {course.instructor && (
            <div>
              <p className="text-sm font-medium text-gray-600">Instructor</p>
              <p className="text-lg text-gray-900">{course.instructor}</p>
            </div>
          )}
          {course.credits && (
            <div>
              <p className="text-sm font-medium text-gray-600">Credits</p>
              <p className="text-lg text-gray-900">{course.credits}</p>
            </div>
          )}
          {course.schedule && (
            <div>
              <p className="text-sm font-medium text-gray-600">Schedule</p>
              <p className="text-lg text-gray-900">{course.schedule}</p>
            </div>
          )}
        </div>

        {user?.role === "student" && (
          <Button variant="primary" onClick={handleEnroll}>
            Enroll in Course
          </Button>
        )}
      </Card>
    </div>
  );
};

export default CourseDetails;
