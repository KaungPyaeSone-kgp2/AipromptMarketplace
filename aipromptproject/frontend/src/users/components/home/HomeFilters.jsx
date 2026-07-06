import React, { useEffect, useRef, useState } from "react";
import { CATEGORIES, LANGUAGE_MODELS } from "../../constants/filters.js";
import { getFilterOptions } from "../../services/promptService.js";
import { ChevronIcon, FilterIcon } from "../Icon.jsx";
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

function FilterSection({ title, children }) {
  return (
    <div>
      <p className="mb-2 text-xs font-bold uppercase tracking-wider text-slate-500">
        {title}
      </p>
      <div className="flex flex-wrap gap-2">{children}</div>
    </div>
  );
}

export default function HomeFilters({
  selectedModels,
  selectedCategories,
  minRating,
  resultCount = 0,
  loading = false,
  onToggleModel,
  onToggleCategory,
  onRatingChange,
  onClearAll,
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [filterOptions, setFilterOptions] = useState({
    languageModels: LANGUAGE_MODELS,
    categories: CATEGORIES,
  });
  const menuRef = useRef(null);

  const selectedCount =
    selectedModels.length + selectedCategories.length + (minRating > 0 ? 1 : 0);

  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function loadFilterOptions() {
      try {
        const options = await getFilterOptions();
        if (!cancelled) setFilterOptions(options);
      } catch {
        if (!cancelled) {
          setFilterOptions({
            languageModels: LANGUAGE_MODELS,
            categories: CATEGORIES,
          });
        }
      }
    }

    loadFilterOptions();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <header className="flex min-h-12 items-start justify-between gap-4">
      <div className="min-w-0">
        <h1 className="text-4xl font-black text-violet-400">Home</h1>
        {/* <p className="mt-1 text-xs font-semibold text-slate-500">
          {loading
            ? "Loading prompts..."
            : `${resultCount.toLocaleString()} prompt${resultCount === 1 ? "" : "s"}`}
        </p> */}
      </div>

      <div className="relative" ref={menuRef}>
        <button
          type="button"
          onClick={() => setMenuOpen((prev) => !prev)}
          className="inline-flex min-w-[138px] items-center justify-between gap-2 rounded-2xl border px-4 py-2 text-sm font-black transition"
          style={{
            background: menuOpen
              ? "rgba(139, 92, 246, 0.16)"
              : "rgba(15, 20, 44, 0.75)",
            borderColor: menuOpen
              ? "rgba(139, 92, 246, 0.36)"
              : "rgba(148, 163, 184, 0.16)",
            color: "#f8fafc",
          }}
        >
          <span className="inline-flex items-center gap-2">
            <FilterIcon />
            Filter
          </span>
          <span
            className={`flex h-5 min-w-5 items-center justify-center rounded-full px-1.5 text-[10px] font-black text-white transition ${
              selectedCount > 0 ? "bg-violet-600" : "bg-slate-700"
            }`}
          >
            {selectedCount}
          </span>
          <ChevronIcon open={menuOpen} />
        </button>

        {menuOpen && (
          <div className="surface-strong absolute right-0 top-full z-20 mt-3 w-[min(340px,calc(100vw-3rem))] space-y-4 p-5">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-xs font-black uppercase tracking-widest text-violet-300">
                  Home filters
                </p>
                <p className="mt-1 text-xs text-slate-500">
                  {selectedCount} selected
                </p>
              </div>
              <div className="flex h-9 min-w-[64px] justify-end">
                {selectedCount > 0 && (
                  <button
                    type="button"
                    onClick={onClearAll}
                    className="rounded-xl bg-slate-800 px-3 py-2 text-xs font-bold text-slate-300 transition hover:bg-slate-700"
                  >
                    Clear
                  </button>
                )}
              </div>
            </div>

            <FilterSection title="Language Models">
              {filterOptions.languageModels.map((model) => (
                <FilterPill
                  key={model}
                  label={model}
                  selected={selectedModels.includes(model)}
                  onClick={() => onToggleModel(model)}
                />
              ))}
            </FilterSection>

            <FilterSection title="Categories">
              {filterOptions.categories.map((category) => (
                <FilterPill
                  key={category}
                  label={category}
                  selected={selectedCategories.includes(category)}
                  onClick={() => onToggleCategory(category)}
                />
              ))}
            </FilterSection>

            <FilterSection title="Minimum Rating">
              <StarRating minRating={minRating} onChange={onRatingChange} />
            </FilterSection>
          </div>
        )}
      </div>
    </header>
  );
}
