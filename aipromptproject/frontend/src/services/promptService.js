import { CATEGORIES, LANGUAGE_MODELS } from "../constants/filters.js";
import { mapPromptListFromApi } from "../utils/mapPrompt.js";
import { apiGet } from "./apiClient.js";

let cachedPrompts = null;

async function loadAllPrompts() {
  if (cachedPrompts) return cachedPrompts;

  const response = await apiGet("prompt/getAllprompts.php");
  const mapped = mapPromptListFromApi(response);
  cachedPrompts = mapped;
  return mapped;
}

/**
 * @param {import("../types/models.js").HomePromptFilters} filters
 */
export async function fetchHomePrompts(filters = {}) {
  const all = await loadAllPrompts();
  const { models = [], categories = [], minRating = 0, search = "" } = filters;
  const query = search.trim().toLowerCase();

  return all.filter((prompt) => {
    const modelMatch = models.length === 0 || models.includes(prompt.model);
    const categoryMatch =
      categories.length === 0 || categories.includes(prompt.category);
    const ratingMatch = minRating === 0 || (prompt.rating ?? 0) >= minRating;
    const searchMatch =
      !query ||
      prompt.title?.toLowerCase().includes(query) ||
      prompt.model?.toLowerCase().includes(query) ||
      prompt.category?.toLowerCase().includes(query) ||
      prompt.creatorName?.toLowerCase().includes(query) ||
      prompt.description?.toLowerCase().includes(query);

    return modelMatch && categoryMatch && ratingMatch && searchMatch;
  });
}

export async function fetchPromptById(id) {
  const all = await loadAllPrompts();
  return all.find((p) => String(p.id) === String(id)) ?? null;
}

export async function fetchPurchasedPrompts() {
  const { mockPurchasedPrompts } = await import("../data/mock/prompts.js");
  return mockPurchasedPrompts;
}

export async function fetchBuyerRatings() {
  const { mockBuyerRatings } = await import("../data/mock/prompts.js");
  return mockBuyerRatings;
}

export async function fetchCreatorRatings() {
  const { mockCreatorRatings } = await import("../data/mock/prompts.js");
  return mockCreatorRatings;
}

export async function fetchCreatorPrompts() {
  const { mockCreatorPrompts } = await import("../data/mock/prompts.js");
  return mockCreatorPrompts;
}

export function getFilterOptions() {
  return { languageModels: LANGUAGE_MODELS, categories: CATEGORIES };
}

export function clearPromptCache() {
  cachedPrompts = null;
}
