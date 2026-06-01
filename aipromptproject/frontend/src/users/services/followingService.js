import { fetchFollowingAccounts } from "./followService.js";
import { fetchHomePrompts } from "./promptService.js";

export async function fetchFollowingPosts() {
  const [followingAccounts, prompts] = await Promise.all([
    fetchFollowingAccounts(),
    fetchHomePrompts(),
  ]);
  const followedIds = new Set(followingAccounts.map((account) => account.id));

  return prompts.filter((prompt) => followedIds.has(String(prompt.creatorId)));
}
