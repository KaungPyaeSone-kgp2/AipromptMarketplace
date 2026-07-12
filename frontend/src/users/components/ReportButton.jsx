import { useEffect, useMemo, useState, useRef } from "react";
import { createPortal } from "react-dom";
import { getCurrentUserId } from "../services/currentUser.js";
import { submitReport } from "../services/reportService.js";

/**
 * ReportButton
 *
 * Uses a React Portal so the modal escapes any ancestor
 * overflow:hidden / stacking-context clipping, regardless of z-index.
 *
 * Props:
 *   targetType  – "prompt" | "creator" | "user" | "comment"
 *   targetId    – id of the thing being reported
 *   reasons     – optional string[] to override default reasons
 *   className   – extra classes on the trigger button
 */

const DEFAULT_REASONS = {
  prompt: [
    { value: "spam", label: "Spam" },
    { value: "copyright", label: "Copyright Violation" },
    { value: "nsfw", label: "NSFW / Adult Content" },
    { value: "fake", label: "Fake Content" },
    { value: "other", label: "Other" },
  ],
  creator: [
    { value: "spam", label: "Spam Account" },
    { value: "scam", label: "Scam" },
    { value: "harassment", label: "Harassment" },
    { value: "fake_account", label: "Fake / Impersonation" },
    { value: "copyright", label: "Copyright Violation" },
    { value: "abuse", label: "Abuse" },
    { value: "other", label: "Other" },
  ],
  user: [
    { value: "spam", label: "Spam Account" },
    { value: "scam", label: "Scam" },
    { value: "harassment", label: "Harassment" },
    { value: "fake_account", label: "Fake / Impersonation" },
    { value: "copyright", label: "Copyright Violation" },
    { value: "abuse", label: "Abuse" },
    { value: "other", label: "Other" },
  ],
  comment: [
    { value: "spam", label: "Spam" },
    { value: "fake_review", label: "Fake Review" },
    { value: "harassment", label: "Harassment" },
    { value: "offensive_language", label: "Offensive Language" },
    { value: "irrelevant", label: "Irrelevant" },
    { value: "misleading", label: "Misleading" },
    { value: "duplicate", label: "Duplicate" },
    { value: "other", label: "Other" },
  ],
};

