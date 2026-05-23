import { resolveAssetUrl } from "../utils/assets.js";
import { apiGet, apiPost } from "./apiClient.js";

function getCurrentUserId() {
  return (
    localStorage.getItem("promptai_user_id") ??
    import.meta.env.VITE_CURRENT_USER_ID ??
    "1"
  );
}

function mapReview(row) {
  const reviewerName = row.reviewer_name ?? row.user_name ?? "User";

  return {
    id: String(row.review_id ?? row.id ?? ""),
    promptId: String(row.prompt_id ?? ""),
    userId: String(row.user_id ?? ""),
    reviewerName,
    reviewerAvatarUrl:
      resolveAssetUrl(row.reviewer_profile_image ?? row.profile_image) ??
      `https://ui-avatars.com/api/?name=${encodeURIComponent(reviewerName)}&background=8b5cf6&color=fff`,
    rating: Number(row.rating ?? 0),
    comment: row.review_text ?? row.review ?? "",
    createdAt: row.created_at ?? null,
  };
}

export async function fetchPromptReviews(promptId) {
  const response = await apiGet(`reviews/getreviews.php?prompt_id=${promptId}`);
  const rows = Array.isArray(response?.data) ? response.data : [];

  return {
    count: Number(response?.count ?? rows.length),
    averageRating: Number(response?.average_rating ?? 0),
    reviews: rows.map(mapReview),
  };
}

export async function addPromptReview(promptId, { rating, comment }) {
  return apiPost("reviews/insertreview.php", {
    user_id: Number(getCurrentUserId()),
    prompt_id: Number(promptId),
    rating: Number(rating),
    review_text: comment,
  });
}
