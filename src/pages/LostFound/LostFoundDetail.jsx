import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { lostFoundAPI } from "../../api/api";
import { useAuth } from "../../hooks/useAuth";
import { formatDate, formatDateTime, getItemId } from "../../utils/helpers";
import { STATUS, USER_ROLES } from "../../utils/constants";
import LoadingWrapper from "../../components/common/LoadingWrapper";
import ErrorAlert from "../../components/common/ErrorAlert";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import StatusBadge from "../../components/common/StatusBadge";

const LostFoundDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchItem = async () => {
    if (!id) {
      setError("Item ID is missing");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const response = await lostFoundAPI.getById(id);
      setItem(response.data || null);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load item");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItem();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const isOwner = useMemo(() => {
    if (!user || !item) return false;
    const userId = user._id || user.id;
    return item.reportedBy === userId;
  }, [item, user]);

  const canModerate = user?.role === USER_ROLES.ADMIN;

  const handleDelete = async () => {
    if (!item) return;
    if (!window.confirm("Are you sure you want to delete this post?")) return;

    try {
      setActionLoading(true);
      await lostFoundAPI.delete(getItemId(item));
      navigate("/lost-found", { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || "Failed to delete item");
    } finally {
      setActionLoading(false);
    }
  };

  const handleVerify = async () => {
    if (!item) return;
    try {
      setActionLoading(true);
      await lostFoundAPI.verify(getItemId(item));
      await fetchItem();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to approve item");
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async () => {
    if (!item) return;
    try {
      setActionLoading(true);
      await lostFoundAPI.reject(getItemId(item));
      await fetchItem();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to reject item");
    } finally {
      setActionLoading(false);
    }
  };

  const attachments = item?.attachments || [];

  return (
    <LoadingWrapper loading={loading}>
      <div className="container-custom py-8 space-y-6 pt-20">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Lost &amp; Found Details
            </h1>
            <p className="mt-2 text-gray-600">
              Review complete information about this post
            </p>
          </div>
          <Button variant="secondary" onClick={() => navigate(-1)}>
            Back
          </Button>
        </div>

        <ErrorAlert message={error} onDismiss={() => setError("")} />

        {item && (
          <Card>
            <div className="flex flex-col lg:flex-row gap-8">
              <div className="flex-1 space-y-4">
                <div>
                  <div className="flex items-center gap-3 flex-wrap">
                    <StatusBadge status={item.status} />
                    <span
                      className={`px-3 py-1 text-xs font-semibold uppercase tracking-wide rounded-full ${
                        item.type === "lost"
                          ? "bg-red-100 text-red-700"
                          : "bg-green-100 text-green-700"
                      }`}
                    >
                      {item.type === "lost" ? "Lost Item" : "Found Item"}
                    </span>
                    {item.verified && (
                      <span className="px-3 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-700">
                        Verified
                      </span>
                    )}
                  </div>
                  <h2 className="text-2xl font-semibold text-gray-900 mt-4">
                    {item.title}
                  </h2>
                  <p className="mt-3 text-gray-700 leading-relaxed">
                    {item.description}
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <DetailField
                    label="Category"
                    value={item.type === "lost" ? "Lost" : "Found"}
                  />
                  <DetailField
                    label="Location"
                    value={item.location || "Not specified"}
                  />
                  <DetailField
                    label="Reported On"
                    value={formatDateTime(item.createdAt)}
                  />
                  <DetailField
                    label="Event Date"
                    value={formatDate(item.date)}
                  />
                  <DetailField label="Status" value={item.status} />
                  <DetailField
                    label="Reported By"
                    value={item.reportedByName || "Member"}
                  />
                </div>

                {(isOwner || canModerate) && (
                  <div className="flex flex-wrap gap-3">
                    {isOwner && (
                      <Button
                        variant="primary"
                        onClick={() =>
                          navigate(`/lost-found/${getItemId(item)}/edit`, {
                            state: { from: `/lost-found/${getItemId(item)}` },
                          })
                        }
                        disabled={actionLoading}
                      >
                        Edit Post
                      </Button>
                    )}
                    {canModerate && item.status === STATUS.PENDING && (
                      <>
                        <Button
                          variant="accent"
                          onClick={handleVerify}
                          disabled={actionLoading}
                        >
                          Approve
                        </Button>
                        <Button
                          variant="danger"
                          onClick={handleReject}
                          disabled={actionLoading}
                        >
                          Reject
                        </Button>
                      </>
                    )}
                    {(isOwner || canModerate) && (
                      <Button
                        variant="outline"
                        onClick={handleDelete}
                        disabled={actionLoading}
                      >
                        Delete Post
                      </Button>
                    )}
                  </div>
                )}
              </div>

              <div className="w-full lg:w-80 space-y-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">
                    Attachments
                  </h3>
                  {attachments.length === 0 ? (
                    <p className="text-sm text-gray-500">
                      No attachments provided.
                    </p>
                  ) : (
                    <ul className="space-y-3">
                      {attachments.map((attachment) => (
                        <li
                          key={attachment.id}
                          className="border border-gray-200 rounded-lg p-3 flex items-center gap-3"
                        >
                          {attachment.type?.includes("image") ? (
                            <img
                              src={attachment.url}
                              alt={attachment.name}
                              className="w-16 h-16 object-cover rounded-md border border-gray-200"
                            />
                          ) : (
                            <div className="w-16 h-16 flex items-center justify-center bg-gray-100 text-gray-500 rounded-md">
                              PDF
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-800 truncate">
                              {attachment.name || "Attachment"}
                            </p>
                            <a
                              href={attachment.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs text-primary-600 hover:text-primary-700"
                            >
                              View / Download
                            </a>
                          </div>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            </div>
          </Card>
        )}
      </div>
    </LoadingWrapper>
  );
};

const DetailField = ({ label, value }) => (
  <div className="space-y-1">
    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
      {label}
    </p>
    <p className="text-sm text-gray-900">{value || "—"}</p>
  </div>
);

export default LostFoundDetail;
