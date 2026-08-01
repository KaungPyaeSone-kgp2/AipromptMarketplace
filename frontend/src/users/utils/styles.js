export const TAG_COLORS = {
  ChatGPT: {
    bg: "rgba(16, 185, 129, 0.16)",
    border: "rgba(16, 185, 129, 0.36)",
    text: "#6ee7b7",
    textLight: "#047857",
  },
  GPT: {
    bg: "rgba(16, 185, 129, 0.16)",
    border: "rgba(16, 185, 129, 0.36)",
    text: "#6ee7b7",
    textLight: "#047857",
  },
  Gemini: {
    bg: "rgba(59, 130, 246, 0.16)",
    border: "rgba(59, 130, 246, 0.36)",
    text: "#93c5fd",
    textLight: "#1d4ed8",
  },
  Claude: {
    bg: "rgba(249, 115, 22, 0.16)",
    border: "rgba(249, 115, 22, 0.36)",
    text: "#fdba74",
    textLight: "#c2410c",
  },
  Midjourney: {
    bg: "rgba(139, 92, 246, 0.16)",
    border: "rgba(139, 92, 246, 0.36)",
    text: "#c4b5fd",
    textLight: "#6d28d9",
  },
  StableDiffusion: {
    bg: "rgba(236, 72, 153, 0.16)",
    border: "rgba(236, 72, 153, 0.36)",
    text: "#f9a8d4",
    textLight: "#be185d",
  },
  Grok: {
    bg: "rgba(20, 184, 166, 0.16)",
    border: "rgba(20, 184, 166, 0.36)",
    text: "#5eead4",
    textLight: "#0f766e",
  },
  Llama: {
    bg: "rgba(245, 158, 11, 0.16)",
    border: "rgba(245, 158, 11, 0.36)",
    text: "#fcd34d",
    textLight: "#b45309",
  },

  Anime: {
    bg: "rgba(34, 211, 238, 0.12)",
    border: "rgba(34, 211, 238, 0.28)",
    text: "#67e8f9",
    textLight: "#0e7490",
  },
  Landscape: {
    bg: "rgba(34, 211, 238, 0.12)",
    border: "rgba(34, 211, 238, 0.28)",
    text: "#67e8f9",
    textLight: "#0e7490",
  },
  Portrait: {
    bg: "rgba(34, 211, 238, 0.12)",
    border: "rgba(34, 211, 238, 0.28)",
    text: "#67e8f9",
    textLight: "#0e7490",
  },
  Abstract: {
    bg: "rgba(34, 211, 238, 0.12)",
    border: "rgba(34, 211, 238, 0.28)",
    text: "#67e8f9",
    textLight: "#0e7490",
  },
  "Pixel Art": {
    bg: "rgba(34, 211, 238, 0.12)",
    border: "rgba(34, 211, 238, 0.28)",
    text: "#67e8f9",
    textLight: "#0e7490",
  },
  Food: {
    bg: "rgba(34, 211, 238, 0.12)",
    border: "rgba(34, 211, 238, 0.28)",
    text: "#67e8f9",
    textLight: "#0e7490",
  },
  Animal: {
    bg: "rgba(34, 211, 238, 0.12)",
    border: "rgba(34, 211, 238, 0.28)",
    text: "#67e8f9",
    textLight: "#0e7490",
  },
  Fantasy: {
    bg: "rgba(34, 211, 238, 0.12)",
    border: "rgba(34, 211, 238, 0.28)",
    text: "#67e8f9",
    textLight: "#0e7490",
  },
  "Sci-Fi": {
    bg: "rgba(34, 211, 238, 0.12)",
    border: "rgba(34, 211, 238, 0.28)",
    text: "#67e8f9",
    textLight: "#0e7490",
  },
  Architecture: {
    bg: "rgba(34, 211, 238, 0.12)",
    border: "rgba(34, 211, 238, 0.28)",
    text: "#67e8f9",
    textLight: "#0e7490",
  },
};

export const fallbackTagColor = {
  bg: "rgba(148, 163, 184, 0.12)",
  border: "rgba(148, 163, 184, 0.24)",
  text: "#cbd5e1",
  textLight: "#334155",
};

const dynamicTagPalette = [
  fallbackTagColor,
  {
    bg: "rgba(34, 197, 94, 0.12)",
    border: "rgba(34, 197, 94, 0.28)",
    text: "#86efac",
    textLight: "#15803d",
  },
  {
    bg: "rgba(14, 165, 233, 0.12)",
    border: "rgba(14, 165, 233, 0.28)",
    text: "#7dd3fc",
    textLight: "#0369a1",
  },
  {
    bg: "rgba(168, 85, 247, 0.12)",
    border: "rgba(168, 85, 247, 0.28)",
    text: "#d8b4fe",
    textLight: "#7e22ce",
  },
  {
    bg: "rgba(244, 63, 94, 0.12)",
    border: "rgba(244, 63, 94, 0.28)",
    text: "#fda4af",
    textLight: "#be123c",
  },
  {
    bg: "rgba(234, 179, 8, 0.12)",
    border: "rgba(234, 179, 8, 0.28)",
    text: "#fde047",
    textLight: "#a16207",
  },
];

function getPaletteColor(label) {
  const key = String(label ?? "");
  const hash = [...key].reduce((sum, char) => sum + char.charCodeAt(0), 0);
  return dynamicTagPalette[hash % dynamicTagPalette.length];
}

export function getTagColor(label) {
  return TAG_COLORS[label] ?? getPaletteColor(label);
}
