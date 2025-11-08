// src/pages/Attendance/MarkAttendance.jsx
import { useEffect, useMemo, useState } from "react";
import { coursesAPI, attendanceAPI } from "../../api/api";
import Card from "../../components/ui/Card";
import Loader from "../../components/ui/Loader";
import Button from "../../components/ui/Button";
import Table from "../../components/ui/Table";
import Modal from "../../components/ui/Modal";
import CameraCapture from "../../components/common/CameraCapture";
import {
  getLocation,
  isInRange,
  getDistanceInMeters,
  FIXED_TARGET,
} from "../../utils/helpers";
import { useAuth } from "../../hooks/useAuth";

const LIMIT_METERS = 100;

const MarkAttendance = () => {
  const { user } = useAuth() || {};
  const markedBy = useMemo(() => user?.name || "Staff", [user]);

  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState("");
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [cameraFor, setCameraFor] = useState(null); // studentId or null
  const [pendingLoc, setPendingLoc] = useState(null);

  const [attendance, setAttendance] = useState({}); // studentId -> record

  useEffect(() => {
    (async () => {
      try {
        const res = await coursesAPI.getAll();
        setCourses(res.data || []);
      } catch {
        setError("Failed to fetch courses");
      }
    })();
  }, []);

  const fetchStudents = async (courseId) => {
    setLoading(true);
    try {
      const res = await coursesAPI.getById(courseId);
      setStudents(res.data?.students || []);
      setError("");
    } catch {
      setError("Failed to fetch students");
    } finally {
      setLoading(false);
    }
  };

  const onCourseChange = (e) => {
    const id = e.target.value;
    setSelectedCourse(id);
    if (id) fetchStudents(id);
  };

  const startCaptureFor = async (studentId) => {
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
        alert(`Not in range. You must be within ${LIMIT_METERS} meters.`);
        return;
      }
      setPendingLoc(loc);
      setCameraFor(studentId);
    } catch (e) {
      alert(e?.message || "Enable GPS permissions");
    }
  };

  const onPhotoCaptured = (photoBase64) => {
    const studentId = cameraFor;
    const loc = pendingLoc;
    const distance = getDistanceInMeters(
      loc.latitude,
      loc.longitude,
      FIXED_TARGET.latitude,
      FIXED_TARGET.longitude
    );

    setAttendance((prev) => ({
      ...prev,
      [studentId]: {
        present: true,
        photoBase64,
        latitude: loc.latitude,
        longitude: loc.longitude,
        accuracy: loc.accuracy,
        distance,
        timestamp: new Date().toISOString(),
      },
    }));
    setCameraFor(null);
    setPendingLoc(null);
  };

  const headers = ["Student Name", "Status", "Action"];

  const renderRow = (student) => {
    const sid = student._id || student.id;
    const rec = attendance[sid];
    return (
      <tr key={sid}>
        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
          {student.name || student.email}
        </td>
        <td className="px-6 py-4 whitespace-nowrap">
          {rec?.present ? (
            <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">
              Present
            </span>
          ) : (
            <span className="px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-800">
              Absent
            </span>
          )}
        </td>
        <td className="px-6 py-4 whitespace-nowrap">
          <Button
            variant={rec?.present ? "secondary" : "primary"}
            size="sm"
            onClick={() => startCaptureFor(sid)}
          >
            {rec?.present ? "Retake" : "Capture + Mark"}
          </Button>
        </td>
      </tr>
    );
  };

  const submitAll = async () => {
    if (!selectedCourse) {
      alert("Select a course");
      return;
    }
    const records = Object.entries(attendance).map(([studentId, rec]) => ({
      studentId,
      present: !!rec.present,
      photoBase64: rec.photoBase64,
      latitude: rec.latitude,
      longitude: rec.longitude,
      distance: rec.distance,
      accuracy: rec.accuracy,
      timestamp: rec.timestamp,
    }));

    try {
      await attendanceAPI.mark({
        courseId: selectedCourse,
        date: new Date().toISOString(),
        records,
        markedBy: user?._id || "staff",
        markedByName: markedBy,
      });
      alert("Attendance saved");
      setAttendance({});
    } catch (e) {
      alert(e?.message || "Failed to submit");
    }
  };

  return (
    <div className="container-custom py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Mark Attendance</h1>
        <p className="mt-2 text-gray-600">
          Capture a live photo and GPS for each student (limit {LIMIT_METERS}m).
        </p>
      </div>

      {error && (
        <Card className="mb-6 bg-red-50 border-red-200">
          <p className="text-red-700">{error}</p>
        </Card>
      )}

      <Card className="mb-6">
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Select Course
          </label>
          <select
            value={selectedCourse}
            onChange={onCourseChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
          >
            <option value="">Choose a course</option>
            {courses.map((c) => (
              <option key={c._id || c.id} value={c._id || c.id}>
                {c.name} ({c.code})
              </option>
            ))}
          </select>
        </div>
      </Card>

      {selectedCourse && (
        <>
          <Card className="mb-6">
            {loading ? (
              <Loader />
            ) : (
              <Table headers={headers} data={students} renderRow={renderRow} />
            )}
          </Card>
          <div className="flex justify-end">
            <Button variant="primary" onClick={submitAll}>
              Submit Attendance
            </Button>
          </div>
        </>
      )}

      <Modal
        isOpen={!!cameraFor}
        onClose={() => setCameraFor(null)}
        title="Capture Proof"
      >
        <CameraCapture
          onCapture={onPhotoCaptured}
          onCancel={() => setCameraFor(null)}
        />
      </Modal>
    </div>
  );
};

export default MarkAttendance;
