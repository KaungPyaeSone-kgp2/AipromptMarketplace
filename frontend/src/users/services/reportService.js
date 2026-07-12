import { getApiBaseUrl } from "./apiClient.js";

/**
 * Submit a report to the backend.
 *
 * @param {{ targetType: string, targetId: number|string, reason: string, reporterId: number|string, description?: string, imageEvidence?: File|null }} params
 * @returns {Promise<{ success: boolean, message: string }>}
 */
export async function submitReport({ targetType, targetId, reason, reporterId, description = "", imageEvidence = null }) {
  const formData = new FormData();
  formData.append("target_type", targetType);
  formData.append("target_id", targetId);
  formData.append("reason", reason);
  formData.append("reporter_id", reporterId);
  formData.append("description", description);
  if (imageEvidence) {
    formData.append("image_evidence", imageEvidence);
  }

  // Use raw fetch (not apiPost) because FormData requires the browser to set
  // the multipart/form-data Content-Type header automatically.
  // Route through the Vite proxy to avoid cross-origin issues.
  const res = await fetch(`${getApiBaseUrl()}/reports/submitReport.php`, {
    method: "POST",
    body: formData,
  });

  if (!res.ok) {
    let errMessage = "Server Error";
    try {
      const errorData = await res.json();
      errMessage = errorData.message || errMessage;
    } catch (e) {
      // Ignored
    }
    throw new Error(errMessage);
  }

  return await res.json();
}

/**
 * Fetch reports for a specific user.
 * 
 * @param {number|string} userId 
 * @returns {Promise<{ success: boolean, submitted: Array, received: Array }>}
 */
export async function fetchReports(userId) {
  if (!userId) return { success: true, submitted: [], received: [] };
  const res = await fetch(`${getApiBaseUrl()}/reports/getReports.php?user_id=${userId}&t=${Date.now()}`, {
    cache: "no-store"
  });
  if (!res.ok) throw new Error("Failed to fetch reports");
  return await res.json();
}

/**
 * Clear a report from the user's view.
 */
export async function clearReportApi(reportId, targetType, isReceived, currentStatus) {
  const res = await fetch(`${getApiBaseUrl()}/reports/clearReport.php`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      report_id: reportId,
      target_type: targetType,
      is_received: isReceived,
      current_status: currentStatus
    }),
  });
  
  if (!res.ok) throw new Error("Failed to clear report");
  return await res.json();
}
