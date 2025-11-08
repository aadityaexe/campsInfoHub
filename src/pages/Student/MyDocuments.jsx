import { useEffect, useMemo, useState } from "react";
import PageHeader from "../../components/common/PageHeader";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import ErrorAlert from "../../components/common/ErrorAlert";
import Modal from "../../components/ui/Modal";
import { useAuth } from "../../hooks/useAuth";
import {
  DOCUMENT_FILE_TYPES,
  describeAttachmentType,
  filesToAttachments,
  formatFileSize,
  isFileSizeValid,
  isFileTypeAllowed,
} from "../../utils/file";

const STORAGE_PREFIX = "camps_documents_";
const MAX_FILE_SIZE_MB = 15;

const MyDocuments = () => {
  const { user } = useAuth();
  const [documents, setDocuments] = useState([]);
  const [error, setError] = useState("");
  const [previewDoc, setPreviewDoc] = useState(null);

  const storageKey = useMemo(() => {
    if (!user) return null;
    return `${STORAGE_PREFIX}${user._id || user.id}`;
  }, [user]);

  useEffect(() => {
    if (!storageKey) return;
    try {
      const stored = localStorage.getItem(storageKey);
      if (stored) {
        setDocuments(JSON.parse(stored));
      }
    } catch (storageError) {
      console.error("Failed to load documents", storageError);
      setError("Failed to load documents from storage.");
    }
  }, [storageKey]);

  const persistDocuments = (items) => {
    if (!storageKey) return;
    setDocuments(items);
    try {
      localStorage.setItem(storageKey, JSON.stringify(items));
    } catch (storageError) {
      console.error("Failed to persist documents", storageError);
      setError("Failed to save documents. Please check storage settings.");
    }
  };

  const handleUpload = async (event) => {
    const files = Array.from(event.target.files || []);
    if (files.length === 0) {
      return;
    }

    if (!user || !storageKey) {
      setError("You must be logged in to upload documents.");
      return;
    }

    for (const file of files) {
      if (!isFileTypeAllowed(file, DOCUMENT_FILE_TYPES)) {
        setError("Only PDF, JPG, and PNG files are allowed.");
        return;
      }
      if (!isFileSizeValid(file, MAX_FILE_SIZE_MB)) {
        setError(`Files must be smaller than ${MAX_FILE_SIZE_MB} MB.`);
        return;
      }
    }

    try {
      const attachments = await filesToAttachments(files, {
        prefix: "studentDoc",
      });
      const now = new Date().toISOString();

      const prepared = attachments.map((attachment) => ({
        ...attachment,
        uploadedAt: now,
      }));

      const updated = [...prepared, ...documents];
      persistDocuments(updated);
      setError("");
      event.target.value = "";
    } catch (uploadError) {
      console.error("Failed to process files", uploadError);
      setError("Failed to process selected files. Please try again.");
    }
  };

  const handleDelete = (documentId) => {
    if (!window.confirm("Delete this document?")) return;
    const updated = documents.filter((doc) => doc.id !== documentId);
    persistDocuments(updated);
  };

  const handleDownload = (doc) => {
    const link = document.createElement("a");
    link.href = doc.url;
    link.download = doc.name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (!user) {
    return (
      <div className="container-custom py-8">
        <Card>
          <p className="text-center text-gray-600 py-8">
            Please log in to manage your documents.
          </p>
        </Card>
      </div>
    );
  }

  return (
    <div className="container-custom py-8 space-y-6 pt-20">
      <PageHeader
        title="My Documents"
        description="Upload, preview, and manage your personal academic documents"
      />

      <ErrorAlert message={error} onDismiss={() => setError("")} />

      <Card>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Upload Documents (PDF, JPG, PNG)
            </label>
            <input
              type="file"
              accept=".pdf,image/jpeg,image/png"
              multiple
              onChange={handleUpload}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
            />
            <p className="text-xs text-gray-500 mt-1">
              Maximum file size {MAX_FILE_SIZE_MB} MB per file. Uploaded files
              are stored locally in your browser.
            </p>
          </div>
        </div>
      </Card>

      <Card>
        {documents.length === 0 ? (
          <p className="text-center text-gray-500 py-12">
            No documents saved yet. Upload files to get started.
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {documents.map((doc) => (
              <div
                key={doc.id}
                className="border border-gray-200 rounded-lg p-4 flex flex-col space-y-3"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-semibold text-gray-900 truncate max-w-[12rem]">
                      {doc.name}
                    </h3>
                    <p className="text-xs text-gray-500">
                      {describeAttachmentType(doc.type)} •{" "}
                      {formatFileSize(doc.size)}
                    </p>
                  </div>
                  <span className="text-xl" aria-hidden>
                    {doc.type?.includes("pdf") ? "📄" : "🖼️"}
                  </span>
                </div>

                <p className="text-xs text-gray-500">
                  Uploaded on {new Date(doc.uploadedAt).toLocaleString()}
                </p>

                <div className="flex flex-wrap gap-2 mt-auto">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPreviewDoc(doc)}
                  >
                    Preview
                  </Button>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => handleDownload(doc)}
                  >
                    Download
                  </Button>
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => handleDelete(doc.id)}
                  >
                    Delete
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      <Modal
        isOpen={Boolean(previewDoc)}
        onClose={() => setPreviewDoc(null)}
        title={previewDoc?.name || "Preview Document"}
        size="lg"
      >
        {previewDoc?.type?.includes("pdf") ? (
          <object
            data={previewDoc.url}
            type="application/pdf"
            className="w-full h-[70vh] border border-gray-200 rounded-lg"
          >
            <p className="text-center text-gray-500 py-8">
              Unable to preview this PDF. Please use the download option
              instead.
            </p>
          </object>
        ) : (
          <img
            src={previewDoc?.url}
            alt={previewDoc?.name}
            className="w-full h-auto rounded-lg"
          />
        )}
      </Modal>
    </div>
  );
};

export default MyDocuments;
