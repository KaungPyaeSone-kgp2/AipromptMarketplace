import { mapPromptListFromApi } from "../utils/mapPrompt.js";
import { apiGet, apiPost } from "./apiClient.js";

function getCurrentUserId() {
  return (
    localStorage.getItem("promptai_user_id") ??
    import.meta.env.VITE_CURRENT_USER_ID ??
    "1"
  );
}

export function getWishlistUserId() {
  return getCurrentUserId();
}

export async function fetchWishlist() {
  const userId = getCurrentUserId();
  const response = await apiGet(`wishlist/getWishlist.php?user_id=${userId}`);
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
