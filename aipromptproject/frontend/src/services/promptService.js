import { CATEGORIES, LANGUAGE_MODELS } from "../constants/filters.js";
import {
  mockBuyerRatings,
  mockCreatorPrompts,
  mockCreatorRatings,
  mockHomePrompts,
  mockPurchasedPrompts,
} from "../data/mock/index.js";
// import { apiGet } from "./apiClient.js";

/**
 * @param {import("../types/models.js").HomePromptFilters} filters
 * @returns {Promise<import("../types/models.js").Prompt[]>}
 */
export async function fetchHomePrompts(filters = {}) {
  // When DB is ready: return apiGet(`/prompts?${new URLSearchParams(filters)}`);
  await simulateNetwork();

  const { models = [], categories = [], minRating = 0, search = "" } = filters;
  const query = search.trim().toLowerCase();

  return mockHomePrompts.filter((prompt) => {
    const modelMatch = models.length === 0 || models.includes(prompt.model);
    const categoryMatch =
      categories.length === 0 || categories.includes(prompt.category);
    const ratingMatch = minRating === 0 || prompt.rating >= minRating;
    const searchMatch =
      !query ||
      prompt.title.toLowerCase().includes(query) ||
      prompt.model.toLowerCase().includes(query) ||
      prompt.category.toLowerCase().includes(query);

    return modelMatch && categoryMatch && ratingMatch && searchMatch;
  });
}

export async function fetchPurchasedPrompts() {
  await simulateNetwork();
  return mockPurchasedPrompts;
}

export async function fetchBuyerRatings() {
  await simulateNetwork();
  return mockBuyerRatings;
}

export async function fetchCreatorRatings() {
  await simulateNetwork();
  return mockCreatorRatings;
}

export async function fetchCreatorPrompts() {
  await simulateNetwork();
  return mockCreatorPrompts;
}

export function getFilterOptions() {
  return { languageModels: LANGUAGE_MODELS, categories: CATEGORIES };
}

function simulateNetwork() {
  return new Promise((resolve) => setTimeout(resolve, 0));
}
