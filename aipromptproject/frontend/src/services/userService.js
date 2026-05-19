import {
  mockCartCount,
  mockCurrentUser,
  mockNotificationCount,
} from "../data/mock/users.js";
// import { apiGet } from "./apiClient.js";

/** @returns {Promise<import("../types/models.js").User>} */
export async function fetchCurrentUser() {
  // return apiGet("/users/me");
  return { ...mockCurrentUser };
}

export async function fetchCartCount() {
  // return apiGet("/cart/count");
  return mockCartCount;
}

export async function fetchUnreadNotificationCount() {
  // return apiGet("/notifications/unread-count");
  return mockNotificationCount;
}
