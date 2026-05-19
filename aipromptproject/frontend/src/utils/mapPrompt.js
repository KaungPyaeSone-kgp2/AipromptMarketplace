import { resolveAssetUrl } from "./assets.js";

const MODEL_MAP = {
  gpt: "GPT",
  openai: "GPT",
  gemini: "Gemini",
  grok: "Grok",
  claude: "Claude",
  llama: "Llama",
};

export function normalizeModelType(modelType) {
  if (!modelType) return "GPT";
  const key = String(modelType).trim().toLowerCase();
  if (MODEL_MAP[key]) return MODEL_MAP[key];
  const titled = modelType.charAt(0).toUpperCase() + modelType.slice(1).toLowerCase();
  return MODEL_MAP[titled.toLowerCase()] ?? titled;
}

export function normalizeCategory(categoryName) {
  if (!categoryName) return "Abstract";
  return String(categoryName)
    .split(/[\s_-]+/)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(" ")
    .replace("Sci fi", "Sci-Fi")
    .replace("Pixel art", "Pixel Art");
}

/** @param {Record<string, unknown>} row */
export function mapPromptFromApi(row) {
  const id = String(row.prompt_id ?? row.id ?? "");
  const creatorId = String(row.creator_id ?? "");
  const creatorName = row.user_name ?? row.creator_name ?? "Creator";
  const thumbnail = row.thumbnail ?? row.image ?? row.image_url;

  return {
    id,
    title: row.title ?? "Untitled prompt",
    slug: row.slug ?? id,
    imageUrl: resolveAssetUrl(thumbnail),
    model: normalizeModelType(row.model_type),
    category: normalizeCategory(row.category_name),
    rating: Number(row.rating ?? row.avg_rating ?? row.average_rating ?? 0),
    price: Number(row.sale_coin ?? row.price ?? 0),
    creator: creatorName,
    creatorId,
    creatorName,
    creatorAvatarUrl:
      resolveAssetUrl(row.profile_image ?? row.avatar ?? row.creator_avatar) ??
      `https://ui-avatars.com/api/?name=${encodeURIComponent(creatorName)}&background=8b5cf6&color=fff`,
    description: row.prompt_description ?? row.description ?? "",
    promptText: row.full_prompt_content ?? row.prompt_text ?? "",
  };
}

export function mapPromptListFromApi(payload) {
  let rows = [];

  if (Array.isArray(payload)) {
    rows = payload;
  } else if (payload && typeof payload === "object") {
    if (Array.isArray(payload.data)) rows = payload.data;
    else rows = Object.values(payload);
  }

  return rows.map(mapPromptFromApi);
}
