// import { useState, useEffect, useMemo } from "react";
// import {
//   Eye,
//   X,
//   Filter,
//   ChevronDown,
//   CheckCircle,
//   XCircle,
// } from "lucide-react";
// import { motion } from "framer-motion";

// export default function BadReviewReports() {
//   const [reports, setReports] = useState([]);
//   const [statusFilter, setStatusFilter] = useState("All");
//   const [isDropdownOpen, setIsDropdownOpen] = useState(false);
//   const [selectedReport, setSelectedReport] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);

//   // Fetch full dataset once from the backend
//   useEffect(() => {
//     const fetchReports = async () => {
//       setLoading(true);
//       setError(null);
//       try {
//         const response = await fetch("/api/admin/get-bad-review-reports.php", {
//           method: "POST",
//           headers: {
//             "Content-Type": "application/json",
//           },
//         });

//         if (!response.ok) {
//           throw new Error(
//             "Failed to fetch bad review reports from the backend.",
//           );
//         }

//         const json = await response.json();
//         if (json.success) {
//           setReports(json.data.reports);
//         } else {
//           throw new Error(json.message || "Unknown API Error");
//         }
//       } catch (err) {
//         setError(err.message);
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchReports();
//   }, []);

//   // Update status function (handles DB and UI)
//   const updateReportStatus = async (id, newStatus) => {
//     // 1. Optimistic UI Update
//     setReports((prev) =>
//       prev.map((r) => (r.id === id ? { ...r, status: newStatus } : r)),
//     );
//     if (selectedReport && selectedReport.id === id) {
//       setSelectedReport((prev) => ({ ...prev, status: newStatus }));
//     }

//     // 2. Server request
//     try {
//       const response = await fetch(
//         "/api/admin/update-bad-review-report-status.php",
//         {
//           method: "POST",
//           headers: {
//             "Content-Type": "application/json",
//           },
//           body: JSON.stringify({ id, status: newStatus }),
//         },
//       );

//       if (!response.ok) {
//         throw new Error("Failed to update status on the server.");
//       }

//       const json = await response.json();
//       if (!json.success) {
//         console.error("Backend error updating status:", json.message);
//       }
//     } catch (err) {
//       console.error("Network error updating status:", err);
//     }
//   };

//   // Handle opening report & auto-changing to reviewed
//   const handleOpenReport = (report) => {
//     setSelectedReport(report);

//     // Auto-update to reviewed if currently pending
//     if (report.status?.toLowerCase() === "pending") {
//       updateReportStatus(report.id, "reviewed");
//     }
//   };

//   // Filter on the client-side to take advantage of backend caching
//   const filteredReports = useMemo(() => {
//     if (statusFilter === "All") return reports;
//     return reports.filter(
//       (r) => r.status.toLowerCase() === statusFilter.toLowerCase(),
//     );
//   }, [reports, statusFilter]);

//   const getStatusColor = (status) => {
//     switch (status?.toLowerCase()) {
//       case "pending":
//         return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30";
//       case "reviewed":
//         return "bg-blue-500/20 text-blue-400 border-blue-500/30";
//       case "resolved":
//         return "bg-green-500/20 text-green-400 border-green-500/30";
//       case "rejected":
//         return "bg-red-500/20 text-red-400 border-red-500/30";
//       default:
//         return "bg-gray-500/20 text-gray-400";
//     }
//   };

//   return (
//     <div className="w-full min-h-screen text-gray-300 relative">
//       <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
//         <h1 className="text-2xl font-bold text-white">Bad Review Reports</h1>

//         <div className="relative w-full sm:w-auto min-w-[160px]">
//           <button
//             onClick={() => setIsDropdownOpen(!isDropdownOpen)}
//             className={`w-full flex items-center justify-between bg-black/20 border rounded-lg pl-9 pr-4 py-2.5 text-sm text-gray-200 transition-colors cursor-pointer outline-none ${
//               isDropdownOpen ? "border-[#60A5FA]" : "border-white/10"
//             }`}
//           >
//             <Filter
//               className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
//               size={16}
//             />
//             <span>
//               {statusFilter === "All" ? "All Statuses" : `${statusFilter} Only`}
//             </span>
//             <ChevronDown
//               size={16}
//               className={`text-gray-400 transition-transform duration-200 ${isDropdownOpen ? "rotate-180" : ""}`}
//             />
//           </button>

