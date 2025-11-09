import { useState, useEffect } from "react";
import { noticesAPI } from "../../api/api";
import { useAuth } from "../../hooks/useAuth";
import { getItemId, formatDate } from "../../utils/helpers";
import { USER_ROLES } from "../../utils/constants";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import PageHeader from "../../components/common/PageHeader";
import LoadingWrapper from "../../components/common/LoadingWrapper";
import ErrorAlert from "../../components/common/ErrorAlert";
import EmptyState from "../../components/common/EmptyState";
import { Link } from "react-router-dom";

const NoticesList = () => {
  const { user } = useAuth();
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
      setNotices(notices.filter((n) => getItemId(n) !== id));
    } catch (err) {
      alert(err.response?.data?.message || "Failed to delete notice");
    }
  };

  const canCreateNotice =
    user?.role === USER_ROLES.ADMIN || user?.role === USER_ROLES.TEACHER;

  return (
    <LoadingWrapper loading={loading}>
      <div className="container-custom py-8 pt-20">
        <PageHeader
          title="Campus Notices"
          description="Stay updated with campus announcements"
          action={
            canCreateNotice
              ? {
                  label: "Create Notice",
                  to: "/notices/create",
                  variant: "primary",
                }
              : null
          }
        />

        <ErrorAlert message={error} onDismiss={() => setError("")} />

        {notices.length === 0 ? (
          <Card>
            <EmptyState
              title="No notices available"
              message="Check back later for campus announcements"
              action={
                canCreateNotice
                  ? {
                      label: "Create First Notice",
                      to: "/notices/create",
                    }
                  : null
              }
            />
          </Card>
        ) : (
          <div className="space-y-4">
            {notices.map((notice) => {
              const noticeId = getItemId(notice);
              return (
                <Link
                  to={`/notices/${noticeId}`}
                  key={noticeId}
                  className="block"
                >
                  <Card className="cursor-pointer hover:bg-gray-50 transition">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h2 className="text-xl font-bold text-gray-900 mb-2">
                          {notice.title}
                        </h2>

                        <p className="text-gray-600 mb-4 line-clamp-2">
                          {notice.content}
                        </p>

                        <div className="flex items-center space-x-4 text-sm text-gray-500">
                          <span>
                            {formatDate(notice.createdAt || notice.date)}
                          </span>
                          {notice.author && <span>By: {notice.author}</span>}
                        </div>
                      </div>

                      {user?.role === USER_ROLES.ADMIN && (
                        <div className="ml-4 flex space-x-2">
                          <Button
                            variant="danger"
                            size="sm"
                            onClick={(e) => {
                              e.preventDefault(); // prevent card click
                              handleDelete(noticeId);
                            }}
                          >
                            Delete
                          </Button>
                        </div>
                      )}
                    </div>
                  </Card>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </LoadingWrapper>
  );
};

export default NoticesList;
