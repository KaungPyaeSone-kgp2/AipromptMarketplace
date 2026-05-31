import { resolveAssetUrl } from "../utils/assets.js";
import { apiGet, apiPost } from "./apiClient.js";
import { getCurrentUserId } from "./currentUser.js";

export const FOLLOW_COUNTS_UPDATED_EVENT = "promptai:follow-counts-updated";

function toBoolean(value) {
  return value === true || value === 1 || value === "1";
}

export function getCurrentFollowerId() {
  return getCurrentUserId();
}

function mapFollowAccount(row) {
  const displayName = row.user_name ?? row.display_name ?? row.name ?? "User";

  return {
    id: String(row.id ?? row.user_id ?? ""),
    name: displayName,
    username: displayName,
    avatarUrl:
      resolveAssetUrl(row.profile_image) ||
      `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=8b5cf6&color=fff`,
    isCreator: toBoolean(row.creator_mode),
    followersCount: Number(row.followers_count ?? 0),
    followingCount: Number(row.following_count ?? 0),
    postedPromptCount: Number(row.posted_prompt_count ?? 0),
    followedAt: row.followed_at ?? null,
    joinedAt: row.created_at ?? null,
  };
}

export async function fetchFollowStatus(creatorId) {
  const followerId = getCurrentUserId();
  const response = await apiGet(
    `followers/getFollowStatus.php?follower_id=${followerId}&creator_id=${creatorId}`
  );

  return Boolean(response?.is_following);
}

export async function fetchFollowingAccounts(userId = getCurrentUserId()) {
  const response = await apiGet(`followers/getFollowingList.php?user_id=${userId}`);
  const rows = Array.isArray(response?.data) ? response.data : [];

  return rows.map(mapFollowAccount);
}

export async function fetchFollowerAccounts(userId) {
  const response = await apiGet(`followers/getFollowersList.php?user_id=${userId}`);
  const rows = Array.isArray(response?.data) ? response.data : [];

  return rows.map(mapFollowAccount);
}

export async function toggleFollowCreator(creatorId) {
  const followerId = getCurrentUserId();

  const response = await apiPost("followers/toggleFollow.php", {
    follower_id: Number(followerId),
    creator_id: Number(creatorId),
  });

  if (typeof window !== "undefined") {
    window.dispatchEvent(
      new CustomEvent(FOLLOW_COUNTS_UPDATED_EVENT, {
        detail: {
          followingCount: Number(response?.following_count ?? 0),
        },
      })
    );
  }

  return response;
}
