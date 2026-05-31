/**
 * @deprecated Import from `data/mock` or `services/*` instead.
 * Kept for backward compatibility during migration.
 */
export {
  mockBuyerRatings,
  mockCreatorPrompts,
  mockCreatorRatings,
  mockHomePrompts,
  mockPurchasedPrompts,
} from "./mock/prompts.js";

export {
  mockCartCount,
  mockCurrentUser,
  mockNotificationCount,
} from "./mock/users.js";

export { CATEGORIES, LANGUAGE_MODELS } from "../constants/filters.js";
