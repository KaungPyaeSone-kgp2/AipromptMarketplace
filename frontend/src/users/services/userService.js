
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
  const isCreator = toBoolean(payload?.is_creator ?? row.is_creator);

  return {
    id: String(row.user_id ?? row.id ?? getCurrentUserId()),
    username: row.user_name ?? row.username ?? displayName,
    displayName,
    fullName: row.display_name ?? row.user_name ?? displayName,
    email,
    avatarUrl,
    profileImage: avatarUrl,
    isCreator,
    creatorDataId: row.creator_data_id ? String(row.creator_data_id) : null,
    creatorBio: row.user_bio ?? row.bio ?? "",
    creatorCategory: row.category ?? "",
    creatorCoverUrl: resolveAssetUrl(row.cover_image),
    followersCount: Number(row.followers_count ?? 0),
    postedPromptCount: Number(row.posted_prompt_count ?? 0),
    followingCount: Number(row.following_count ?? 0),
    joinedAt: row.creator_created_at ?? row.user_created_at ?? row.created_at ?? null,
  };
}

export async function fetchCurrentUser() {
  const userId = getCurrentUserId();
  if (!userId) return null;

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

export async function updateCurrentUserProfile({ bio, imageBlob }) {
  const formData = new FormData();
  formData.append("user_id", getCurrentUserId());
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

export async function subscribeCreatorMode(withdrawPassword) {
  const response = await fetch(`${getApiBaseUrl()}/user/updatecreatormode.php`, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      user_id: Number(getCurrentUserId()),
      withdraw_password: withdrawPassword,
    }),
  });
  const data = await response.json();

  if (!response.ok || data?.success === false) {
    throw new Error(data?.message ?? "Creator mode update failed");
  }

  return data;
}

export async function requestCreatorMode(withdrawPassword) {
  const response = await fetch(`${getApiBaseUrl()}/user/requestCreatorMode.php`, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      user_id: Number(getCurrentUserId()),
      withdraw_password: withdrawPassword,
    }),
  });
  const data = await response.json();

  if (!response.ok || data?.success === false) {
    throw new Error(data?.message ?? "Creator request failed");
  }

  return data;
}

export async function fetchCreatorRequestStatus() {
  const userId = getCurrentUserId();
  if (!userId) return null;
  try {
    const response = await apiGet(`user/getCreatorRequestStatus.php?user_id=${userId}`);
    return response?.data ?? null;
  } catch {
    return null;
  }
}

export async function fetchCartCount() {
  return 0;
}

export async function fetchUnreadNotificationCount() {
  const userId = getCurrentUserId();
  if (!userId) return 0;
  try {
    const res = await fetch(`/api/notification/getUnreadCount.php?user_id=${userId}`);
    const data = await res.json();
    if (data.success) return data.unread_count ?? data.count ?? 0;
    return 0;
  } catch {
    return 0;
  }
}
