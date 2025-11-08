import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { lostFoundAPI } from "../../api/api";
import Card from "../../components/ui/Card";
import PageHeader from "../../components/common/PageHeader";
import ErrorAlert from "../../components/common/ErrorAlert";
import LostFoundForm from "../../components/lostFound/LostFoundForm";
import Loader from "../../components/ui/Loader";

const ReportItem = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditMode = Boolean(id);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [initialValues, setInitialValues] = useState(null);
  const [initialLoading, setInitialLoading] = useState(isEditMode);

  useEffect(() => {
    const fetchItem = async () => {
      if (!isEditMode) {
        setInitialValues(null);
        setInitialLoading(false);
        return;
      }

      try {
        setInitialLoading(true);
        const response = await lostFoundAPI.getById(id);
        const item = response.data;
        setInitialValues({
          ...item,
          date: item.date?.slice(0, 10) || item.createdAt?.slice(0, 10),
        });
      } catch (err) {
        const message =
          err.response?.data?.message || "Failed to load item details";
        setError(message);
      } finally {
        setInitialLoading(false);
      }
    };

    fetchItem();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const handleSubmit = async (values) => {
    try {
      setLoading(true);
      setError("");
      if (isEditMode) {
        await lostFoundAPI.update(id, values);
        navigate(`/lost-found/${id}`);
      } else {
        const response = await lostFoundAPI.create(values);
        const createdId = response.data?._id || response.data?.id;
        navigate(createdId ? `/lost-found/${createdId}` : "/lost-found");
      }
    } catch (err) {
      const message = err.response?.data?.message || "Failed to save item";
      setError(message);
      throw new Error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container-custom py-8 pt-20">
      <PageHeader
        title={
          isEditMode ? "Update Lost or Found Item" : "Report Lost or Found Item"
        }
        description={
          isEditMode
            ? "Edit the details of your post. Updates will be reviewed by moderators."
            : "Share details so campus members can help reconnect items with their owners"
        }
        action={{
          label: "Back to list",
          variant: "secondary",
          to: "/lost-found",
        }}
      />

      <ErrorAlert message={error} onDismiss={() => setError("")} />

      <Card>
        {initialLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader />
          </div>
        ) : (
          <LostFoundForm
            initialValues={initialValues || undefined}
            onSubmit={handleSubmit}
            loading={loading}
            onCancel={() =>
              isEditMode
                ? navigate(`/lost-found/${id}`)
                : navigate("/lost-found")
            }
            submitLabel={isEditMode ? "Update Post" : "Submit Report"}
          />
        )}
      </Card>
    </div>
  );
};

export default ReportItem;