//           {isDropdownOpen && (
//             <motion.div
//               initial={{ opacity: 0, y: -10 }}
//               animate={{ opacity: 1, y: 0 }}
//               className="absolute top-full left-0 w-full mt-2 bg-[#111827] border border-white/10 rounded-lg shadow-xl shadow-black/50 overflow-hidden z-50 backdrop-blur-md"
//             >
//               {["All", "Pending", "Reviewed", "Resolved", "Rejected"].map(
//                 (status) => (
//                   <button
//                     key={status}
//                     onClick={() => {
//                       setStatusFilter(status);
//                       setIsDropdownOpen(false);
//                     }}
//                     className={`w-full text-left px-4 py-2.5 text-sm transition-colors hover:bg-white/10 ${
//                       statusFilter === status
//                         ? "text-[#60A5FA] bg-white/5 font-medium"
//                         : "text-gray-300"
//                     }`}
//                   >
//                     {status === "All" ? "All Statuses" : `${status} Only`}
//                   </button>
//                 ),
//               )}
//             </motion.div>
//           )}
//           {isDropdownOpen && (
//             <div
//               className="fixed inset-0 z-40"
//               onClick={() => setIsDropdownOpen(false)}
//             />
//           )}
//         </div>
//       </div>

//       <div className="bg-[#111827]/80 backdrop-blur-md border border-white/10 rounded-2xl overflow-hidden shadow-xl">
//         <div className="overflow-x-auto">
//           <table className="w-full text-left border-collapse">
//             <thead>
//               <tr className="bg-white/5 text-gray-400 text-sm uppercase tracking-wider">
//                 <th className="p-4 font-medium">Reporter</th>
//                 <th className="p-4 font-medium">Reason</th>
//                 <th className="p-4 font-medium">Status</th>
//                 <th className="p-4 font-medium">Created At</th>
//                 <th className="p-4 font-medium text-center">Detail</th>
//               </tr>
//             </thead>
//             <tbody className="divide-y divide-white/5">
//               {loading ? (
//                 <tr>
//                   <td colSpan="5" className="p-8 text-center text-gray-400">
//                     <div className="flex justify-center items-center gap-2">
//                       <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-[#60A5FA]"></div>
//                       <span>Loading backend data...</span>
//                     </div>
//                   </td>
//                 </tr>
//               ) : error ? (
//                 <tr>
//                   <td
//                     colSpan="5"
//                     className="p-8 text-center text-red-400 font-medium"
//                   >
//                     Error: {error}
//                   </td>
//                 </tr>
//               ) : filteredReports.length === 0 ? (
//                 <tr>
//                   <td colSpan="5" className="p-8 text-center text-gray-500">
//                     No reports found.
//                   </td>
//                 </tr>
//               ) : (
//                 filteredReports.map((report) => (
//                   <tr
//                     key={report.id}
//                     className="hover:bg-white/5 transition-colors"
//                   >
//                     <td className="p-4 flex items-center gap-3">
//                       <img
//                         src={
//                           report.reporter_image ||
//                           "https://via.placeholder.com/150"
//                         }
//                         alt="Reporter"
//                         className="w-10 h-10 rounded-full border border-white/10 object-cover"
//                       />
//                       <span className="text-white font-medium">
//                         {report.reporter_name}
//                       </span>
//                     </td>
//                     <td className="p-4 capitalize">
//                       {report.reason ? report.reason.replace("_", " ") : ""}
//                     </td>
//                     <td className="p-4">
//                       <span
//                         className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(report.status)}`}
//                       >
//                         {report.status
//                           ? report.status.toUpperCase()
//                           : "UNKNOWN"}
//                       </span>
//                     </td>
//                     <td className="p-4 text-sm text-gray-400">
//                       {report.created_at
//                         ? new Date(report.created_at).toLocaleDateString()
//                         : "N/A"}
//                     </td>
//                     <td className="p-4 text-center">
//                       <button
//                         onClick={() => handleOpenReport(report)}
//                         className="p-2 hover:bg-white/10 rounded-lg transition-colors text-gray-400 hover:text-[#C4B5FD] inline-flex items-center justify-center"
//                         title="View Detail"
//                       >
//                         <Eye size={20} />
//                       </button>
//                     </td>
//                   </tr>
//                 ))
//               )}
//             </tbody>
//           </table>
//         </div>
//       </div>

