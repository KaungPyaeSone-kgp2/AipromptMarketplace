import { useEffect, useState } from "react";
import { fetchHomePrompts } from "../services/promptService.js";

/**
 * Loads and filters home prompts. Swap mock service for API without changing pages.
 * @param {import("../types/models.js").HomePromptFilters} filters
 */
export function useHomePrompts(filters) {
  const [prompts, setPrompts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(null);

      try {
        const data = await fetchHomePrompts(filters);
        if (!cancelled) setPrompts(data);
      } catch (err) {
        if (!cancelled) setError(err.message ?? "Failed to load prompts");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [
    filters.search,
    filters.minRating,
    filters.models.join(","),
    filters.categories.join(","),
  ]);

  return { prompts, loading, error };
}
