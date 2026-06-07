import { apiPost } from "./apiClient.js";

/**
 * Submit a report to the backend.
 *
 * @param {{ targetType: string, targetId: number|string, reason: string, reporterId: number|string, description?: string }} params
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

  // We need to use fetch directly or ensure apiPost doesn't stringify FormData
  // Assuming apiPost automatically handles JSON vs FormData based on body type, but
  // standard apiPost typically sets Content-Type: application/json.
  // We'll use the standard fetch to be safe if apiPost doesn't support FormData.
  const token = localStorage.getItem("token");
  const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";
  const res = await fetch(`${API_BASE_URL}/users/reports/submitReport.php`, {
    method: "POST",
    headers: {
      ...(token && { Authorization: `Bearer ${token}` }),
    },
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
