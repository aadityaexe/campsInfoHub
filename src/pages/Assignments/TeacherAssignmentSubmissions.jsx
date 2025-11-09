// src/pages/Assignments/TeacherAssignmentSubmissions.jsx
import { useEffect, useState } from "react";
import Button from "../../components/ui/Button";
import Loader from "../../components/ui/Loader";
import Card from "../../components/ui/Card";
import { mockAssignmentsAPI, mockCoursesAPI } from "../../api/assignmentsApi"; // ensure your index re-exports

const Pill = ({ children, tone = "default" }) => {
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

const TeacherAssignmentSubmissions = ({ assignmentId, courseId, onClose }) => {
  const [loading, setLoading] = useState(true);
  const [submissions, setSubmissions] = useState([]);
  const [students, setStudents] = useState([]);
  const [checking, setChecking] = useState(false);
  const [report, setReport] = useState(null); // {highPairs, groups, flaggedStudentIds, threshold}

  useEffect(() => {
    if (assignmentId) loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [assignmentId]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [subsRes, courseRes, repRes] = await Promise.all([
        mockAssignmentsAPI.getSubmissions(assignmentId),
        mockCoursesAPI.getById(courseId),
        mockAssignmentsAPI.getSimilarityReport(assignmentId),
      ]);
      setSubmissions(subsRes.data || []);
      setStudents(courseRes.data.students || []);
      setReport(repRes.data);
    } catch (err) {
      console.error(err);
      alert("Failed to load submissions");
    } finally {
      setLoading(false);
    }
  };

  const handleCheckPlagiarism = async (studentId) => {
    try {
      setChecking(true);
      const res = await mockAssignmentsAPI.checkPlagiarism(
        assignmentId,
        studentId
      );
      alert(`Similarity (best match): ${res.data.similarityPercent}%`);
    } finally {
      setChecking(false);
    }
  };

  if (!assignmentId) return null;

  const notSubmitted = students.filter(
    (s) => !submissions.some((sub) => sub.studentId === (s._id || s.id))
  );

  const submittedCount = submissions.length;
  const total = students.length;
  const percent = total ? Math.round((submittedCount / total) * 100) : 0;
  const lowRate = percent < 70;
  const highSimCount = report?.flaggedStudentIds?.length || 0;

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-[999]">
      <div className="bg-white p-6 rounded-xl w-full max-w-5xl shadow-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-start justify-between gap-4">
          <h2 className="text-2xl font-bold">Assignment Submissions</h2>
          <div className="flex items-center gap-2">
            <Pill tone={percent >= 70 ? "green" : "amber"}>
              Submitted {submittedCount}/{total} ({percent}%)
            </Pill>
            <Pill tone={notSubmitted.length ? "red" : "green"}>
              Missing {notSubmitted.length}
            </Pill>
            <Pill tone={highSimCount ? "red" : "blue"}>
              High Similarity ≥ {report?.threshold ?? 70}%: {highSimCount}
            </Pill>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-10">
            <Loader size="lg" />
          </div>
        ) : (
          <>
            {/* Same-answer / high-similarity groups */}
            {report?.groups?.length ? (
              <div className="mt-4">
                <h3 className="text-lg font-semibold">
                  Same-answer groups (flagged)
                </h3>
                <div className="mt-2 grid gap-2">
                  {report.groups.map((g, i) => (
                    <div
                      key={i}
                      className="border rounded-lg p-3 bg-amber-50 border-amber-200"
                    >
                      <div className="text-sm font-medium mb-1">
                        Group {i + 1} · {g.length} students
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {g.map((st) => (
                          <Pill key={st.id} tone="amber">
                            {st.name}
                          </Pill>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="mt-4">
                <h3 className="text-lg font-semibold">Same-answer groups</h3>
                <p className="text-sm text-gray-500 mt-1">
                  No clusters detected at current threshold.
                </p>
              </div>
            )}

            <h3 className="text-lg font-semibold mt-6">Submitted</h3>
            <div className="space-y-2 mt-2">
              {submissions.map((sub) => {
                const flagged = report?.flaggedStudentIds?.includes(
                  sub.studentId
                );
                return (
                  <Card
                    key={sub.id}
                    className={`flex items-center justify-between p-3 ${
                      flagged ? "border-red-300 bg-red-50" : ""
                    }`}
                  >
                    <div className="min-w-0">
                      <p className="font-medium flex items-center gap-2">
                        {sub.studentName}
                        {flagged && <Pill tone="red">High similarity</Pill>}
                      </p>
                      <p className="text-xs text-gray-500">
                        {new Date(sub.submittedAt).toLocaleString()}
                      </p>
                    </div>

                    <div className="flex gap-2 shrink-0">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() =>
                          window.open(sub.attachments?.[0]?.url, "_blank")
                        }
                      >
                        Preview
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => window.open(sub.attachments?.[0]?.url)}
                      >
                        Download
                      </Button>
                      <Button
                        size="sm"
                        variant="primary"
                        disabled={checking}
                        onClick={() => handleCheckPlagiarism(sub.studentId)}
                      >
                        Plagiarism
                      </Button>
                    </div>
                  </Card>
                );
              })}
            </div>

            <h3 className="text-lg font-semibold mt-6">Not Submitted</h3>
            <div className="space-y-2 mt-2">
              {notSubmitted.map((stu) => (
                <Card
                  key={stu._id || stu.id}
                  className="p-3 bg-red-50 border border-red-200 text-red-700"
                >
                  {stu.name}
                </Card>
              ))}
              {!notSubmitted.length && (
                <p className="text-sm text-green-700 bg-green-50 border border-green-200 p-2 rounded">
                  All students submitted. Nice.
                </p>
              )}
            </div>
          </>
        )}

        <div className="text-right mt-6">
          <Button onClick={onClose}>Close</Button>
        </div>
      </div>
    </div>
  );
};

export default TeacherAssignmentSubmissions;
