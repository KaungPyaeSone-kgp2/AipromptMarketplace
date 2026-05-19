import React, { useEffect, useMemo, useState } from "react";
import PromptCard from "../components/PromptCard.jsx";
import { fetchPurchasedPrompts } from "../services/promptService.js";

export default function PurchasedPrompt() {
  const [prompts, setPrompts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("All");

  useEffect(() => {
    fetchPurchasedPrompts().then((data) => {
      setPrompts(data);
      setLoading(false);
    });
  }, []);

  const categories = useMemo(() => {
    return ["All", ...new Set(prompts.map((item) => item.category))];
  }, [prompts]);

  const filteredPrompts = useMemo(() => {
    if (selectedCategory === "All") return prompts;
    return prompts.filter((prompt) => prompt.category === selectedCategory);
  }, [prompts, selectedCategory]);

  return (
    <div className="space-y-6 fade-in">
      <div className="surface-strong p-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs font-black uppercase tracking-widest text-violet-300">
              Library
            </p>
            <h1 className="mt-1 text-2xl font-black text-white">
              Your Purchased Prompts
            </h1>
          </div>
          <div className="rounded-2xl border border-violet-400/25 bg-violet-500/10 px-5 py-4 text-center">
            <p className="text-2xl font-black text-violet-300">{prompts.length}</p>
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Purchased
            </p>
          </div>
        </div>
      </div>

      <div className="surface p-4">
        <p className="mb-3 text-xs font-black uppercase tracking-widest text-slate-500">
          Filter by category
        </p>
        <div className="flex flex-wrap gap-2">
          {categories.map((category) => (
            <button
              key={category}
              type="button"
              onClick={() => setSelectedCategory(category)}
              className={`rounded-full px-4 py-2 text-sm font-bold transition ${
                selectedCategory === category
                  ? "bg-cyan-400 text-slate-950"
                  : "bg-slate-900/80 text-slate-300 hover:bg-slate-800"
              }`}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="glass-panel p-10 text-center text-sm text-slate-400">
          Loading library...
        </div>
      ) : filteredPrompts.length > 0 ? (
        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {filteredPrompts.map((prompt) => (
            <PromptCard
              key={prompt.id}
              prompt={prompt}
              actionLabel="View Purchased"
            />
          ))}
        </div>
      ) : (
        <div className="glass-panel p-10 text-center">
          <p className="text-sm text-slate-400">
            No purchased prompts found for this category.
          </p>
        </div>
      )}
    </div>
  );
}


