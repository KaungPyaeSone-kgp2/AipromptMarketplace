import { fetchFollowingAccounts } from "./followService.js";
import { fetchHomePrompts } from "./promptService.js";

export async function fetchFollowingPosts() {
  const followingAccounts = await fetchFollowingAccounts();
  const followingIds = followingAccounts.map((account) => String(account.id));
  
  const prompts = await fetchHomePrompts({ followingIds });
  const followedIds = new Set(followingIds);

  return prompts.filter((prompt) => followedIds.has(String(prompt.creatorId)));
}
