import React from "react";
import { CATEGORIES, LANGUAGE_MODELS } from "../../constants/filters.js";
import FilterPill from "./FilterPill.jsx";

function StarRating({ minRating, onChange }) {
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => {
        const active = star <= minRating;
        return (
          <button
            key={star}
            type="button"
            onClick={() => onChange(minRating === star ? 0 : star)}
            aria-label={`Minimum ${star} stars`}
            className="rounded-lg px-1 py-0.5 text-xl transition hover:scale-110"
            style={{ color: active ? "#fbbf24" : "#475569" }}
          >
            ★
          </button>
        );
      })}
    </div>
  );
}

export default function HomeFilters({
  selectedModels,
  selectedCategories,
  minRating,
  onToggleModel,
  onToggleCategory,
  onRatingChange,
  onClearAll,
}) {
  const hasFilters =
    selectedModels.length > 0 ||
    selectedCategories.length > 0 ||
    minRating > 0;

  return (
    <section className="surface-strong space-y-5 p-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-violet-300">
            Home Filters
          </p>
          <h2 className="mt-1 text-xl font-black text-white">
            Filter Home Prompts
          </h2>
          <p className="mt-1 max-w-xl text-sm text-slate-400">
            These filters work on Home only, not inside the sidebar.
          </p>
        </div>

        {hasFilters && (
          <button
            type="button"
            onClick={onClearAll}
            className="rounded-xl bg-slate-800 px-3 py-2 text-xs font-bold text-slate-300 transition hover:bg-slate-700"
          >
            Clear all
          </button>
        )}
      </div>

      <div className="space-y-4">
        <div>
          <p className="mb-2 text-xs font-bold uppercase tracking-wider text-slate-500">
            Language Models
          </p>
          <div className="flex flex-wrap gap-2">
            {LANGUAGE_MODELS.map((model) => (
              <FilterPill
                key={model}
                label={model}
                selected={selectedModels.includes(model)}
                onClick={() => onToggleModel(model)}
              />
            ))}
          </div>
        </div>

        <div>
          <p className="mb-2 text-xs font-bold uppercase tracking-wider text-slate-500">
            Categories
          </p>
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map((category) => (
              <FilterPill
                key={category}
                label={category}
                selected={selectedCategories.includes(category)}
                onClick={() => onToggleCategory(category)}
              />
            ))}
          </div>
        </div>

        <div>
          <p className="mb-2 text-xs font-bold uppercase tracking-wider text-slate-500">
            Minimum Rating
          </p>
          <StarRating minRating={minRating} onChange={onRatingChange} />
        </div>
      </div>
    </section>
  );
}

