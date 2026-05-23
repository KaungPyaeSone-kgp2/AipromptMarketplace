import { mockCartCount, mockNotificationCount } from "../data/mock/users.js";
import { resolveAssetUrl } from "../utils/assets.js";
import { apiGet } from "./apiClient.js";

function getCurrentUserId() {
  return (
    localStorage.getItem("promptai_user_id") ??
    import.meta.env.VITE_CURRENT_USER_ID ??
    "1"
  );
}

function mapUserFromApi(payload) {
  const row = payload?.data ?? payload ?? {};
  const displayName =
    row.display_name ?? row.user_name ?? row.name ?? row.username ?? "User";
  const email = row.user_email ?? row.email ?? "";
  const avatarUrl =
    resolveAssetUrl(row.profile_image ?? row.avatar ?? row.avatarUrl) ??
    `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=8b5cf6&color=fff`;
  const creatorMode = Number(payload?.creator_mode ?? row.creator_mode ?? 0) === 1;

  return {
    id: String(row.user_id ?? row.id ?? getCurrentUserId()),
    username: row.user_name ?? row.username ?? displayName,
    displayName,
    fullName: row.display_name ?? row.user_name ?? displayName,
    email,
    avatarUrl,
    profileImage: avatarUrl,
    points: Number(row.coin_balance ?? row.points ?? row.coins ?? 0),
    isCreator: creatorMode,
    creatorDataId: row.creator_data_id ? String(row.creator_data_id) : null,
    creatorBio: row.bio ?? "",
    creatorCategory: row.category ?? "",
    creatorCoverUrl: resolveAssetUrl(row.cover_image),
    totalEarningCoins: Number(row.total_earning_coins ?? 0),
    totalSalesCount: Number(row.total_sales_count ?? 0),
    followersCount: Number(row.followers_count ?? 0),
    postedPromptCount: Number(row.posted_prompt_count ?? 0),
    followingCount: Number(row.following_count ?? 0),
    purchasedPromptsCount: Number(row.purchased_prompts_count ?? 0),
    joinedAt: row.creator_created_at ?? row.user_created_at ?? row.created_at ?? null,
  };
}

/** @returns {Promise<import("../types/models.js").User>} */
export async function fetchCurrentUser({ creatorMode } = {}) {
  const userId = getCurrentUserId();

  if (creatorMode === true) {
    const response = await apiGet(`user/getCreator.php?user_id=${userId}`);
    return mapUserFromApi(response);
  }

  try {
    const response = await apiGet(`user/getUser.php?user_id=${userId}`);
    return mapUserFromApi(response);
  } catch (error) {
    if (creatorMode === false) {
      const response = await apiGet(`user/getCreator.php?user_id=${userId}`);
      return mapUserFromApi(response);
    }

    throw error;
  }
}

/** @returns {Promise<import("../types/models.js").User>} */
export async function fetchCreatorById(userId) {
  const response = await apiGet(`user/getCreator.php?user_id=${userId}`);
  return mapUserFromApi(response);
}

export async function fetchCartCount() {
  return mockCartCount;
}

export async function fetchUnreadNotificationCount() {
  return mockNotificationCount;
}
