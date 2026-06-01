import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

/**
 * ReportButton
 *
 * Uses a React Portal so the dropdown escapes any ancestor
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
    "Misleading Content",
    "Inappropriate / Adult Content",
    "Copyright Violation",
    "Spam",
    "Hate Speech",
    "Other",
  ],
  creator: [
    "Spam Account",
    "Hate Speech",
    "Harassment",
    "Fake / Impersonation",
    "Inappropriate Content",
    "Other",
  ],
  user: [
    "Spam Account",
    "Hate Speech",
    "Harassment",
    "Fake / Impersonation",
    "Inappropriate Content",
    "Other",
  ],
  comment: [
    "Spam",
    "Hate Speech",
    "Harassment",
    "Inappropriate Language",
    "Misinformation",
    "Other",
  ],
};

// ── Portal dropdown rendered into document.body ──────────────────────────────
function ReportDropdown({ anchorRect, onClose, targetType, targetId, list }) {
  const [selected, setSelected] = useState(null);
  const [submitted, setSubmitted] = useState(false);
  const dropdownRef = useRef(null);

  // Smart flip positioning:
  // The dropdown is ~340px tall at most. If there isn't enough space below
  // the button, flip it to open upward instead.
  const DROPDOWN_HEIGHT = 340;
  const GAP = 6;
  const spaceBelow = window.innerHeight - anchorRect.bottom;
  const openUpward = spaceBelow < DROPDOWN_HEIGHT && anchorRect.top > DROPDOWN_HEIGHT;

  const style = {
    position: "fixed",
    ...(openUpward
      ? { bottom: window.innerHeight - anchorRect.top + GAP }
      : { top: anchorRect.bottom + GAP }),
    right: window.innerWidth - anchorRect.right,
    width: 248,
    zIndex: 99999,
  };

  // Close on outside click
  useEffect(() => {
    function handler(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        onClose();
      }
    }
    // Delay to avoid the same click that opened it from closing it
    const id = setTimeout(() => document.addEventListener("mousedown", handler), 0);
    return () => {
      clearTimeout(id);
      document.removeEventListener("mousedown", handler);
    };
  }, [onClose]);

  // Close on Escape
  useEffect(() => {
    function handler(e) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [onClose]);

  const handleSubmit = () => {
    if (!selected) return;
    // TODO: wire up to backend /api/report endpoint
    console.info("[Report]", { targetType, targetId, reason: selected });
    setSubmitted(true);
    setTimeout(() => onClose(), 1800);
  };

  return createPortal(
    <div
      ref={dropdownRef}
      style={style}
      className="overflow-hidden rounded-2xl border border-slate-700/80 bg-[#0c1024] shadow-2xl"
    >
      {submitted ? (
        <div className="flex flex-col items-center gap-2 px-4 py-6 text-center">
          <span className="text-2xl">✅</span>
          <p className="text-sm font-black text-white">Report Submitted</p>
          <p className="text-xs text-slate-400">
            Thanks for helping keep the community safe.
          </p>
        </div>
      ) : (
        <>
          {/* Header */}
          <div className="flex items-center justify-between border-b border-slate-800 px-4 py-3">
            <div className="flex items-center gap-2">
              {/* Flag icon */}
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-4 w-4 text-rose-400"
                aria-hidden="true"
              >
                <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z" />
                <line x1="4" y1="22" x2="4" y2="15" />
              </svg>
              <h3 className="text-sm font-black text-white">Report</h3>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="rounded-md p-0.5 text-slate-500 transition hover:text-slate-200"
              aria-label="Close"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4"
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

          {/* Sub-header */}
          <p className="px-4 pb-1 pt-3 text-[11px] font-bold uppercase tracking-widest text-slate-500">
            Select a reason
          </p>

          {/* Reason list */}
          <ul className="px-2 pb-2">
            {list.map((reason) => (
              <li key={reason}>
                <button
                  type="button"
                  onClick={() => setSelected(reason)}
                  className={`flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-left text-sm transition ${
                    selected === reason
                      ? "bg-rose-500/20 font-bold text-rose-300"
                      : "text-slate-300 hover:bg-slate-800/70 hover:text-white"
                  }`}
                >
                  <span
                    className={`mt-0.5 h-3.5 w-3.5 shrink-0 rounded-full border-2 transition ${
                      selected === reason
                        ? "border-rose-400 bg-rose-400"
                        : "border-slate-600"
                    }`}
                  />
                  {reason}
                </button>
              </li>
            ))}
          </ul>

          {/* Submit */}
          <div className="border-t border-slate-800 px-3 py-3">
            <button
              type="button"
              onClick={handleSubmit}
              disabled={!selected}
              className="h-9 w-full rounded-xl bg-rose-600 text-sm font-black text-white transition hover:bg-rose-500 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Submit Report
            </button>
          </div>
        </>
      )}
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
  const [anchorRect, setAnchorRect] = useState(null);
  const triggerRef = useRef(null);

  const list = reasons ?? DEFAULT_REASONS[targetType] ?? DEFAULT_REASONS.prompt;

  const handleToggle = () => {
    if (!open && triggerRef.current) {
      // Capture button position before opening
      setAnchorRect(triggerRef.current.getBoundingClientRect());
    }
    setOpen((v) => !v);
  };

  return (
    <>
      {/* Flag trigger button */}
      <button
        ref={triggerRef}
        type="button"
        onClick={handleToggle}
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

      {/* Portal dropdown — renders into document.body, never clipped */}
      {open && anchorRect && (
        <ReportDropdown
          anchorRect={anchorRect}
          onClose={() => setOpen(false)}
          targetType={targetType}
          targetId={targetId}
          list={list}
        />
      )}
    </>
  );
}
