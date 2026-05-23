import { CATEGORIES, LANGUAGE_MODELS } from "../constants/filters.js";
import { mapPromptListFromApi, normalizeCategory } from "../utils/mapPrompt.js";
import { apiGet } from "./apiClient.js";

let cachedPrompts = null;
let cachedCategories = null;

async function loadAllPrompts() {
  if (cachedPrompts) return cachedPrompts;

  const response = await apiGet("prompt/getAllprompts.php");
  const mapped = mapPromptListFromApi(response);
  cachedPrompts = mapped;
  return mapped;
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
  const { models = [], categories = [], minRating = 0, search = "" } = filters;
  const query = search.trim().toLowerCase();

  return all.filter((prompt) => {
    const modelMatch = models.length === 0 || models.includes(prompt.model);
    const categoryMatch =
      categories.length === 0 || categories.includes(prompt.category);
    const ratingMatch = minRating === 0 || (prompt.rating ?? 0) >= minRating;
    const searchableText = [
      prompt.title,
      prompt.slug,
      prompt.model,
      prompt.category,
      prompt.creator,
      prompt.creatorName,
      prompt.description,
      prompt.promptText,
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();
    const searchMatch = !query || searchableText.includes(query);

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

export function clearPromptCache() {
  cachedPrompts = null;
  cachedCategories = null;
}
