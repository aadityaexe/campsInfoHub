import { useState, useEffect } from "react";
import { assignmentsAPI, coursesAPI } from "../../api/api";
import { useNotifications } from "../../hooks/useNotifications";
import Card from "../../components/ui/Card";
import Loader from "../../components/ui/Loader";
import Button from "../../components/ui/Button";
import Table from "../../components/ui/Table";
import {
  DOCUMENT_FILE_TYPES,
  describeAttachmentType,
  filesToAttachments,
  isFileSizeValid,
  isFileTypeAllowed,
} from "../../utils/file";

const MAX_FILE_SIZE_MB = 10;

const TeacherAssignments = () => {
  const { addNotification } = useNotifications();
  const [assignments, setAssignments] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    courseId: "",
    dueDate: "",
    attachments: [],
  });

  useEffect(() => {
    fetchAssignments();
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      const response = await coursesAPI.getAll();
      setCourses(response.data || []);
    } catch (err) {
      console.error("Failed to fetch courses:", err);
    }
  };

  const fetchAssignments = async () => {
    try {
      setLoading(true);
      const response = await assignmentsAPI.getAll();
      setAssignments(response.data || []);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to fetch assignments");
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      const selectedCourse = courses.find(
        (c) => (c._id || c.id) === formData.courseId
      );
      const payload = {
        ...formData,
        attachments: formData.attachments,
      };
      const response = await assignmentsAPI.create(payload);

      // Add notification for students
      if (selectedCourse) {
        addNotification({
          type: "assignment",
          title: "New Assignment Uploaded",
          message: `${formData.title} has been uploaded for ${selectedCourse.name}`,
          courseId: formData.courseId,
          courseName: selectedCourse.name,
        });
      }

      setShowCreateForm(false);
      setFormData({
        title: "",
        description: "",
        courseId: "",
        dueDate: "",
        attachments: [],
      });
      fetchAssignments();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to create assignment");
    }
  };

  const handleFileChange = async (event) => {
    const files = Array.from(event.target.files || []);
    if (files.length === 0) {
      return;
    }

    for (const file of files) {
      if (!isFileTypeAllowed(file, DOCUMENT_FILE_TYPES)) {
        alert("Only PDF, JPG, and PNG files are allowed.");
        return;
      }
      if (!isFileSizeValid(file, MAX_FILE_SIZE_MB)) {
        alert(`Files must be smaller than ${MAX_FILE_SIZE_MB} MB.`);
        return;
      }
    }

    try {
      const processed = await filesToAttachments(files, {
        prefix: "assignmentFile",
      });

      setFormData((prev) => ({
        ...prev,
        attachments: [...(prev.attachments || []), ...processed],
      }));
      // reset input so same file can be selected again if needed
      event.target.value = "";
    } catch (error) {
      console.error("Failed to process files", error);
      alert("Failed to process selected files. Please try again.");
    }
  };

  const handleRemoveAttachment = (attachmentId) => {
    setFormData((prev) => ({
      ...prev,
      attachments: prev.attachments.filter(
        (attachment) => attachment.id !== attachmentId
      ),
    }));
  };

  const handleViewSubmissions = async (assignmentId) => {
    try {
      const response = await assignmentsAPI.getSubmissions(assignmentId);
      const submissions = response.data || [];
      alert(`Total submissions: ${submissions.length}`);
    } catch (err) {
      alert(err.response?.data?.message || "Failed to fetch submissions");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader size="lg" />
      </div>
    );
  }

  const headers = [
    "Title",
    "Course",
    "Due Date",
    "Resources",
    "Submissions",
    "Actions",
  ];

  const renderRow = (assignment) => (
    <tr key={assignment._id || assignment.id}>
      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
        {assignment.title}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
        {assignment.courseName || assignment.course}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
        {assignment.dueDate
          ? new Date(assignment.dueDate).toLocaleDateString()
          : "N/A"}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm">
        {assignment.attachments?.length ? (
          <div className="space-y-1">
            {assignment.attachments.slice(0, 3).map((attachment) => (
              <a
                key={attachment.id}
                href={attachment.url}
                target="_blank"
                rel="noopener noreferrer"
                className="block text-primary-600 hover:text-primary-700 underline"
              >
                {attachment.name}
              </a>
            ))}
            {assignment.attachments.length > 3 && (
              <p className="text-xs text-gray-500">
                +{assignment.attachments.length - 3} more file(s)
              </p>
            )}
          </div>
        ) : (
          <span className="text-gray-400">No files</span>
        )}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
        {assignment.submissionCount || 0}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm">
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleViewSubmissions(assignment._id || assignment.id)}
        >
          View Submissions
        </Button>
      </td>
    </tr>
  );

  return (
    <div className="container-custom py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Assignments</h1>
          <p className="mt-2 text-gray-600">Manage course assignments</p>
        </div>
        <Button
          variant="primary"
          onClick={() => setShowCreateForm(!showCreateForm)}
        >
          {showCreateForm ? "Cancel" : "Create Assignment"}
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
            Create Assignment
          </h2>
          <form onSubmit={handleCreate} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Title
              </label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Course
              </label>
              <select
                required
                value={formData.courseId}
                onChange={(e) =>
                  setFormData({ ...formData, courseId: e.target.value })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
              >
                <option value="">Select a course</option>
                {courses.map((course) => (
                  <option
                    key={course._id || course.id}
                    value={course._id || course.id}
                  >
                    {course.name} ({course.code})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                required
                rows={4}
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Upload Resources (PDF, JPG, PNG)
              </label>
              <input
                type="file"
                accept=".pdf,image/jpeg,image/png"
                multiple
                onChange={handleFileChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
              />
              <p className="text-xs text-gray-500 mt-1">
                Maximum file size {MAX_FILE_SIZE_MB} MB per file.
              </p>
              {formData.attachments.length > 0 && (
                <div className="mt-3 space-y-2">
                  {formData.attachments.map((attachment) => (
                    <div
                      key={attachment.id}
                      className="flex items-center justify-between bg-gray-100 border border-gray-200 rounded-lg px-3 py-2"
                    >
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-gray-800 truncate">
                          {attachment.name}
                        </p>
                        <p className="text-xs text-gray-500">
                      {describeAttachmentType(attachment.type)}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveAttachment(attachment.id)}
                        className="text-xs text-red-600 hover:text-red-700"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Due Date
              </label>
              <input
                type="date"
                required
                value={formData.dueDate}
                onChange={(e) =>
                  setFormData({ ...formData, dueDate: e.target.value })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <Button type="submit" variant="primary">
              Create
            </Button>
          </form>
        </Card>
      )}

      <Card>
        <Table headers={headers} data={assignments} renderRow={renderRow} />
      </Card>
    </div>
  );
};

export default TeacherAssignments;
