import { resolveAssetUrl } from "../utils/assets.js";
import { apiGet, apiPost } from "./apiClient.js";
import { getCurrentUserId } from "./currentUser.js";

export const RATINGS_UPDATED_EVENT = "promptai:ratings-updated";

function notifyRatingsUpdated(detail) {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent(RATINGS_UPDATED_EVENT, { detail }));
  }
}

function toBoolean(value) {
  return value === true || value === 1 || value === "1";
}

function mapReview(row) {
  const reviewerName = row.reviewer_name ?? row.user_name ?? "User";

  return {
    id: String(row.review_id ?? row.id ?? ""),
    promptId: String(row.prompt_id ?? ""),
    userId: String(row.user_id ?? ""),
    reviewerIsCreator: toBoolean(row.reviewer_is_creator),
    reviewerName,
    reviewerAvatarUrl:
      resolveAssetUrl(row.reviewer_profile_image ?? row.profile_image) ??
      `https://ui-avatars.com/api/?name=${encodeURIComponent(reviewerName)}&background=8b5cf6&color=fff`,
    rating: Number(row.rating ?? 0),
    comment: row.review_text ?? row.review ?? "",
    createdAt: row.created_at ?? null,
  };
}

function formatReviewDate(value) {
  if (!value) return "";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";

  return date.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function mapRatingRow(row) {
  return {
    id: String(row.review_id ?? row.id ?? ""),
    promptId: String(row.prompt_id ?? ""),
    promptTitle: row.prompt_title ?? "Prompt",
    promptDescription: row.prompt_description ?? "",
    creatorId: String(row.creator_id ?? ""),
    creatorName: row.creator_name ?? "Creator",
    buyerId: String(row.user_id ?? ""),
    buyerIsCreator: toBoolean(row.reviewer_is_creator),
    buyerName: row.reviewer_name ?? row.user_name ?? "Buyer",
    buyerAvatarUrl:
      resolveAssetUrl(row.reviewer_profile_image ?? row.profile_image) ??
      `https://ui-avatars.com/api/?name=${encodeURIComponent(row.reviewer_name ?? "Buyer")}&background=8b5cf6&color=fff`,
    rating: Number(row.rating ?? 0),
    review: row.review_text ?? "",
    date: formatReviewDate(row.created_at),
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

export async function fetchBuyerRatings(userId = getCurrentUserId()) {
  const response = await apiGet(`reviews/getreviews.php?user_id=${userId}`);
  const rows = Array.isArray(response?.data) ? response.data : [];

  return rows.map(mapRatingRow);
}

export async function fetchCreatorReceivedRatings(creatorId = getCurrentUserId()) {
  const response = await apiGet(`reviews/getreviews.php?creator_id=${creatorId}`);
  const rows = Array.isArray(response?.data) ? response.data : [];

  return rows.map(mapRatingRow);
}

export async function addPromptReview(promptId, { rating, comment }) {
  const response = await apiPost("reviews/insertreview.php", {
    user_id: Number(getCurrentUserId()),
    prompt_id: Number(promptId),
    rating: Number(rating),
    review_text: comment,
  });

  notifyRatingsUpdated({ buyerDelta: 1 });
  return response;
}

export async function deletePromptReview(reviewId) {
  return apiPost("reviews/deleteReview.php", {
    user_id: Number(getCurrentUserId()),
    review_id: Number(reviewId),
  });
}
