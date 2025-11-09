import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { noticesAPI } from "../../api/api";
import LoadingWrapper from "../../components/common/LoadingWrapper";
import ErrorAlert from "../../components/common/ErrorAlert";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button"; // ✅ Import Button
import { formatDate } from "../../utils/helpers";

const NoticeDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate(); // ✅ For back button
  const [notice, setNotice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchNotice();
  }, []);

  const fetchNotice = async () => {
    try {
      const response = await noticesAPI.getById(id);
      setNotice(response.data);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load notice");
    } finally {
      setLoading(false);
    }
  };

  return (
    <LoadingWrapper loading={loading}>
      <div className="container-custom py-8 pt-20">
        {/* ✅ Back Button */}
        <Button
          variant="secondary"
          size="sm"
          onClick={() => navigate(-1)}
          className="mb-4"
        >
          ← Go Back
        </Button>

        <ErrorAlert message={error} onDismiss={() => setError("")} />

        {notice && (
          <Card>
            <h1 className="text-3xl font-bold mb-4">{notice.title}</h1>

            <p className="text-gray-700 mb-6 whitespace-pre-line">
              {notice.content}
            </p>

            <div className="text-sm text-gray-500 flex items-center space-x-4">
              <span>Posted: {formatDate(notice.createdAt)}</span>
              {notice.author && <span>By: {notice.author}</span>}
            </div>
          </Card>
        )}
      </div>
    </LoadingWrapper>
  );
};

export default NoticeDetails;
