import { CATEGORIES, LANGUAGE_MODELS } from "../constants/filters.js";
import { mapPromptListFromApi, normalizeCategory } from "../utils/mapPrompt.js";
import { apiGet, apiPost, getApiBaseUrl } from "./apiClient.js";
import { getCurrentUserId } from "./currentUser.js";

let cachedPrompts = null;
let cachedCategories = null;
export const PROMPTS_UPDATED_EVENT = "promptai:prompts-updated";

function notifyPromptsUpdated() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent(PROMPTS_UPDATED_EVENT));
  }
}

let loadPromptsPromise = null;

async function loadAllPrompts() {
  if (cachedPrompts) return cachedPrompts;

  if (loadPromptsPromise) return loadPromptsPromise;

  loadPromptsPromise = (async () => {
    try {
      const response = await apiGet("prompt/getAllprompts.php");
      const mapped = mapPromptListFromApi(response);
      cachedPrompts = mapped;
      return mapped;
    } finally {
      loadPromptsPromise = null;
    }
  })();

  return loadPromptsPromise;
}

async function loadAllCategories() {
  if (cachedCategories) return cachedCategories;

  const response = await apiGet("categories/getAllcategories.php");
  const rows = Array.isArray(response?.data)
    ? response.data
    : Array.isArray(response)
      ? response
      : [];

  cachedCategories = rows
    .map((row) => normalizeCategory(row.category_name ?? row.name ?? row))
    .filter(Boolean);

  return cachedCategories;
}

/**
 * @param {import("../types/models.js").HomePromptFilters} filters
 */
export async function fetchHomePrompts(filters = {}) {
  const all = await loadAllPrompts();
  const currentUserId = String(getCurrentUserId());
  const { models = [], categories = [], minRating = 0, search = "", followingIds = [] } = filters;
  const query = search.trim().toLowerCase();
  const followingSet = new Set(followingIds.map(String));

  return all.filter((prompt) => {
    const isOwnPrompt = String(prompt.creatorId) === currentUserId;

    // Visibility filtering
    if (prompt.visibility === 'draft') return false;
    if (prompt.visibility === 'followers_only') return false;

    const modelMatch = models.length === 0 || models.includes(prompt.model);
    const categoryMatch =
      categories.length === 0 || categories.includes(prompt.category);
    const ratingMatch = minRating === 0 || (prompt.rating ?? 0) >= minRating;
    const searchFields = [
      prompt.title,
      //  prompt.slug,
      prompt.model,
      prompt.category,
      prompt.creator,
      // prompt.creatorName,
      //  prompt.description,
      //  prompt.promptText,
    ].filter(Boolean).map(f => f.toLowerCase());

    const queryWords = query ? query.split(/\s+/).filter(Boolean) : [];
    const searchMatch = queryWords.length === 0 || queryWords.every(word =>
      searchFields.some(field => field.split(/\s+/).some(fieldWord => fieldWord.startsWith(word)))
    );

    return !isOwnPrompt && modelMatch && categoryMatch && ratingMatch && searchMatch;
  });
}

export async function fetchProfilePrompts(profileUserId, followingIds = []) {
  const all = await loadAllPrompts();
  const currentUserId = String(getCurrentUserId());
  const followingSet = new Set(followingIds.map(String));
  const targetId = String(profileUserId);

  return all.filter((prompt) => {
    if (String(prompt.creatorId) !== targetId) return false;
    if (prompt.visibility === 'draft') return false;

    if (prompt.visibility === 'followers_only') {
      const isOwnPrompt = targetId === currentUserId;
      const isFollowing = followingSet.has(targetId);
      if (!isOwnPrompt && !isFollowing) return false;
    }

    return true;
  });
}

export async function fetchPromptById(id) {
  const all = await loadAllPrompts();
  return all.find((p) => String(p.id) === String(id)) ?? null;
}

export async function fetchPurchaseList(filter = "this_month") {
  const params = new URLSearchParams({
    user_id: getCurrentUserId(),
  });

  if (typeof filter === "string") {
    params.set("period", filter);
  } else {
    params.set("filter_type", filter.type ?? "period");

    if (filter.period) params.set("period", filter.period);
    if (filter.date) params.set("date", filter.date);
    if (filter.startDate) params.set("start_date", filter.startDate);
    if (filter.endDate) params.set("end_date", filter.endDate);
    if (filter.month) params.set("month", filter.month);
  }

  const response = await apiGet(`purchases/getPurchases.php?${params.toString()}`);
  const rows = Array.isArray(response?.data) ? response.data : [];

  return rows.map((row) => ({
    id: String(row.purchase_id ?? row.id ?? ""),
    buyerId: String(row.buyer_id ?? ""),
    totalCoinPaid: Number(row.total_coin_paid ?? 0),
    purchasedAt: row.purchased_at ?? null,
    itemCount: Number(row.item_count ?? 0),
  }));
}

