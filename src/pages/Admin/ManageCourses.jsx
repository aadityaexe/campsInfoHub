import { useState, useEffect } from "react";
import { coursesAPI } from "../../api/api";
import Card from "../../components/ui/Card";
import Loader from "../../components/ui/Loader";
import Button from "../../components/ui/Button";
import Table from "../../components/ui/Table";

const ManageCourses = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    code: "",
    description: "",
    instructor: "",
    credits: "",
  });

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

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await coursesAPI.create(formData);
      setShowCreateForm(false);
      setFormData({
        name: "",
        code: "",
        description: "",
        instructor: "",
        credits: "",
      });
      fetchCourses();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to create course");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this course?")) return;

    try {
      await coursesAPI.delete(id);
      setCourses(courses.filter((c) => (c._id || c.id) !== id));
    } catch (err) {
      alert(err.response?.data?.message || "Failed to delete course");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader size="lg" />
      </div>
    );
  }

  const headers = ["Name", "Code", "Instructor", "Credits", "Actions"];

  const renderRow = (course) => (
    <tr key={course._id || course.id}>
      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
        {course.name}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
        {course.code}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
        {course.instructor || "N/A"}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
        {course.credits || "N/A"}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm">
        <Button
          variant="danger"
          size="sm"
          onClick={() => handleDelete(course._id || course.id)}
        >
          Delete
        </Button>
      </td>
    </tr>
  );

  return (
    <div className="container-custom py-8 pt-20">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Manage Courses</h1>
          <p className="mt-2 text-gray-600">Create and manage courses</p>
        </div>
        <Button
          variant="primary"
          onClick={() => setShowCreateForm(!showCreateForm)}
        >
          {showCreateForm ? "Cancel" : "Create Course"}
        </Button>
      </div>

      {error && (
        <Card className="mb-6 bg-red-50 border-red-200">
          <p className="text-red-700">{error}</p>
        </Card>
      )}

      {showCreateForm && (
        <Card className="mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            Create Course
          </h2>
          <form onSubmit={handleCreate} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Course Name
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Course Code
              </label>
              <input
                type="text"
                required
                value={formData.code}
                onChange={(e) =>
                  setFormData({ ...formData, code: e.target.value })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                required
                rows={3}
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Instructor
                </label>
                <input
                  type="text"
                  value={formData.instructor}
                  onChange={(e) =>
                    setFormData({ ...formData, instructor: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Credits
                </label>
                <input
                  type="number"
                  value={formData.credits}
                  onChange={(e) =>
                    setFormData({ ...formData, credits: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                />
              </div>
            </div>
            <Button type="submit" variant="primary">
              Create
            </Button>
          </form>
        </Card>
      )}

      <Card>
        <Table headers={headers} data={courses} renderRow={renderRow} />
      </Card>
    </div>
  );
};

export default ManageCourses;