//       {selectedReport && (
//         <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
//           <div className="bg-[#1f2937] border border-white/10 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl relative">
//             <button
//               onClick={() => setSelectedReport(null)}
//               className="absolute top-4 right-4 p-2 bg-white/5 hover:bg-white/10 rounded-full text-gray-400 transition"
//             >
//               <X size={20} />
//             </button>

//             <div className="p-6">
//               <h2 className="text-xl font-bold text-white mb-6">
//                 Bad Review Report Details
//               </h2>

//               <div className="grid grid-cols-2 gap-6 mb-6">
//                 <div className="bg-white/5 p-4 rounded-xl border border-white/5">
//                   <h3 className="text-xs uppercase text-gray-400 font-semibold mb-3">
//                     Reporter
//                   </h3>
//                   <div className="flex items-center gap-3">
//                     <img
//                       src={
//                         selectedReport.reporter_image ||
//                         "https://via.placeholder.com/150"
//                       }
//                       alt="Reporter"
//                       className="w-12 h-12 rounded-full border border-white/10 object-cover"
//                     />
//                     <span className="text-white font-medium">
//                       {selectedReport.reporter_name}
//                     </span>
//                   </div>
//                 </div>

//                 <div className="bg-orange-500/5 p-4 rounded-xl border border-orange-500/10">
//                   <h3 className="text-xs uppercase text-orange-400 font-semibold mb-3">
//                     Review Author
//                   </h3>
//                   <div className="flex items-center gap-3">
//                     <img
//                       src={
//                         selectedReport.review_author_image ||
//                         "https://via.placeholder.com/150"
//                       }
//                       alt="Reviewer"
//                       className="w-12 h-12 rounded-full border border-orange-500/20 object-cover"
//                     />
//                     <span className="text-white font-medium">
//                       {selectedReport.review_author_name}
//                     </span>
//                   </div>
//                 </div>
//               </div>

//               <div className="space-y-4 text-sm">
//                 <div className="border-b border-white/5 pb-3">
//                   <span className="text-gray-400 block mb-2">
//                     Original Review Text
//                   </span>
//                   <div className="text-white bg-black/30 p-4 rounded-lg font-mono text-sm border-l-2 border-orange-500">
//                     "{selectedReport.review_text || "No review text available."}
//                     "
//                   </div>
//                 </div>

//                 <div className="flex items-center justify-between border-b border-white/5 pb-3">
//                   <span className="text-gray-400">Reason</span>
//                   <span className="text-white capitalize font-medium">
//                     {selectedReport.reason
//                       ? selectedReport.reason.replace("_", " ")
//                       : ""}
//                   </span>
//                 </div>
//                 <div className="flex items-center justify-between border-b border-white/5 pb-3">
//                   <span className="text-gray-400">Status</span>
//                   <span
//                     className={`px-2 py-0.5 rounded text-xs border ${getStatusColor(selectedReport.status)}`}
//                   >
//                     {selectedReport.status
//                       ? selectedReport.status.toUpperCase()
//                       : "UNKNOWN"}
//                   </span>
//                 </div>
//                 <div className="flex items-center justify-between border-b border-white/5 pb-3">
//                   <span className="text-gray-400">Created At</span>
//                   <span className="text-white">
//                     {selectedReport.created_at
//                       ? new Date(selectedReport.created_at).toLocaleString()
//                       : "N/A"}
//                   </span>
//                 </div>

//                 <div className="border-b border-white/5 pb-3">
//                   <span className="text-gray-400 block mb-2">
//                     Report Description
//                   </span>
//                   <p className="text-gray-200 bg-black/20 p-3 rounded-lg leading-relaxed">
//                     {selectedReport.report_description ||
//                       "No description provided."}
//                   </p>
//                 </div>
//                 {selectedReport.image_evidence && (
//                   <div>
//                     <span className="text-gray-400 block mb-2">
//                       Evidence Image
//                     </span>
//                     <img
//                       src={selectedReport.image_evidence}
//                       alt="Evidence"
//                       className="w-full max-h-64 object-cover rounded-lg border border-white/10"
//                     />
//                   </div>
//                 )}
//               </div>

