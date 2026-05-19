import React, { useMemo, useState } from "react";
import { useOutletContext } from "react-router";
import HomeFilters from "../components/home/HomeFilters.jsx";
import PromptGrid from "../components/home/PromptGrid.jsx";
import { useHomePrompts } from "../hooks/useHomePrompts.js";

export default function UserHome() {
  const { searchQuery = "" } = useOutletContext() ?? {};
  const [selectedModels, setSelectedModels] = useState([]);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [minRating, setMinRating] = useState(0);

  const filters = useMemo(
    () => ({
      models: selectedModels,
      categories: selectedCategories,
      minRating,
      search: searchQuery,
    }),
    [selectedModels, selectedCategories, minRating, searchQuery]
  );

  const { prompts, loading, error } = useHomePrompts(filters);

  const toggleModel = (model) => {
    setSelectedModels((prev) =>
      prev.includes(model) ? prev.filter((m) => m !== model) : [...prev, model]
    );
  };

  const toggleCategory = (category) => {
    setSelectedCategories((prev) =>
      prev.includes(category)
        ? prev.filter((c) => c !== category)
        : [...prev, category]
    );
  };

  return (
    <div className="space-y-6 fade-in">
      <HomeFilters
        selectedModels={selectedModels}
        selectedCategories={selectedCategories}
        minRating={minRating}
        onToggleModel={toggleModel}
        onToggleCategory={toggleCategory}
        onRatingChange={setMinRating}
        onClearAll={() => {
          setSelectedModels([]);
          setSelectedCategories([]);
          setMinRating(0);
        }}
      />

      <PromptGrid
        prompts={prompts}
        loading={loading}
        error={error}
        variant="grid"
      />
    </div>
  );
}


