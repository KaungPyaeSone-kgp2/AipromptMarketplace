import { useEffect, useState } from "react";
import RatingPromptGroups from "../components/RatingPromptGroup.jsx";
import { fetchBuyerRatings } from "../services/reviewService.js";

export default function RatingGive() {
  const [ratings, setRatings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function loadRatings() {
      setLoading(true);

      try {
        const data = await fetchBuyerRatings();
        if (!cancelled) setRatings(data);
      } catch (error) {
        console.error("Failed to load buyer ratings", error);
        if (!cancelled) setRatings([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadRatings();

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-4xl font-black text-violet-600 dark:text-violet-400">Rating</h1>
        <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
          Prompt posts you reviewed. Click a prompt to show your review comment.
        </p>
      </div>

      {loading ? (
        <div className="glass-panel p-10 text-center text-sm text-slate-600 dark:text-slate-400">
          Loading ratings...
        </div>
      ) : ratings.length > 0 ? (
        <RatingPromptGroups ratings={ratings} mode="buyer" />
      ) : (
        <div className="glass-panel p-10 text-center text-sm text-slate-600 dark:text-slate-400">
          You have not rated any prompts yet.
        </div>
      )}
    </div>
  );
}