//               {/* Action Buttons - Only visible if status is strictly 'reviewed' */}
//               {selectedReport.status?.toLowerCase() === "reviewed" && (
//                 <div className="mt-6 pt-4 border-t border-white/5 flex justify-end gap-3">
//                   <button
//                     onClick={() =>
//                       updateReportStatus(selectedReport.id, "rejected")
//                     }
//                     className="flex items-center gap-2 px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 rounded-lg transition-colors font-medium text-sm"
//                   >
//                     <XCircle size={16} />
//                     Reject Report
//                   </button>
//                   <button
//                     onClick={() =>
//                       updateReportStatus(selectedReport.id, "resolved")
//                     }
//                     className="flex items-center gap-2 px-4 py-2 bg-green-500/10 hover:bg-green-500/20 text-green-400 border border-green-500/30 rounded-lg transition-colors font-medium text-sm"
//                   >
//                     <CheckCircle size={16} />
//                     Resolve Report
//                   </button>
//                 </div>
//               )}
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }

import { useState, useEffect, useMemo, useCallback } from "react";
import {
  Eye,
  X,
  Filter,
  ChevronDown,
  CheckCircle,
  XCircle,
  RefreshCw,
} from "lucide-react";
import { motion } from "framer-motion";

export default function BadReviewReports() {
  const [reports, setReports] = useState([]);
  const [statusFilter, setStatusFilter] = useState("All");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [selectedReport, setSelectedReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch function moved outside so it can be called by the refresh button
  const fetchReports = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/admin/get-bad-review-reports.php", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch bad review reports from the backend.");
      }

      const json = await response.json();
      if (json.success) {
        setReports(json.data.reports);
      } else {
        throw new Error(json.message || "Unknown API Error");
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch full dataset once from the backend on mount
  useEffect(() => {
    fetchReports();
  }, [fetchReports]);

  // Update status function (handles DB and UI)
  const updateReportStatus = async (id, newStatus) => {
    setReports((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status: newStatus } : r)),
    );
    if (selectedReport && selectedReport.id === id) {
      setSelectedReport((prev) => ({ ...prev, status: newStatus }));
    }

    try {
      const response = await fetch(
        "/api/admin/update-bad-review-report-status.php",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ id, status: newStatus }),
        },
      );

      if (!response.ok) {
        throw new Error("Failed to update status on the server.");
      }

      const json = await response.json();
      if (!json.success) {
        console.error("Backend error updating status:", json.message);
      }
    } catch (err) {
      console.error("Network error updating status:", err);
    }
  };

  const handleOpenReport = (report) => {
    setSelectedReport(report);
    if (report.status?.toLowerCase() === "pending") {
      updateReportStatus(report.id, "reviewed");
    }
  };

  const filteredReports = useMemo(() => {
    if (statusFilter === "All") return reports;
    return reports.filter(
      (r) => r.status.toLowerCase() === statusFilter.toLowerCase(),
    );
  }, [reports, statusFilter]);

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "pending":
        return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30";
      case "reviewed":
        return "bg-blue-500/20 text-blue-400 border-blue-500/30";
      case "resolved":
        return "bg-green-500/20 text-green-400 border-green-500/30";
      case "rejected":
        return "bg-red-500/20 text-red-400 border-red-500/30";
      default:
        return "bg-gray-500/20 text-gray-400";
    }
  };

  return (
    <div className="w-full min-h-screen text-gray-300 relative">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div className="flex flex-col sm:flex-row justify-between items-center mb-3 gap-4 w-full">
          <h1 className="text-2xl font-bold text-white">Bad Review Reports</h1>
          <div className="flex items-center justify-end gap-3 w-full sm:w-auto sm:ml-auto">
            {/* REFRESH BUTTON */}
            <button
              onClick={fetchReports}
              disabled={loading}
              className="p-2 bg-black/20 border border-white/10 rounded-lg hover:bg-white/10 transition-colors text-gray-400 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
              title="Refresh Reports"
            >
              <RefreshCw size={18} className={loading ? "animate-spin" : ""} />
            </button>
          </div>

          <div className="relative w-full sm:w-auto min-w-[160px]">
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className={`w-full flex items-center justify-between bg-black/20 border rounded-lg pl-9 pr-4 py-2.5 text-sm text-gray-200 transition-colors cursor-pointer outline-none ${isDropdownOpen ? "border-[#60A5FA]" : "border-white/10"
                }`}
            >
              <Filter
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                size={16}
              />
              <span>
                {statusFilter === "All"
                  ? "All Statuses"
                  : `${statusFilter} Only`}
              </span>
              <ChevronDown
                size={16}
                className={`text-gray-400 transition-transform duration-200 ${isDropdownOpen ? "rotate-180" : ""}`}
              />
            </button>

            {isDropdownOpen && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="absolute top-full left-0 w-full mt-2 bg-[#111827] border border-white/10 rounded-lg shadow-xl shadow-black/50 overflow-hidden z-50 backdrop-blur-md"
              >
                {["All", "Pending", "Reviewed", "Resolved", "Rejected"].map(
                  (status) => (
                    <button
                      key={status}
                      onClick={() => {
                        setStatusFilter(status);
                        setIsDropdownOpen(false);
                      }}
                      className={`w-full text-left px-4 py-2.5 text-sm transition-colors hover:bg-white/10 ${statusFilter === status
                          ? "text-[#60A5FA] bg-white/5 font-medium"
                          : "text-gray-300"
                        }`}
                    >
                      {status === "All" ? "All Statuses" : `${status} Only`}
                    </button>
                  ),
                )}
              </motion.div>
            )}
            {isDropdownOpen && (
              <div
                className="fixed inset-0 z-40"
                onClick={() => setIsDropdownOpen(false)}
              />
            )}
          </div>
        </div>
      </div>

      <div className="bg-[#111827]/80 backdrop-blur-md border border-white/10 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-white/5 text-gray-400 text-sm uppercase tracking-wider">
                <th className="p-4 font-medium">Reporter</th>
                <th className="p-4 font-medium">Reason</th>
                <th className="p-4 font-medium">Status</th>
                <th className="p-4 font-medium">Created At</th>
                <th className="p-4 font-medium text-center">Detail</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading ? (
                <tr>
                  <td colSpan="5" className="p-8 text-center text-gray-400">
                    <div className="flex justify-center items-center gap-2">
                      <RefreshCw
                        className="animate-spin text-[#60A5FA]"
                        size={20}
                      />
                      <span>Loading backend data...</span>
                    </div>
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td
                    colSpan="5"
                    className="p-8 text-center text-red-400 font-medium"
                  >
                    Error: {error}
                  </td>
                </tr>
              ) : filteredReports.length === 0 ? (
                <tr>
                  <td colSpan="5" className="p-8 text-center text-gray-500">
                    No reports found.
                  </td>
                </tr>
              ) : (
                filteredReports.map((report) => (
                  <tr
                    key={report.id}
                    className="hover:bg-white/5 transition-colors"
                  >
                    <td className="p-4 flex items-center gap-3">
                      <img
                        src={
                          report.reporter_image ||
                          "https://via.placeholder.com/150"
                        }
                        alt="Reporter"
                        className="w-10 h-10 rounded-full border border-white/10 object-cover"
                      />
                      <span className="text-white font-medium">
                        {report.reporter_name}
                      </span>
                    </td>
                    <td className="p-4 capitalize">
                      {report.reason ? report.reason.replace("_", " ") : ""}
                    </td>
                    <td className="p-4">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(report.status)}`}
                      >
                        {report.status
                          ? report.status.toUpperCase()
                          : "UNKNOWN"}
                      </span>
                    </td>
                    <td className="p-4 text-sm text-gray-400">
                      {report.created_at
                        ? new Date(report.created_at).toLocaleDateString()
                        : "N/A"}
                    </td>
                    <td className="p-4 text-center">
                      <button
                        onClick={() => handleOpenReport(report)}
                        className="p-2 hover:bg-white/10 rounded-lg transition-colors text-gray-400 hover:text-[#C4B5FD] inline-flex items-center justify-center"
                        title="View Detail"
                      >
                        <Eye size={20} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {selectedReport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-[#1f2937] border border-white/10 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl relative">
            <button
              onClick={() => setSelectedReport(null)}
              className="absolute top-4 right-4 p-2 bg-white/5 hover:bg-white/10 rounded-full text-gray-400 transition"
            >
              <X size={20} />
            </button>

            <div className="p-6">
              <h2 className="text-xl font-bold text-white mb-6">
                Bad Review Report Details
              </h2>

              <div className="grid grid-cols-2 gap-6 mb-6">
                <div className="bg-white/5 p-4 rounded-xl border border-white/5">
                  <h3 className="text-xs uppercase text-gray-400 font-semibold mb-3">
                    Reporter
                  </h3>
                  <div className="flex items-center gap-3">
                    <img
                      src={
                        selectedReport.reporter_image ||
                        "https://via.placeholder.com/150"
                      }
                      alt="Reporter"
                      className="w-12 h-12 rounded-full border border-white/10 object-cover"
                    />
                    <span className="text-white font-medium">
                      {selectedReport.reporter_name}
                    </span>
                  </div>
                </div>

                <div className="bg-orange-500/5 p-4 rounded-xl border border-orange-500/10">
                  <h3 className="text-xs uppercase text-orange-400 font-semibold mb-3">
                    Review Author
                  </h3>
                  <div className="flex items-center gap-3">
                    <img
                      src={
                        selectedReport.review_author_image ||
                        "https://via.placeholder.com/150"
                      }
                      alt="Reviewer"
                      className="w-12 h-12 rounded-full border border-orange-500/20 object-cover"
                    />
                    <span className="text-white font-medium">
                      {selectedReport.review_author_name}
                    </span>
                  </div>
                </div>
              </div>

              <div className="space-y-4 text-sm">
                <div className="border-b border-white/5 pb-3">
                  <span className="text-gray-400 block mb-2">
                    Original Review Text
                  </span>
                  <div className="text-white bg-black/30 p-4 rounded-lg font-mono text-sm border-l-2 border-orange-500">
                    "{selectedReport.review_text || "No review text available."}
                    "
                  </div>
                </div>

                <div className="flex items-center justify-between border-b border-white/5 pb-3">
                  <span className="text-gray-400">Reason</span>
                  <span className="text-white capitalize font-medium">
                    {selectedReport.reason
                      ? selectedReport.reason.replace("_", " ")
                      : ""}
                  </span>
                </div>
                <div className="flex items-center justify-between border-b border-white/5 pb-3">
                  <span className="text-gray-400">Status</span>
                  <span
                    className={`px-2 py-0.5 rounded text-xs border ${getStatusColor(selectedReport.status)}`}
                  >
                    {selectedReport.status
                      ? selectedReport.status.toUpperCase()
                      : "UNKNOWN"}
                  </span>
                </div>
                <div className="flex items-center justify-between border-b border-white/5 pb-3">
                  <span className="text-gray-400">Created At</span>
                  <span className="text-white">
                    {selectedReport.created_at
                      ? new Date(selectedReport.created_at).toLocaleString()
                      : "N/A"}
                  </span>
                </div>

                <div className="border-b border-white/5 pb-3">
                  <span className="text-gray-400 block mb-2">
                    Report Description
                  </span>
                  <p className="text-gray-200 bg-black/20 p-3 rounded-lg leading-relaxed">
                    {selectedReport.report_description ||
                      "No description provided."}
                  </p>
                </div>
                {selectedReport.image_evidence ? (
                  <div>
                    <span className="text-gray-400 block mb-2">
                      Evidence Image
                    </span>
                    <img
                      src={selectedReport.image_evidence}
                      alt="Evidence"
                      className="w-full max-h-64 object-cover rounded-lg border border-white/10"
                    />
                  </div>
                ) : (
                  <div>
                    <span className="text-gray-400 block mb-2">
                      Evidence Image
                    </span>
                    <p className="text-gray-500 italic text-sm bg-black/20 p-3 rounded-lg border border-white/5">
                      No image evidence provided.
                    </p>
                  </div>
                )}
              </div>

              {selectedReport.status?.toLowerCase() === "reviewed" && (
                <div className="mt-6 pt-4 border-t border-white/5 flex justify-end gap-3">
                  <button
                    onClick={() =>
                      updateReportStatus(selectedReport.id, "rejected")
                    }
                    className="flex items-center gap-2 px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 rounded-lg transition-colors font-medium text-sm"
                  >
                    <XCircle size={16} />
                    Reject Report
                  </button>
                  <button
                    onClick={() =>
                      updateReportStatus(selectedReport.id, "resolved")
                    }
                    className="flex items-center gap-2 px-4 py-2 bg-green-500/10 hover:bg-green-500/20 text-green-400 border border-green-500/30 rounded-lg transition-colors font-medium text-sm"
                  >
                    <CheckCircle size={16} />
                    Resolve Report
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
