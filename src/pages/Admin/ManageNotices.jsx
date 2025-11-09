import { useState, useEffect } from "react";
import { noticesAPI } from "../../api/api";
import Card from "../../components/ui/Card";
import Loader from "../../components/ui/Loader";
import Button from "../../components/ui/Button";
import { Link } from "react-router-dom";
import Table from "../../components/ui/Table";

const ManageNotices = () => {
  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchNotices();
  }, []);

  const fetchNotices = async () => {
    try {
      setLoading(true);
      const response = await noticesAPI.getAll();
      setNotices(response.data || []);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to fetch notices");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this notice?")) return;

    try {
      await noticesAPI.delete(id);
      setNotices(notices.filter((n) => (n._id || n.id) !== id));
    } catch (err) {
      alert(err.response?.data?.message || "Failed to delete notice");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader size="lg" />
      </div>
    );
  }

  const headers = ["Title", "Content", "Date", "Actions"];

  const renderRow = (notice) => (
    <tr key={notice._id || notice.id}>
      <td className="px-6 py-4 text-sm font-medium text-gray-900">
        {notice.title}
      </td>
      <td className="px-6 py-4 text-sm text-gray-500">
        {notice.content?.substring(0, 50)}...
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
        {new Date(notice.createdAt || notice.date).toLocaleDateString()}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm">
        <Button
          variant="danger"
          size="sm"
          onClick={() => handleDelete(notice._id || notice.id)}
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
          <h1 className="text-3xl font-bold text-gray-900">Manage Notices</h1>
          <p className="mt-2 text-gray-600">Create and manage campus notices</p>
        </div>
        <Link to="/notices/create">
          <Button variant="primary">Create Notice</Button>
        </Link>
      </div>

      {error && (
        <Card className="mb-6 bg-red-50 border-red-200">
          <p className="text-red-700">{error}</p>
        </Card>
      )}

      <Card>
        <Table headers={headers} data={notices} renderRow={renderRow} />
      </Card>
    </div>
  );
};

export default ManageNotices;
