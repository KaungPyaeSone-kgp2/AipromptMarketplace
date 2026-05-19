import { mockFollowingPosts } from "../data/mock/followings.js";
// import { apiGet } from "./apiClient.js";

export async function fetchFollowingPosts() {
  // return apiGet("/followings/feed");
  return [...mockFollowingPosts];
}
