import { mapPromptListFromApi } from "../utils/mapPrompt.js";
import { apiGet, apiPost } from "./apiClient.js";
import { getCurrentUserId } from "./currentUser.js";

export function getWishlistUserId() {
  return getCurrentUserId();
}

export async function fetchWishlist(userId) {
  const currentUserId = userId || getCurrentUserId();
  if (!currentUserId) return [];
  const response = await apiPost("wishlist/getWishlist.php", { user_id: currentUserId });
  return mapPromptListFromApi(response);
}

export async function addWishlistPrompt(promptId) {
  return apiPost("wishlist/insertWishlist.php", {
    user_id: getCurrentUserId(),
    prompt_id: Number(promptId),
  });
}

export async function deleteWishlistPrompt(promptId) {
  return apiPost("wishlist/deleteWishlist.php", {
    user_id: getCurrentUserId(),
    prompt_id: Number(promptId),
  });
}
