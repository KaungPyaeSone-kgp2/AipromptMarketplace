/** Temporary seed data — replace via promptService when API/DB is connected. */

export const mockHomePrompts = [
  {
    id: "1",
    title: "Anime Warrior Character",
    imageUrl: null,
    model: "GPT",
    category: "Anime",
    rating: 5,
    price: 12,
    creator: "Bonnie Green",
    description:
      "A cinematic anime warrior prompt with glowing armor, dramatic lighting, and a premium character concept style.",
  },
  {
    id: "2",
    title: "Fantasy Dragon Landscape",
    imageUrl: null,
    model: "Gemini",
    category: "Fantasy",
    rating: 4,
    price: 18,
    creator: "AI Studio",
    description:
      "A fantasy dragon flying over mountains with magical clouds, epic scale, and rich environmental details.",
  },
  {
    id: "3",
    title: "Food Photography Setup",
    imageUrl: null,
    model: "Claude",
    category: "Food",
    rating: 3,
    price: 8,
    creator: "Prompt Kitchen",
    description:
      "A realistic restaurant-style food photography prompt with soft lighting, depth of field, and professional plating.",
  },
  {
    id: "4",
    title: "Sci-Fi City Concept",
    imageUrl: null,
    model: "Grok",
    category: "Sci-Fi",
    rating: 5,
    price: 15,
    creator: "FutureLab",
    description:
      "A futuristic cyberpunk city prompt with neon signs, flying cars, rain reflections, and cinematic atmosphere.",
  },
  {
    id: "5",
    title: "Modern Architecture Render",
    imageUrl: null,
    model: "Llama",
    category: "Architecture",
    rating: 4,
    price: 20,
    creator: "ArchPrompt",
    description:
      "A clean modern building render prompt with glass, concrete, sunlight, and premium architectural visualization.",
  },
  {
    id: "6",
    title: "Pixel Art Hero Sprite",
    imageUrl: null,
    model: "GPT",
    category: "Pixel Art",
    rating: 4,
    price: 10,
    creator: "RetroBits",
    description: "16-bit style hero sprite with clean outlines and vibrant palette.",
  },
];

export const mockPurchasedPrompts = [
  {
    id: "p1",
    title: "Anime Warrior Character Prompt",
    category: "Anime",
    model: "GPT",
    purchasedAt: "2026-05-10",
    promptText:
      "Create a detailed anime warrior character with glowing armor, cinematic lighting, and dramatic background.",
  },
  {
    id: "p2",
    title: "Fantasy Dragon Landscape",
    category: "Fantasy",
    model: "Gemini",
    purchasedAt: "2026-05-08",
    promptText:
      "Generate a fantasy dragon flying over mountains with magical clouds and epic lighting.",
  },
  {
    id: "p3",
    title: "Food Photography Prompt",
    category: "Food",
    model: "Claude",
    purchasedAt: "2026-05-05",
    promptText:
      "Create realistic food photography with soft restaurant lighting and professional composition.",
  },
];

export const mockBuyerRatings = [
  {
    id: "br1",
    promptTitle: "Anime Warrior Character Prompt",
    creatorName: "Bonnie Creator",
    rating: 5,
    review: "Very useful prompt. The result was clean and detailed.",
    date: "2026-05-10",
  },
  {
    id: "br2",
    promptTitle: "Fantasy Dragon Landscape",
    creatorName: "AI Studio",
    rating: 4,
    review: "Good prompt, but I needed to edit small details.",
    date: "2026-05-08",
  },
];

export const mockCreatorRatings = [
  {
    id: "cr1",
    promptTitle: "Cyberpunk City Prompt",
    buyerName: "Mg Mg",
    rating: 5,
    review: "Great prompt and easy to use.",
    date: "2026-05-11",
  },
  {
    id: "cr2",
    promptTitle: "Product Photography Prompt",
    buyerName: "Hla Hla",
    rating: 4,
    review: "Nice output. Good for ecommerce images.",
    date: "2026-05-09",
  },
];

export const mockCreatorPrompts = [
  {
    id: "c1",
    title: "Cyberpunk City Prompt",
    model: "GPT",
    category: "Sci-Fi",
    price: 25,
    sales: 18,
    status: "Published",
  },
  {
    id: "c2",
    title: "Product Photography Prompt",
    model: "Claude",
    category: "Food",
    price: 15,
    sales: 11,
    status: "Published",
  },
];
