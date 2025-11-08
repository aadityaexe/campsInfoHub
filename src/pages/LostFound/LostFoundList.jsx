import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { lostFoundAPI } from "../../api/api";
import { useAuth } from "../../hooks/useAuth";
import { getItemId, formatDate } from "../../utils/helpers";
import { USER_ROLES, STATUS } from "../../utils/constants";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import PageHeader from "../../components/common/PageHeader";
import LoadingWrapper from "../../components/common/LoadingWrapper";
import ErrorAlert from "../../components/common/ErrorAlert";
import StatusBadge from "../../components/common/StatusBadge";

const LostFoundList = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");

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
      alert("Item approved successfully");
      fetchItems();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to approve item");
    }
  };

  const handleReject = async (id) => {
    if (!window.confirm("Are you sure you want to reject this item?")) return;
    try {
      await lostFoundAPI.reject(id);
      alert("Item rejected successfully");
      fetchItems();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to reject item");
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

  const filteredItems = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();
    return items.filter((item) => {
      const matchesSearch = normalizedSearch
        ? item.title?.toLowerCase().includes(normalizedSearch) ||
          item.description?.toLowerCase().includes(normalizedSearch)
        : true;
      const matchesCategory =
        categoryFilter === "all" ? true : item.type === categoryFilter;
      return matchesSearch && matchesCategory;
    });
  }, [items, searchTerm, categoryFilter]);

  const isOwner = (item) => {
    if (!user) return false;
    const userId = user._id || user.id;
    return item.reportedBy === userId;
  };

  return (
    <LoadingWrapper loading={loading}>
      <div className="container-custom py-8 pt-20">
        <PageHeader
          title="Lost & Found"
          description="Report and find lost items"
          action={{
            label: "Report Item",
            to: "/lost-found/report",
            variant: "primary",
          }}
        />

        <ErrorAlert message={error} onDismiss={() => setError("")} />

        <Card className="mb-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex-1">
              <label htmlFor="lost-found-search" className="sr-only">
                Search Lost &amp; Found
              </label>
              <input
                id="lost-found-search"
                type="search"
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder="Search by title or description"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              />
            </div>
            <div className="flex items-center gap-2">
              {[
                { label: "All", value: "all" },
                { label: "Lost", value: "lost" },
                { label: "Found", value: "found" },
              ].map((filter) => (
                <Button
                  key={filter.value}
                  type="button"
                  variant={
                    categoryFilter === filter.value ? "primary" : "outline"
                  }
                  size="sm"
                  onClick={() => setCategoryFilter(filter.value)}
                >
                  {filter.label}
                </Button>
              ))}
            </div>
          </div>
        </Card>

        {filteredItems.length === 0 ? (
          <Card>
            <p className="text-center text-gray-500 py-8">No items reported</p>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredItems.map((item) => (
              <Card key={item._id || item.id}>
                <div className="mb-4">
                  <h2 className="text-xl font-bold text-gray-900 mb-2">
                    {item.title}
                  </h2>
                  <p className="text-gray-600 mb-2">{item.description}</p>
                  <div className="flex items-center space-x-2 mb-2 flex-wrap">
                    <span
                      className={`px-2 py-1 text-xs font-medium rounded-full ${
                        item.type === "lost"
                          ? "bg-red-100 text-red-800"
                          : "bg-green-100 text-green-800"
                      }`}
                    >
                      {item.type === "lost" ? "Lost" : "Found"}
                    </span>
                    <StatusBadge status={item.status} />
                  </div>
                  <p className="text-sm text-gray-500">
                    Location: {item.location || "N/A"}
                  </p>
                  <p className="text-sm text-gray-500">
                    Date: {formatDate(item.date || item.createdAt)}
                  </p>
                </div>
                <div className="flex space-x-2 mt-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigate(`/lost-found/${getItemId(item)}`)}
                  >
                    View Details
                  </Button>
                  {user?.role === USER_ROLES.ADMIN && (
                    <>
                      {item.status === STATUS.PENDING && (
                        <>
                          <Button
                            variant="accent"
                            size="sm"
                            onClick={() => handleVerify(getItemId(item))}
                          >
                            Approve
                          </Button>
                          <Button
                            variant="danger"
                            size="sm"
                            onClick={() => handleReject(getItemId(item))}
                          >
                            Reject
                          </Button>
                        </>
                      )}
                      <Button
                        variant="danger"
                        size="sm"
                        onClick={() => handleDelete(getItemId(item))}
                      >
                        Delete
                      </Button>
                    </>
                  )}
                  {isOwner(item) && user?.role !== USER_ROLES.ADMIN && (
                    <>
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() =>
                          navigate(`/lost-found/${getItemId(item)}/edit`, {
                            state: { from: "/lost-found" },
                          })
                        }
                      >
                        Edit
                      </Button>
                      <Button
                        variant="danger"
                        size="sm"
                        onClick={() => handleDelete(getItemId(item))}
                      >
                        Delete
                      </Button>
                    </>
                  )}
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </LoadingWrapper>
  );
};

export default LostFoundList;
