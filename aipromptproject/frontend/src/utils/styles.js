export const TAG_COLORS = {
  GPT: {
    bg: "rgba(139, 92, 246, 0.16)",
    border: "rgba(139, 92, 246, 0.35)",
    text: "#c4b5fd",
  },
  Gemini: {
    bg: "rgba(139, 92, 246, 0.16)",
    border: "rgba(139, 92, 246, 0.35)",
    text: "#c4b5fd",
  },
  Grok: {
    bg: "rgba(139, 92, 246, 0.16)",
    border: "rgba(139, 92, 246, 0.35)",
    text: "#c4b5fd",
  },
  Claude: {
    bg: "rgba(139, 92, 246, 0.16)",
    border: "rgba(139, 92, 246, 0.35)",
    text: "#c4b5fd",
  },
  Llama: {
    bg: "rgba(139, 92, 246, 0.16)",
    border: "rgba(139, 92, 246, 0.35)",
    text: "#c4b5fd",
  },

  Anime: {
    bg: "rgba(34, 211, 238, 0.12)",
    border: "rgba(34, 211, 238, 0.28)",
    text: "#67e8f9",
  },
  Landscape: {
    bg: "rgba(34, 211, 238, 0.12)",
    border: "rgba(34, 211, 238, 0.28)",
    text: "#67e8f9",
  },
  Portrait: {
    bg: "rgba(34, 211, 238, 0.12)",
    border: "rgba(34, 211, 238, 0.28)",
    text: "#67e8f9",
  },
  Abstract: {
    bg: "rgba(34, 211, 238, 0.12)",
    border: "rgba(34, 211, 238, 0.28)",
    text: "#67e8f9",
  },
  "Pixel Art": {
    bg: "rgba(34, 211, 238, 0.12)",
    border: "rgba(34, 211, 238, 0.28)",
    text: "#67e8f9",
  },
  Food: {
    bg: "rgba(34, 211, 238, 0.12)",
    border: "rgba(34, 211, 238, 0.28)",
    text: "#67e8f9",
  },
  Animal: {
    bg: "rgba(34, 211, 238, 0.12)",
    border: "rgba(34, 211, 238, 0.28)",
    text: "#67e8f9",
  },
  Fantasy: {
    bg: "rgba(34, 211, 238, 0.12)",
    border: "rgba(34, 211, 238, 0.28)",
    text: "#67e8f9",
  },
  "Sci-Fi": {
    bg: "rgba(34, 211, 238, 0.12)",
    border: "rgba(34, 211, 238, 0.28)",
    text: "#67e8f9",
  },
  Architecture: {
    bg: "rgba(34, 211, 238, 0.12)",
    border: "rgba(34, 211, 238, 0.28)",
    text: "#67e8f9",
  },
};

export const fallbackTagColor = {
  bg: "rgba(148, 163, 184, 0.12)",
  border: "rgba(148, 163, 184, 0.24)",
  text: "#cbd5e1",
};

export function getTagColor(label) {
  return TAG_COLORS[label] ?? fallbackTagColor;
}
