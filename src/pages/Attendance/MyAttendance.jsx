// src/pages/Attendance/MyAttendance.jsx
import { useEffect, useMemo, useState } from "react";
import Card from "../../components/ui/Card";
import PageHeader from "../../components/common/PageHeader";
import LoadingWrapper from "../../components/common/LoadingWrapper";
import ErrorAlert from "../../components/common/ErrorAlert";
import Button from "../../components/ui/Button";
import Modal from "../../components/ui/Modal";
import { coursesAPI, attendanceAPI } from "../../api/api";
import { useAuth } from "../../hooks/useAuth";
import CameraCapture from "../../components/common/CameraCapture";
import {
  getLocation,
  isInRange,
  getDistanceInMeters,
  mapsLinkFor,
  FIXED_TARGET,
} from "../../utils/helpers";

const LIMIT_METERS = 100; // using your 100m default

const MyAttendance = () => {
  const { user } = useAuth();
  const [courses, setCourses] = useState([]);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState(null);

  const [submitError, setSubmitError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [pendingLoc, setPendingLoc] = useState(null);

  const userId = useMemo(() => user?._id || user?.id, [user]);

  useEffect(() => {
    const fetchData = async () => {
      if (!userId) {
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        const [coursesResponse, attendanceResponse] = await Promise.all([
          coursesAPI.getAll(),
          attendanceAPI.getAll(),
        ]);

        const allCourses = coursesResponse.data || [];
        const studentCourses = allCourses.filter((course) =>
          course.enrolledStudents?.includes(userId)
        );
        setCourses(studentCourses);

        const allRecords = attendanceResponse.data || [];
        const myRecords = allRecords
          .filter((r) => r.studentId === userId)
          .sort(
            (a, b) =>
              new Date(b.date || b.createdAt) - new Date(a.date || a.createdAt)
          );
        setHistory(myRecords);
        setError("");
      } catch (err) {
        setError(
          err?.response?.data?.message || "Failed to load attendance data"
        );
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [userId]);

  const openModal = async (course) => {
    setSelectedCourse(course);
    setSubmitError("");
    try {
      const loc = await getLocation();
      const ok = isInRange(
        loc.latitude,
        loc.longitude,
        FIXED_TARGET.latitude,
        FIXED_TARGET.longitude,
        LIMIT_METERS
      );
      if (!ok) {
        setSubmitError(`Not in range. You must be within ${LIMIT_METERS} m.`);
      }
      setPendingLoc(loc);
      setModalOpen(true);
    } catch (e) {
      setSubmitError(e?.message || "Enable GPS permissions.");
      setModalOpen(true);
    }
  };

  const closeModal = () => {
    if (submitting) return;
    setModalOpen(false);
    setSelectedCourse(null);
    setSubmitError("");
    setPendingLoc(null);
  };

  const handlePhoto = async (photoBase64) => {
    if (!selectedCourse) return;

    try {
      setSubmitting(true);
      setSubmitError("");

      const loc = pendingLoc || (await getLocation());
      const inRange = isInRange(
        loc.latitude,
        loc.longitude,
        FIXED_TARGET.latitude,
        FIXED_TARGET.longitude,
        LIMIT_METERS
      );
      if (!inRange) {
        setSubmitError(
          `Not in range. Please move within ${LIMIT_METERS} meters.`
        );
        setSubmitting(false);
        return;
      }

      const distance = getDistanceInMeters(
        loc.latitude,
        loc.longitude,
        FIXED_TARGET.latitude,
        FIXED_TARGET.longitude
      );

      await attendanceAPI.markSelf({
        courseId: selectedCourse._id || selectedCourse.id,
        courseName: selectedCourse.name,
        studentId: userId,
        studentName: user?.name || "Me",
        photoBase64,
        latitude: loc.latitude,
        longitude: loc.longitude,
        accuracy: loc.accuracy,
        distance,
        notes: "",
        date: new Date().toISOString(),
        present: true,
      });

      closeModal();

      const attendanceResponse = await attendanceAPI.getAll();
      const allRecords = attendanceResponse.data || [];
      const myRecords = allRecords
        .filter((r) => r.studentId === userId)
        .sort(
          (a, b) =>
            new Date(b.date || b.createdAt) - new Date(a.date || a.createdAt)
        );
      setHistory(myRecords);
    } catch (err) {
      setSubmitError(
        err?.response?.data?.message || "Failed to submit attendance."
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="container-custom py-8 pt-20 space-y-6">
      <PageHeader
        title="My Attendance"
        description={`Mark your attendance with live photo & GPS (≤ ${LIMIT_METERS}m)`}
      />

      <ErrorAlert message={error} onDismiss={() => setError("")} />

      <LoadingWrapper loading={loading}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-1">
            <h2 className="text-lg font-semibold text-gray-900 mb-3">
              Enrolled Courses
            </h2>
            {courses.length === 0 ? (
              <p className="text-sm text-gray-500">
                You are not enrolled in any courses yet.
              </p>
            ) : (
              <ul className="space-y-3">
                {courses.map((course) => (
                  <li
                    key={course._id || course.id}
                    className="border border-gray-200 rounded-lg p-3"
                  >
                    <p className="text-sm font-medium text-gray-900">
                      {course.name}
                    </p>
                    <p className="text-xs text-gray-500 mb-2">{course.code}</p>
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => openModal(course)}
                    >
                      Mark Attendance
                    </Button>
                  </li>
                ))}
              </ul>
            )}
          </Card>

          <Card className="lg:col-span-2">
            <h2 className="text-lg font-semibold text-gray-900 mb-3">
              Recent Attendance
            </h2>
            {history.length === 0 ? (
              <p className="text-sm text-gray-500">
                No attendance entries yet.
              </p>
            ) : (
              <div className="space-y-3">
                {history.map((record) => (
                  <div
                    key={record._id || record.id}
                    className="border border-gray-200 rounded-lg p-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3"
                  >
                    <div>
                      <p className="text-sm font-semibold text-gray-900">
                        {record.courseName}
                      </p>
                      <p className="text-xs text-gray-500">
                        {new Date(
                          record.date || record.createdAt
                        ).toLocaleString()}
                      </p>
                      {record.latitude != null && record.longitude != null && (
                        <a
                          className="text-xs text-blue-600 underline"
                          href={mapsLinkFor(record.latitude, record.longitude)}
                          target="_blank"
                          rel="noreferrer"
                        >
                          {Number(record.latitude).toFixed(6)},{" "}
                          {Number(record.longitude).toFixed(6)} (
                          {Math.round(record.distance)} m)
                        </a>
                      )}
                    </div>
                    <div className="flex items-center gap-3">
                      {Array.isArray(record.proof) && record.proof.length ? (
                        <div className="flex items-center gap-2">
                          {record.proof.slice(0, 2).map((item, i) => {
                            const url =
                              typeof item === "string" ? item : item.url;
                            const key = item?.id || url || i;
                            return (
                              <a
                                key={key}
                                href={url}
                                target="_blank"
                                rel="noopener noreferrer"
                              >
                                <img
                                  src={url}
                                  alt={item?.name || "proof"}
                                  className="w-14 h-14 object-cover rounded-lg border border-gray-200"
                                />
                              </a>
                            );
                          })}
                          {record.proof.length > 2 && (
                            <span className="text-xs text-gray-400">
                              +{record.proof.length - 2} more
                            </span>
                          )}
                        </div>
                      ) : (
                        <span className="text-xs text-gray-400">No proof</span>
                      )}
                      <span className="text-xs font-semibold px-2 py-1 rounded-full bg-green-100 text-green-700">
                        Present
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      </LoadingWrapper>

      <Modal
        isOpen={modalOpen}
        onClose={closeModal}
        title={
          selectedCourse
            ? `Mark Attendance • ${selectedCourse.name}`
            : "Mark Attendance"
        }
      >
        <div className="space-y-3">
          {submitError && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              {submitError}
            </div>
          )}
          <CameraCapture onCapture={handlePhoto} onCancel={closeModal} />
          <div className="flex justify-end">
            <Button
              variant="secondary"
              onClick={closeModal}
              disabled={submitting}
            >
              Close
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default MyAttendance;
