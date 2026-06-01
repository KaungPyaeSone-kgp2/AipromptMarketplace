import { mockCartCount } from "../data/mock/users.js";
import { resolveAssetUrl } from "../utils/assets.js";
import { apiGet, getApiBaseUrl } from "./apiClient.js";
import { getCurrentUserId } from "./currentUser.js";

function toBoolean(value) {
  return value === true || value === 1 || value === "1";
}

function mapUserFromApi(payload) {
  const row = payload?.data ?? payload ?? {};
  const displayName =
    row.display_name ?? row.user_name ?? row.name ?? row.username ?? "User";
  const email = row.user_email ?? row.email ?? "";
  const avatarUrl =
    resolveAssetUrl(row.profile_image ?? row.avatar ?? row.avatarUrl) ??
    `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=8b5cf6&color=fff`;
  const creatorMode = toBoolean(payload?.creator_mode ?? row.creator_mode);

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
    creatorBio: row.user_bio ?? row.bio ?? "",
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
    const response = await apiGet(`user/getCreator.php?user_id=${userId}`);
    return mapUserFromApi(response);
  }
}

/** @returns {Promise<import("../types/models.js").User>} */
export async function fetchCreatorById(userId) {
  const response = await apiGet(`user/getCreator.php?user_id=${userId}`);
  return mapUserFromApi(response);
}

/** @returns {Promise<import("../types/models.js").User>} */
export async function fetchUserById(userId) {
  const response = await apiGet(`user/getUser.php?user_id=${userId}`);
  return mapUserFromApi(response);
}

export async function updateCurrentUserProfile({ name, email, bio, imageBlob }) {
  const formData = new FormData();
  formData.append("user_id", getCurrentUserId());
  formData.append("user_name", name);
  formData.append("user_email", email);
  formData.append("bio", bio ?? "");

  if (imageBlob) {
    formData.append("profile_image", imageBlob, "profile.png");
  }

  const response = await fetch(`${getApiBaseUrl()}/user/updateUser.php`, {
    method: "POST",
    body: formData,
  });
  const data = await response.json();

  if (!response.ok || data?.success === false) {
    throw new Error(data?.message ?? "Profile update failed");
  }

  return mapUserFromApi(data);
}

export async function subscribeCreatorMode() {
  const response = await fetch(`${getApiBaseUrl()}/user/updatecreatormode.php`, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      user_id: Number(getCurrentUserId()),
    }),
  });
  const data = await response.json();

  if (!response.ok || data?.success === false) {
    throw new Error(data?.message ?? "Creator mode update failed");
  }

  return data;
}

export async function fetchCartCount() {
  return mockCartCount;
}

export async function fetchUnreadNotificationCount() {
  const userId = getCurrentUserId();
  try {
    const res = await fetch(`/api/notification/getUnreadCount.php?user_id=${userId}`);
    const data = await res.json();
    if (data.success) return data.count;
    return 0;
  } catch {
    return 0;
  }
}