// ── Portal Modal rendered into document.body ──────────────────────────────
function ReportModal({ onClose, targetType, targetId, list }) {
  const [selected, setSelected] = useState(list[0]);
  const [description, setDescription] = useState("");
  const [imageEvidence, setImageEvidence] = useState(null);
  const fileInputRef = useRef(null);

  // Generate a stable preview URL for the selected image
  const previewUrl = useMemo(() => {
    if (!imageEvidence) return null;
    const url = URL.createObjectURL(imageEvidence);
    return url;
  }, [imageEvidence]);

  // Revoke preview URL on change / unmount to prevent memory leaks
  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  // Close on Escape
  useEffect(() => {
    function handler(e) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [onClose]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selected || submitting) return;
    setSubmitting(true);
    setError("");

    try {
      await submitReport({
        targetType,
        targetId,
        reason: selected.value,
        reporterId: getCurrentUserId(),
        description: selected.value === "other" ? description : undefined,
        imageEvidence,
      });
      
      // Dispatch event to force notification count to update immediately
      window.dispatchEvent(new Event("promptai:force-notification-update"));
      
      setSubmitted(true);
      setTimeout(() => onClose(), 1800);
    } catch (err) {
      setError(err.message || "Failed to submit report.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return createPortal(
    <div
      className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
      onMouseDown={handleBackdropClick}
    >
      <div className="w-full max-w-md overflow-hidden rounded-2xl border border-slate-400/80 dark:border-slate-700/80 bg-[#0c1024] shadow-2xl">
        {submitted ? (
          <div className="flex flex-col items-center gap-2 px-4 py-8 text-center">
            <span className="text-4xl">✅</span>
            <p className="mt-2 text-lg font-black text-slate-900 dark:text-white">Report Submitted</p>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Thanks for helping keep the community safe.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-300 dark:border-slate-800 px-5 py-4">
              <div className="flex items-center gap-2">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-5 w-5 text-rose-600 dark:text-rose-400"
                  aria-hidden="true"
                >
                  <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z" />
                  <line x1="4" y1="22" x2="4" y2="15" />
                </svg>
                <h3 className="text-base font-black text-slate-900 dark:text-white">Submit a Report</h3>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="rounded-md p-1 text-slate-500 transition hover:bg-slate-800 hover:text-slate-200"
                aria-label="Close"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2.5}
                  strokeLinecap="round"
                >
                  <path d="M18 6 6 18M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="flex flex-col gap-4 p-5 max-h-[70vh] overflow-y-auto custom-scrollbar">
              {/* Reason */}
              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                  Reason for reporting
                </label>
                <div className="rounded-xl border border-slate-400/80 dark:border-slate-700/80 bg-slate-800/20 p-2">
                  <ul className="flex flex-col gap-1 max-h-40 overflow-y-auto custom-scrollbar">
                    {list.map((reason) => (
                      <li key={reason.value}>
                        <button
                          type="button"
                          onClick={() => setSelected(reason)}
                          className={`flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-left text-sm transition ${
                            selected?.value === reason.value
                              ? "bg-rose-500/20 font-bold text-rose-700 dark:text-rose-300"
                              : "text-slate-700 dark:text-slate-300 hover:bg-slate-800/70 hover:text-white"
                          }`}
                        >
                          <span
                            className={`mt-0.5 h-3.5 w-3.5 shrink-0 rounded-full border-2 transition ${
                              selected?.value === reason.value
                                ? "border-rose-400 bg-rose-400"
                                : "border-slate-600"
                            }`}
                          />
                          {reason.label}
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Description (Only show if "Other" is selected) */}
              {selected?.value === "other" && (
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                    Description (Optional)
                  </label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Provide more details about the issue..."
                    className="w-full resize-none rounded-xl border border-slate-400 dark:border-slate-700 bg-slate-200/50 dark:bg-slate-800/50 px-3 py-3 text-sm text-slate-800 dark:text-slate-200 outline-none transition focus:border-rose-500 focus:ring-1 focus:ring-rose-500"
                    rows={4}
                  />
                </div>
              )}

              {/* Image Evidence */}
              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                  Evidence Image (Optional)
                </label>
                <div className="relative flex items-center gap-3 group/evidence">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        setImageEvidence(e.target.files[0]);
                      } else {
                        setImageEvidence(null);
                      }
                    }}
                    className="block w-full text-sm text-slate-600 dark:text-slate-400 file:mr-4 file:rounded-full file:border-0 file:bg-rose-500/10 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-rose-400 hover:file:bg-rose-500/20"
                  />
                  {imageEvidence && (
                    <button
                      type="button"
                      onClick={() => {
                        setImageEvidence(null);
                        if (fileInputRef.current) fileInputRef.current.value = "";
                      }}
                      className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400 transition hover:bg-rose-500/20 hover:text-rose-400"
                      title="Remove image"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth={2.5}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <line x1="18" y1="6" x2="6" y2="18" />
                        <line x1="6" y1="6" x2="18" y2="18" />
                      </svg>
                    </button>
                  )}
                  {/* Hover image preview tooltip */}
                  {imageEvidence && (
                    <div className="pointer-events-none absolute bottom-full left-1/2 z-50 mb-3 -translate-x-1/2 opacity-0 transition-opacity duration-200 group-hover/evidence:opacity-100">
                      <div className="overflow-hidden rounded-xl border border-slate-600/80 bg-slate-100 dark:bg-slate-900 p-1.5 shadow-2xl shadow-black/40">
                        <img
                          src={previewUrl}
                          alt="Evidence preview"
                          className="block max-h-[200px] max-w-[200px] rounded-lg object-contain"
                        />
                        <p className="mt-1 truncate text-center text-[10px] font-medium text-slate-600 dark:text-slate-400" style={{ maxWidth: 200 }}>
                          {imageEvidence.name}
                        </p>
                      </div>
                      {/* Arrow */}
                      <div className="mx-auto h-0 w-0 border-x-8 border-t-8 border-x-transparent border-t-slate-600/80" />
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Error message */}
            {error && (
              <div className="px-5 pb-2">
                <p className="rounded-lg bg-rose-500/10 p-2.5 text-xs font-semibold text-rose-600 dark:text-rose-400">
                  {error}
                </p>
              </div>
            )}

            {/* Submit */}
            <div className="border-t border-slate-300 dark:border-slate-800 bg-slate-100/50 dark:bg-slate-900/50 px-5 py-4">
              <button
                type="submit"
                disabled={!selected || submitting}
                className="flex w-full items-center justify-center rounded-xl bg-rose-600 px-4 py-3 text-sm font-black text-slate-900 dark:text-white transition hover:bg-rose-500 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {submitting ? (
                  <span className="flex items-center gap-2">
                    <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24">
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                        fill="none"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                    Submitting...
                  </span>
                ) : (
                  "Submit Report"
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>,
    document.body
  );
}

// ── Main export ───────────────────────────────────────────────────────────────
export default function ReportButton({
  targetType = "prompt",
  targetId,
  reasons,
  className = "",
}) {
  const [open, setOpen] = useState(false);

  const list = reasons ?? DEFAULT_REASONS[targetType] ?? DEFAULT_REASONS.prompt;

  return (
    <>
      {/* Flag trigger button */}
      <button
        type="button"
        onClick={() => setOpen(true)}
        title="Report"
        aria-label="Report"
        className={`flex h-8 w-8 items-center justify-center rounded-full text-slate-500 transition hover:bg-rose-500/15 hover:text-rose-400 focus:outline-none ${className}`}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
          className="h-4 w-4"
          aria-hidden="true"
        >
          <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z" />
          <line x1="4" y1="22" x2="4" y2="15" />
        </svg>
      </button>

      {/* Portal Modal */}
      {open && (
        <ReportModal
          onClose={() => setOpen(false)}
          targetType={targetType}
          targetId={targetId}
          list={list}
        />
      )}
    </>
  );
}
