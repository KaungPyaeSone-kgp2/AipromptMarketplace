import React from "react";
import PromptCard from "../PromptCard.jsx";

export default function PromptGrid({ prompts, loading, error, variant = "grid" }) {
  if (loading) {
    return (
      <div className="glass-panel flex min-h-[280px] items-center justify-center p-8">
        <p className="text-sm text-slate-400">Loading prompts...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="glass-panel flex min-h-[280px] items-center justify-center p-8">
        <p className="text-sm text-rose-300">{error}</p>
      </div>
    );
  }

  if (!prompts?.length) {
    return (
      <div className="glass-panel flex min-h-[280px] flex-col items-center justify-center gap-3 p-8 text-center">
        <p className="text-sm font-semibold text-slate-300">
          No prompts match the current filters.
        </p>
        <p className="text-xs text-slate-500">
          Try different models, categories, or rating options above.
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
      {prompts.map((prompt) => (
        <PromptCard key={prompt.id} prompt={prompt} variant={variant} />
      ))}
    </div>
  );
}

