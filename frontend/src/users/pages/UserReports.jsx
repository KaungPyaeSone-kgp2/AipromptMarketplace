import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { fetchReports, clearReportApi } from "../services/reportService.js";
import { getCurrentUserId } from "../services/currentUser.js";

const ReportCard = ({ report, isReceived, onClear }) => {
  const navigate = useNavigate();

  const formatTimeAgo = (dateStr) => {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now - date;
    const diffMin = Math.floor(diffMs / 60000);
    const diffHr = Math.floor(diffMs / 3600000);
    const diffDay = Math.floor(diffMs / 86400000);

    if (diffMin < 1) return "Just now";
    if (diffMin < 60) return `${diffMin}m ago`;
    if (diffHr < 24) return `${diffHr}h ago`;
    if (diffDay < 7) return `${diffDay}d ago`;
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: date.getFullYear() !== now.getFullYear() ? "numeric" : undefined });
  };

  const getTargetLabel = () => {
    switch (report.target_type) {
      case "prompt": return `Prompt: ${report.prompt_title || "Unknown"}`;
      case "user": return isReceived ? "Your Account" : `User: ${report.reported_username || "Unknown"}`;
      case "comment": return isReceived ? "Your Review" : `Review: "${report.review_text?.substring(0, 30)}..."`;
      default: return "Unknown Target";
    }
  };

  const handleCardClick = (e) => {
    if (e.target.closest("button")) return;

    if (report.target_type === "prompt" || report.target_type === "comment") {
      const promptId = report.prompt_id || report.promptId || report.target_id;
      if (promptId) navigate(`/user/prompt/${promptId}`);
    } else if (report.target_type === "user") {
      const userId = report.reported_user_id || report.target_id || report.reportedUserId;
      if (userId) navigate(`/user/profile/${userId}`);
    }
  };

  return (
    <div
      onClick={handleCardClick}
      className="surface overflow-hidden p-5 transition hover:-translate-y-0.5 hover:border-violet-400/40 rounded-2xl border border-slate-400/50 dark:border-slate-700/50 bg-slate-100/80 dark:bg-slate-900/80 cursor-pointer"
    >
      <div className="flex items-start justify-between gap-3">
        <h3 className="text-base font-bold text-slate-900 dark:text-white">
          {getTargetLabel()}
        </h3>
        <div className="flex items-center gap-2">
          <span className={`badge-pill px-3 py-1 rounded-full text-xs font-bold ${report.status === 'pending' ? 'bg-amber-500/15 text-amber-300' :
            report.status === 'resolved' ? 'bg-emerald-500/15 text-emerald-300' :
              report.status === 'rejected' ? 'bg-rose-500/15 text-rose-700 dark:text-rose-300' :
                'bg-blue-500/15 text-blue-300'
            }`}>
            {report.status}
          </span>
          {onClear && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onClear(report.id, report.target_type, report.status);
              }}
              className="text-slate-400 hover:text-rose-500 transition-colors"
              title="Clear"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
            </button>
          )}
        </div>
      </div>

      <div className="mt-4 p-4 rounded-xl bg-slate-200/50 dark:bg-slate-800/50 border border-slate-400/50 dark:border-slate-700/50">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-violet-500/20 text-violet-700 dark:text-violet-300 ring-2 ring-violet-500/50 dark:ring-violet-500/30">
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            </div>
            <div>
              <p className="text-sm font-bold text-violet-800 dark:text-violet-200">
                {report.target_type.charAt(0).toUpperCase() + report.target_type.slice(1)} Report
              </p>
              <p className="text-xs text-slate-600 dark:text-slate-400">{formatTimeAgo(report.created_at)}</p>
            </div>
          </div>
        </div>
        <p className="text-sm text-slate-700 dark:text-slate-300 mb-2"><span className="font-bold text-slate-600 dark:text-slate-400">Reason:</span> {report.reason.replace("_", " ")}</p>
        {report.report_description && (
          <p className="text-sm text-slate-700 dark:text-slate-300 italic">"{report.report_description}"</p>
        )}
      </div>
    </div>
  );
};

export default function UserReports() {
  const [reports, setReports] = useState({ submitted: [], received: [] });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("submitted");

  const loadData = React.useCallback(async () => {
    try {
      const userId = getCurrentUserId();
      if (userId) {
        const data = await fetchReports(userId);
        if (data.success) {
          setReports({
            submitted: data.submitted,
            received: data.received
          });
        }
      }
    } catch (error) {
      console.error("Failed to fetch reports:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();

    const handleUpdate = () => {
      loadData();
    };

    window.addEventListener("promptai:force-notification-update", handleUpdate);
    return () => {
      window.removeEventListener("promptai:force-notification-update", handleUpdate);
    };
  }, [loadData]);

  const clearReport = async (id, targetType, status, isReceived) => {
    try {
      await clearReportApi(id, targetType, isReceived, status);
      setReports(prev => ({
        submitted: prev.submitted.filter(r => isReceived ? true : r.id !== id),
        received: prev.received.filter(r => isReceived ? r.id !== id : true)
      }));
    } catch (err) {
      console.error("Failed to clear report:", err);
    }
  };

  const clearAllReports = async () => {
    try {
      const isReceived = activeTab === "received";
      await Promise.all(currentList.map(r => clearReportApi(r.id, r.target_type, isReceived, r.status)));
      setReports(prev => ({
        ...prev,
        [activeTab]: []
      }));
    } catch (err) {
      console.error("Failed to clear all reports:", err);
    }
  };

  const currentList = activeTab === "submitted" ? reports.submitted : reports.received;

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-4xl font-black text-violet-600 dark:text-violet-400">
          Reports
        </h1>
        <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
          Manage and track the status of your submitted reports and reports against your account.
        </p>
      </div>

      <div className="flex gap-2 justify-between items-center">
        <div className="flex gap-2">
          <button
            onClick={() => setActiveTab("submitted")}
            className={`rounded-full px-4 py-1.5 text-sm font-bold transition-all ${activeTab === "submitted"
              ? "bg-violet-600 text-slate-900 dark:text-white"
              : "bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-700 hover:text-white"
              }`}
          >
            Submitted ({reports.submitted.length})
          </button>
          <button
            onClick={() => setActiveTab("received")}
            className={`rounded-full px-4 py-1.5 text-sm font-bold transition-all ${activeTab === "received"
              ? "bg-violet-600 text-slate-900 dark:text-white"
              : "bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-700 hover:text-white"
              }`}
          >
            Against Me ({reports.received.length})
          </button>
        </div>

        {currentList.length > 0 && (
          <button onClick={clearAllReports} className="text-xs font-bold text-rose-500 hover:text-rose-600 transition-colors">
            Clear All
          </button>
        )}
      </div>

      {loading ? (
        <div className="glass-panel p-10 text-center text-sm text-slate-600 dark:text-slate-400">
          Loading reports...
        </div>
      ) : currentList.length > 0 ? (
        <div className="space-y-6">
          {currentList.map(report => (
            <ReportCard key={`${report.target_type}-${report.id}`} report={report} isReceived={activeTab === 'received'} onClear={(id, targetType, status) => clearReport(id, targetType, status, activeTab === 'received')} />
          ))}
        </div>
      ) : (
        <div className="glass-panel p-10 text-center text-sm text-slate-600 dark:text-slate-400">
          No reports found in this section.
        </div>
      )}
    </div>
  );
}
