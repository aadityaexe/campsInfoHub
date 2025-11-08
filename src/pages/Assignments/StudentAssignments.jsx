import { useState, useEffect } from "react";
import { assignmentsAPI } from "../../api/api";
import { getItemId, formatDate, groupBy } from "../../utils/helpers";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import Table from "../../components/ui/Table";
import PageHeader from "../../components/common/PageHeader";
import LoadingWrapper from "../../components/common/LoadingWrapper";
import ErrorAlert from "../../components/common/ErrorAlert";
import StatusBadge from "../../components/common/StatusBadge";
import Modal from "../../components/ui/Modal";
import {
  DOCUMENT_FILE_TYPES,
  describeAttachmentType,
  filesToAttachments,
  isFileSizeValid,
  isFileTypeAllowed,
} from "../../utils/file";

const MAX_FILE_SIZE_MB = 10;

const StudentAssignments = () => {
  const [assignments, setAssignments] = useState([]);
  const [groupedAssignments, setGroupedAssignments] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [activeAssignment, setActiveAssignment] = useState(null);
  const [submissionFiles, setSubmissionFiles] = useState([]);
  const [submissionNotes, setSubmissionNotes] = useState("");
  const [submissionError, setSubmissionError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchAssignments();
  }, []);

  /**
   * Group assignments by course using utility function
   * Memoized to prevent unnecessary recalculations
   */
  useEffect(() => {
    // Normalize course name before grouping
    const normalized = assignments.map((a) => ({
      ...a,
      courseName: a.courseName || a.course || "Other",
    }));
    const grouped = groupBy(normalized, "courseName");
    setGroupedAssignments(grouped);
  }, [assignments]);

  const fetchAssignments = async () => {
    try {
      setLoading(true);
      const response = await assignmentsAPI.getAll();
      setAssignments(response.data || []);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to fetch assignments");
    } finally {
      setLoading(false);
    }
  };

  const handleOpenSubmitModal = (assignment) => {
    setActiveAssignment(assignment);
    setSubmissionFiles([...(assignment.studentSubmission?.attachments || [])]);
    setSubmissionNotes(assignment.studentSubmission?.notes || "");
    setSubmissionError("");
    setShowSubmitModal(true);
  };

  const resetSubmissionState = () => {
    setShowSubmitModal(false);
    setActiveAssignment(null);
    setSubmissionFiles([]);
    setSubmissionNotes("");
    setSubmissionError("");
  };

  const handleFileChange = async (event) => {
    const files = Array.from(event.target.files || []);
    if (files.length === 0) {
      return;
    }

    for (const file of files) {
      if (!isFileTypeAllowed(file, DOCUMENT_FILE_TYPES)) {
        setSubmissionError("Only PDF, JPG, and PNG files are allowed.");
        return;
      }
      if (!isFileSizeValid(file, MAX_FILE_SIZE_MB)) {
        setSubmissionError(
          `Files must be smaller than ${MAX_FILE_SIZE_MB} MB.`
        );
        return;
      }
    }

    try {
      const processed = await filesToAttachments(files, {
        prefix: "submissionFile",
      });

      setSubmissionFiles((prev) => [...prev, ...processed]);
      setSubmissionError("");
      event.target.value = "";
    } catch (error) {
      console.error("Failed to process files", error);
      setSubmissionError("Failed to process selected files. Please try again.");
    }
  };

  const handleRemoveSubmissionFile = (fileId) => {
    setSubmissionFiles((prev) => prev.filter((file) => file.id !== fileId));
  };

  const handleSubmitAssignment = async () => {
    if (!activeAssignment) return;
    if (submissionFiles.length === 0) {
      setSubmissionError("Please attach at least one file.");
      return;
    }

    try {
      setSubmitting(true);
      setSubmissionError("");
      await assignmentsAPI.submit(getItemId(activeAssignment), {
        attachments: submissionFiles,
        notes: submissionNotes,
      });
      resetSubmissionState();
      fetchAssignments();
    } catch (err) {
      setSubmissionError(
        err.response?.data?.message || "Failed to submit assignment."
      );
    } finally {
      setSubmitting(false);
    }
  };

  const headers = [
    "Title",
    "Due Date",
    "Resources",
    "Status",
    "Submission",
    "Actions",
  ];

  /**
   * Render table row for assignment
   */
  const renderRow = (assignment) => {
    const assignmentId = getItemId(assignment);
    return (
      <tr key={assignmentId}>
        <td className="px-6 py-4 text-sm font-medium text-gray-900">
          {assignment.title}
        </td>
        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
          {formatDate(assignment.dueDate)}
        </td>
        <td className="px-6 py-4 whitespace-nowrap text-sm">
          {assignment.attachments?.length ? (
            <div className="space-y-1">
              {assignment.attachments.slice(0, 3).map((attachment) => (
                <a
                  key={attachment.id}
                  href={attachment.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block text-primary-600 hover:text-primary-700 underline"
                >
                  {attachment.name}
                </a>
              ))}
              {assignment.attachments.length > 3 && (
                <p className="text-xs text-gray-500">
                  +{assignment.attachments.length - 3} more file(s)
                </p>
              )}
            </div>
          ) : (
            <span className="text-gray-400">No files</span>
          )}
        </td>
        <td className="px-6 py-4 whitespace-nowrap">
          <StatusBadge
            status={assignment.submitted ? "submitted" : "pending"}
          />
        </td>
        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
          {assignment.studentSubmission ? (
            <div className="space-y-1">
              <p>
                Submitted on{" "}
                {formatDate(assignment.studentSubmission.submittedAt)}
              </p>
              {assignment.studentSubmission.attachments?.map((attachment) => (
                <a
                  key={attachment.id}
                  href={attachment.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block text-primary-600 hover:text-primary-700 underline"
                >
                  {attachment.name}
                </a>
              ))}
            </div>
          ) : (
            <span className="text-gray-400">No submission</span>
          )}
        </td>
        <td className="px-6 py-4 whitespace-nowrap text-sm">
          {!assignment.submitted && (
            <Button
              variant="primary"
              size="sm"
              onClick={() => handleOpenSubmitModal(assignment)}
            >
              Submit
            </Button>
          )}
          {assignment.submitted && (
            <Button
              variant="secondary"
              size="sm"
              onClick={() => handleOpenSubmitModal(assignment)}
            >
              Update Submission
            </Button>
          )}
        </td>
      </tr>
    );
  };

  return (
    <>
      <LoadingWrapper loading={loading}>
        <div className="container-custom py-8">
          <PageHeader
            title="My Assignments"
            description="View and submit your assignments grouped by course"
          />

          <ErrorAlert message={error} onDismiss={() => setError("")} />

          {Object.keys(groupedAssignments).length === 0 ? (
            <Card>
              <p className="text-center text-gray-500 py-8">
                No assignments available
              </p>
            </Card>
          ) : (
            <div className="space-y-6">
              {Object.entries(groupedAssignments).map(
                ([courseName, courseAssignments]) => (
                  <Card key={courseName}>
                    <h2 className="text-xl font-bold text-gray-900 mb-4 pb-2 border-b border-gray-200">
                      {courseName || "Other"}
                    </h2>
                    <Table
                      headers={headers}
                      data={courseAssignments}
                      renderRow={renderRow}
                    />
                  </Card>
                )
              )}
            </div>
          )}
        </div>
      </LoadingWrapper>

      <Modal
        isOpen={showSubmitModal}
        onClose={() => {
          if (!submitting) {
            resetSubmissionState();
          }
        }}
        title={
          activeAssignment
            ? `Submit: ${activeAssignment.title}`
            : "Submit Assignment"
        }
      >
        <div className="space-y-4">
          {submissionError && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              {submissionError}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Upload Files (PDF, JPG, PNG)
            </label>
            <input
              type="file"
              accept=".pdf,image/jpeg,image/png"
              multiple
              onChange={handleFileChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
              disabled={submitting}
            />
            <p className="text-xs text-gray-500 mt-1">
              Maximum file size {MAX_FILE_SIZE_MB} MB per file.
            </p>
            {submissionFiles.length > 0 && (
              <div className="mt-3 space-y-2">
                {submissionFiles.map((file) => (
                  <div
                    key={file.id}
                    className="flex items-center justify-between bg-gray-100 border border-gray-200 rounded-lg px-3 py-2"
                  >
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-gray-800 truncate">
                        {file.name}
                      </p>
                      <p className="text-xs text-gray-500">
                        {describeAttachmentType(file.type)}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveSubmissionFile(file.id)}
                      className="text-xs text-red-600 hover:text-red-700"
                      disabled={submitting}
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Notes (optional)
            </label>
            <textarea
              rows={3}
              value={submissionNotes}
              onChange={(event) => setSubmissionNotes(event.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
              placeholder="Add any details you want to share with your instructor"
              disabled={submitting}
            />
          </div>

          <div className="flex justify-end gap-3">
            <Button
              variant="secondary"
              onClick={() => {
                if (!submitting) {
                  resetSubmissionState();
                }
              }}
              disabled={submitting}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleSubmitAssignment}
              disabled={submitting}
            >
              {submitting ? "Submitting..." : "Submit Assignment"}
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
};

export default StudentAssignments;