export async function fetchPurchaseItems(purchaseId) {
  const params = new URLSearchParams({
    user_id: getCurrentUserId(),
    purchase_id: String(purchaseId),
  });
  const response = await apiGet(`purchases/getPurchaseItems.php?${params.toString()}`);
  return mapPromptListFromApi(response);
}



export async function fetchBuyerRatings() {
  const response = await apiGet(`reviews/getreviews.php?user_id=${getCurrentUserId()}`);
  return Array.isArray(response?.data) ? response.data : [];
}

export async function fetchCreatorRatings() {
  const response = await apiGet(`reviews/getreviews.php?creator_id=${getCurrentUserId()}`);
  return Array.isArray(response?.data) ? response.data : [];
}

export async function fetchCreatorPrompts() {
  const all = await loadAllPrompts();
  const currentUserId = String(getCurrentUserId());
  return all.filter((prompt) => String(prompt.creatorId) === currentUserId && prompt.visibility !== 'draft');
}

export async function fetchDraftPrompts() {
  const response = await apiGet(`prompt/getDraftPrompts.php?creator_id=${getCurrentUserId()}`);
  return mapPromptListFromApi(response);
}

export async function getFilterOptions() {
  const [prompts, categoriesFromApi] = await Promise.all([
    loadAllPrompts(),
    loadAllCategories(),
  ]);

  const languageModels = [
    ...new Set([
      ...LANGUAGE_MODELS,
      ...prompts.map((prompt) => prompt.model).filter(Boolean),
    ]),
  ];
  const categories = [
    ...new Set([
      ...CATEGORIES,
      ...categoriesFromApi,
    ]),
  ];

  return { languageModels, categories };
}

export async function checkoutCart(items, totalCoinPaid) {
  const userId = getCurrentUserId();

  return apiPost("purchases/createPurchase.php", {
    user_id: userId,
    total_coin_paid: totalCoinPaid,
    items: items.map((item) => ({
      prompt_id: item.prompt.id,
      price: Number(item.prompt.price) || 0,
    })),
  });
}

export function clearPromptCache() {
  cachedPrompts = null;
  cachedCategories = null;
  notifyPromptsUpdated();
}

export function updatePromptInCache(promptId, changes) {
  if (cachedPrompts) {
    cachedPrompts = cachedPrompts.map((prompt) =>
      String(prompt.id) === String(promptId)
        ? { ...prompt, ...changes }
        : prompt
    );
  }

  notifyPromptsUpdated();
}

export async function fetchCategoryOptions() {
  const response = await apiGet("categories/getAllcategories.php");
  const rows = Array.isArray(response?.data)
    ? response.data
    : Array.isArray(response)
      ? response
      : [];

  return rows.map((row) => ({
    id: String(row.id),
    name: row.category_name,
  }));
}

export async function createPrompt(formData) {
  // We need to use fetch directly here because apiClient's apiPost sets Content-Type to application/json
  // But we need multipart/form-data for the image upload.
  const API_BASE = getApiBaseUrl();
  const response = await fetch(`${API_BASE}/prompt/createPrompt.php`, {
    method: "POST",
    body: formData,
  });
  const data = await response.json();

  if (!response.ok || data?.success === false) {
    throw new Error(data?.message ?? "Failed to create prompt");
  }

  clearPromptCache();
  return data;
}

export async function updatePrompt(formData) {
  const API_BASE = getApiBaseUrl();
  const response = await fetch(`${API_BASE}/prompt/updatePrompt.php`, {
    method: "POST",
    body: formData,
  });
  const data = await response.json();

  if (!response.ok || data?.success === false) {
    throw new Error(data?.message ?? "Failed to update prompt");
  }

  clearPromptCache();
  return data;
}

export async function updatePromptVisibility(promptId, visibility) {
  const submission = new FormData();
  submission.append("creator_id", getCurrentUserId());
  submission.append("prompt_id", promptId);
  submission.append("visibility", visibility);

  const API_BASE = getApiBaseUrl();
  const response = await fetch(`${API_BASE}/prompt/updatePrompt.php`, {
    method: "POST",
    body: submission,
  });
  const data = await response.json();

  if (!response.ok || data?.success === false) {
    throw new Error(data?.message ?? "Failed to update prompt visibility");
  }

  clearPromptCache();
  return data;
}

