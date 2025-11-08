import { useState, useEffect } from "react";
import { lostFoundAPI } from "../../api/api";
import Card from "../../components/ui/Card";
import Loader from "../../components/ui/Loader";
import Button from "../../components/ui/Button";
import Table from "../../components/ui/Table";

const ManageLostFound = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
    try {
      setLoading(true);
      const response = await lostFoundAPI.getAll();
      setItems(response.data || []);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to fetch items");
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (id) => {
    try {
      await lostFoundAPI.verify(id);
      fetchItems();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to verify item");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this item?")) return;

    try {
      await lostFoundAPI.delete(id);
      setItems(items.filter((item) => (item._id || item.id) !== id));
    } catch (err) {
      alert(err.response?.data?.message || "Failed to delete item");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader size="lg" />
      </div>
    );
  }

  const headers = ["Title", "Type", "Location", "Status", "Actions"];

  const renderRow = (item) => (
    <tr key={item._id || item.id}>
      <td className="px-6 py-4 text-sm font-medium text-gray-900">
        {item.title}
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <span
          className={`px-2 py-1 text-xs font-medium rounded-full ${
            item.type === "lost"
              ? "bg-red-100 text-red-800"
              : "bg-green-100 text-green-800"
          }`}
        >
          {item.type === "lost" ? "Lost" : "Found"}
        </span>
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
        {item.location || "N/A"}
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <span
          className={`px-2 py-1 text-xs font-medium rounded-full ${
            item.verified
              ? "bg-blue-100 text-blue-800"
              : "bg-gray-100 text-gray-800"
          }`}
        >
          {item.verified ? "Verified" : "Pending"}
        </span>
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm">
        <div className="flex space-x-2">
          {!item.verified && (
            <Button
              variant="accent"
              size="sm"
              onClick={() => handleVerify(item._id || item.id)}
            >
              Verify
            </Button>
          )}
          <Button
            variant="danger"
            size="sm"
            onClick={() => handleDelete(item._id || item.id)}
          >
            Delete
          </Button>
        </div>
      </td>
    </tr>
  );

  return (
    <div className="container-custom py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          Manage Lost & Found
        </h1>
        <p className="mt-2 text-gray-600">
          Verify and manage lost & found items
        </p>
      </div>

      {error && (
        <Card className="mb-6 bg-red-50 border-red-200">
          <p className="text-red-700">{error}</p>
        </Card>
      )}

      <Card>
        <Table headers={headers} data={items} renderRow={renderRow} />
      </Card>
    </div>
  );
};

export default ManageLostFound;
