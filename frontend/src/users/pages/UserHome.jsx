import React, { useEffect, useMemo, useState } from "react";
import { Link, useOutletContext } from "react-router";
import HomeFilters from "../components/home/HomeFilters.jsx";
import PromptGrid from "../components/home/PromptGrid.jsx";
import PromptCard from "../components/PromptCard.jsx";
import Pagination from "../components/Pagination.jsx";
import { useHomePrompts } from "../hooks/useHomePrompts.js";
import { fetchFollowingAccounts } from "../services/followService.js";
import { fetchCreatorPrompts, fetchDraftPrompts, updatePromptVisibility, PROMPTS_UPDATED_EVENT } from "../services/promptService.js";
import { MagicIcon } from "../components/Icon.jsx";

const getVisibilityLabel = (value) => {
  switch (value) {
    case 'followers_only': return 'Only Followings';
    case 'draft': return 'Draft';
    default: return 'Public';
  }
};

export default function UserHome() {
  const { searchQuery = "" } = useOutletContext() ?? {};
  const [selectedModels, setSelectedModels] = useState([]);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [minRating, setMinRating] = useState(0);
  const [followingIds, setFollowingIds] = useState([]);

  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 10;

  useEffect(() => {
    setCurrentPage(1);
  }, [selectedModels, selectedCategories, minRating, searchQuery]);

  useEffect(() => {
    let cancelled = false;
    async function loadFollowing() {
      try {
        const accounts = await fetchFollowingAccounts();
        if (!cancelled) {
          setFollowingIds(accounts.map((a) => a.id));
        }
      } catch {
        // silently ignore
      }
    }
    loadFollowing();
    return () => { cancelled = true; };
  }, []);

  const filters = useMemo(
    () => ({
      models: selectedModels,
      categories: selectedCategories,
      minRating,
      search: searchQuery,
      followingIds,
    }),
    [selectedModels, selectedCategories, minRating, searchQuery, followingIds]
  );

  const { prompts, loading, error } = useHomePrompts(filters);

  const totalPages = Math.ceil((prompts?.length || 0) / ITEMS_PER_PAGE);
  const currentPrompts = prompts?.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

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
        resultCount={prompts.length}
        loading={loading}
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
        prompts={currentPrompts}
        loading={loading}
        error={error}
        variant="grid"
        searchQuery={searchQuery}
      />
      
      {!loading && !error && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />
      )}
    </div>
  );
}
