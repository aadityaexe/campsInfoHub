// src/pages/Assignments/TeacherAssignments.jsx
import { useEffect, useState } from "react";
import { mockAssignmentsAPI, mockCoursesAPI } from "../../api/assignmentsApi"; // ensure your index re-exports
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

import TeacherAssignmentSubmissions from "./TeacherAssignmentSubmissions";

const MAX_FILE_SIZE_MB = 10;

const StatPill = ({ tone = "default", children }) => {
  const tones = {
    default: "bg-gray-100 text-gray-800",
    green: "bg-green-100 text-green-800",
    red: "bg-red-100 text-red-800",
    amber: "bg-amber-100 text-amber-800",
    blue: "bg-blue-100 text-blue-800",
  };
  return (
    <span
      className={`inline-block px-2 py-0.5 rounded-full text-xs ${
        tones[tone] || tones.default
      }`}
    >
      {children}
    </span>
  );
};

const TeacherAssignments = () => {
  const { addNotification } = useNotifications();

  const [assignments, setAssignments] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [showCreateForm, setShowCreateForm] = useState(false);
  const [openAssignment, setOpenAssignment] = useState(null);
  const [openCourse, setOpenCourse] = useState(null);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    courseId: "",
    dueDate: "",
    attachments: [],
  });

  useEffect(() => {
    loadAll();
  }, []);

  const loadAll = async () => {
    try {
      setLoading(true);
      const [asRes, csRes] = await Promise.all([
        mockAssignmentsAPI.getAll(),
        mockCoursesAPI.getAll(),
      ]);
      const asg = asRes.data || [];
      const cs = csRes.data || [];
      setCourses(cs);

      // enrich each assignment with students + similarity report for "stats line"
      const enriched = await Promise.all(
        asg.map(async (a) => {
          const course = await mockCoursesAPI.getById(a.courseId);
          const students = course.data.students || [];
          const report = await mockAssignmentsAPI.getSimilarityReport(
            a._id || a.id
          );
          const submitted = a.submissionCount || 0;
          const total = students.length;
          const percent = total ? Math.round((submitted / total) * 100) : 0;
          return {
            ...a,
            _students: students,
            _similarityReport: report.data,
            _submittedPercent: percent,
            _missingCount: Math.max(0, total - submitted),
            _highSimCount: report.data.flaggedStudentIds.length,
          };
        })
      );

      setAssignments(enriched);
    } catch (err) {
      console.error(err);
      setError("Failed to load assignments");
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
        courseName: selectedCourse?.name,
        attachments: formData.attachments,
      };
      await mockAssignmentsAPI.create(payload);

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

      await loadAll();
    } catch (err) {
      console.error(err);
      alert("Failed to create assignment");
    }
  };

  const handleFileChange = async (event) => {
    const files = Array.from(event.target.files || []);
    if (!files.length) return;

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
        attachments: [...prev.attachments, ...processed],
      }));
      event.target.value = "";
    } catch (err) {
      console.error(err);
      alert("Failed to process selected files.");
    }
  };

  const handleRemoveAttachment = (id) => {
    setFormData((prev) => ({
      ...prev,
      attachments: prev.attachments.filter((a) => a.id !== id),
    }));
  };

  if (loading)
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader size="lg" />
      </div>
    );

  const headers = ["Title", "Course", "Due", "Resources", "Summary", "Actions"];

  const renderRow = (a) => (
    <tr
      key={a._id || a.id}
      className={a._submittedPercent < 70 ? "bg-amber-50" : ""}
    >
      <td className="px-6 py-4 font-medium">{a.title}</td>

      <td className="px-6 py-4">{a.courseName}</td>

      <td className="px-6 py-4">
        {a.dueDate ? new Date(a.dueDate).toLocaleDateString() : "N/A"}
      </td>

      <td className="px-6 py-4">
        {a.attachments?.length ? (
          <div className="space-y-1">
            {a.attachments.slice(0, 3).map((att) => (
              <a
                key={att.id}
                href={att.url}
                target="_blank"
                rel="noopener noreferrer"
                className="underline text-primary-600 block"
              >
                {att.name}
              </a>
            ))}
            {a.attachments.length > 3 && (
              <p className="text-xs text-gray-500">
                +{a.attachments.length - 3} more
              </p>
            )}
          </div>
        ) : (
          <span className="text-gray-400">No files</span>
        )}
      </td>

      {/* ONE-LINE SUMMARY + HIGHLIGHTS */}
      <td className="px-6 py-4">
        <div className="flex flex-wrap items-center gap-2">
          <StatPill tone={a._submittedPercent >= 70 ? "green" : "amber"}>
            {a.submissionCount}/{a._students.length || 0} submitted (
            {a._submittedPercent}%)
          </StatPill>
          <StatPill tone={a._missingCount ? "red" : "green"}>
            Missing {a._missingCount}
          </StatPill>
          <StatPill tone={a._highSimCount ? "red" : "blue"}>
            High Similarity ≥ 70%: {a._highSimCount}
          </StatPill>
        </div>
      </td>

      <td className="px-6 py-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            setOpenAssignment(a._id || a.id);
            setOpenCourse(a.courseId);
          }}
        >
          View Submissions
        </Button>
      </td>
    </tr>
  );

  return (
    <div className="container-custom py-8 pt-20">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">Assignments</h1>
          <p className="text-gray-600">Manage course assignments</p>
        </div>
        <Button
          variant="primary"
          onClick={() => setShowCreateForm(!showCreateForm)}
        >
          {showCreateForm ? "Cancel" : "Create Assignment"}
        </Button>
      </div>

      {error && (
        <Card className="mb-6 bg-red-50 border-red-200 text-red-700 p-3">
          {error}
        </Card>
      )}

      {showCreateForm && (
        <Card className="mb-6 p-6">
          <h2 className="text-xl font-bold mb-4">Create Assignment</h2>
          <form onSubmit={handleCreate} className="space-y-4">
            <div>
              <label className="text-sm font-medium">Title</label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
                className="w-full px-4 py-2 border rounded-lg"
              />
            </div>

            <div>
              <label className="text-sm font-medium">Course</label>
              <select
                required
                value={formData.courseId}
                onChange={(e) =>
                  setFormData({ ...formData, courseId: e.target.value })
                }
                className="w-full px-4 py-2 border rounded-lg"
              >
                <option value="">Select course</option>
                {courses.map((c) => (
                  <option key={c._id || c.id} value={c._id || c.id}>
                    {c.name} ({c.code})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-sm font-medium">Description</label>
              <textarea
                required
                rows={4}
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                className="w-full px-4 py-2 border rounded-lg"
              />
            </div>

            <div>
              <label className="text-sm font-medium">
                Upload Resources (PDF, JPG, PNG)
              </label>
              <input
                type="file"
                accept=".pdf,image/jpeg,image/png"
                multiple
                onChange={handleFileChange}
                className="w-full px-4 py-2 border rounded-lg"
              />
              {formData.attachments.length > 0 && (
                <div className="mt-3 space-y-2">
                  {formData.attachments.map((a) => (
                    <div
                      key={a.id}
                      className="flex justify-between bg-gray-100 p-2 rounded-lg"
                    >
                      <div>
                        <p className="font-medium">{a.name}</p>
                        <p className="text-xs text-gray-500">
                          {describeAttachmentType(a.type)}
                        </p>
                      </div>
                      <button
                        type="button"
                        className="text-red-600 text-xs"
                        onClick={() => handleRemoveAttachment(a.id)}
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div>
              <label className="text-sm font-medium">Due Date</label>
              <input
                type="date"
                required
                value={formData.dueDate}
                onChange={(e) =>
                  setFormData({ ...formData, dueDate: e.target.value })
                }
                className="w-full px-4 py-2 border rounded-lg"
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

      {openAssignment && (
        <TeacherAssignmentSubmissions
          assignmentId={openAssignment}
          courseId={openCourse}
          onClose={() => setOpenAssignment(null)}
        />
      )}
    </div>
  );
};

export default TeacherAssignments;
