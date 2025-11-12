// src/pages/Attendance/AttendanceRecords.jsx
import { useEffect, useState } from "react";
import { attendanceAPI } from "../../api/attendanceAPI";
import Card from "../../components/ui/Card";
import Loader from "../../components/ui/Loader";
import Table from "../../components/ui/Table";
import { mapsLinkFor } from "../../utils/helpers";

const AttendanceRecords = () => {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const response = await attendanceAPI.getAll();
        setRecords(response.data || []);
      } catch (err) {
        setError(
          err?.response?.data?.message || "Failed to fetch attendance records"
        );
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader size="lg" />
      </div>
    );
  }

  const headers = [
    "Date",
    "Course",
    "Student",
    "Proof",
    "GPS (dist)",
    "Status",
  ];

  const renderRow = (record) => (
    <tr key={record._id || record.id}>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
        {new Date(record.date || record.createdAt).toLocaleString()}
      </td>

      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
        {record.courseName || record.course || "—"}
      </td>

      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
        {record.studentName || record.student || "—"}
      </td>

      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
        {Array.isArray(record.proof) && record.proof.length ? (
          <div className="flex items-center space-x-2">
            {record.proof.slice(0, 2).map((item, i) => {
              const url = typeof item === "string" ? item : item.url;
              const key = item?.id || url || i;
              return (
                <a
                  key={key}
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block"
                >
                  <img
                    src={url}
                    alt={item?.name || "proof"}
                    className="w-12 h-12 object-cover rounded-md border border-gray-200"
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
          <span className="text-gray-400">—</span>
        )}
      </td>

      <td className="px-6 py-4 whitespace-nowrap text-xs text-gray-500">
        {record.latitude != null && record.longitude != null ? (
          <a
            className="underline text-blue-600"
            href={mapsLinkFor(
              Number(record.latitude),
              Number(record.longitude)
            )}
            target="_blank"
            rel="noreferrer"
          >
            {Number(record.latitude).toFixed(6)},{" "}
            {Number(record.longitude).toFixed(6)}
            {typeof record.distance === "number"
              ? ` (${Math.round(record.distance)} m)`
              : ""}
          </a>
        ) : (
          "—"
        )}
      </td>

      <td className="px-6 py-4 whitespace-nowrap">
        <span
          className={`px-2 py-1 text-xs font-medium rounded-full ${
            record.present
              ? "bg-green-100 text-green-800"
              : "bg-red-100 text-red-800"
          }`}
        >
          {record.present ? "Present" : "Absent"}
        </span>
      </td>
    </tr>
  );

  return (
    <div className="container-custom py-8 pt-20">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Attendance Records</h1>
        <p className="mt-2 text-gray-600">
          View all attendance records (with GPS + photos)
        </p>
      </div>

      {error && (
        <Card className="mb-6 bg-red-50 border-red-200">
          <p className="text-red-700">{error}</p>
        </Card>
      )}

      <Card>
        <Table headers={headers} data={records} renderRow={renderRow} />
      </Card>
    </div>
  );
};

export default AttendanceRecords;
