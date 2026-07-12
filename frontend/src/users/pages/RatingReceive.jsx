import { useEffect, useState } from "react";
import RatingPromptGroups from "../components/RatingPromptGroup.jsx";
import { fetchCreatorReceivedRatings, clearCreatorReview } from "../services/reviewService.js";

export default function RatingReceive() {
  const [ratings, setRatings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function loadRatings() {
      setLoading(true);

      try {
        const data = await fetchCreatorReceivedRatings();
        if (!cancelled) setRatings(data);
      } catch (error) {
        console.error("Failed to load creator ratings", error);
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

  const clearRating = async (id) => {
    try {
      await clearCreatorReview(id);
      setRatings(prev => prev.filter(r => r.id !== id));
    } catch (err) {
      console.error("Failed to clear rating:", err);
    }
  };

  const clearAllRatings = async () => {
    try {
      await Promise.all(ratings.map(r => clearCreatorReview(r.id)));
      setRatings([]);
    } catch (err) {
      console.error("Failed to clear all ratings:", err);
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-4xl font-black text-violet-600 dark:text-violet-400">
            Ratings Received
          </h1>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
            Your prompt posts with reviews. Click a prompt to show comments.
          </p>
        </div>
        {ratings.length > 0 && !loading && (
          <button onClick={clearAllRatings} className="mb-1 text-sm font-bold text-rose-500 hover:text-rose-600 transition-colors">
            Clear All
          </button>
        )}
      </div>

      {loading ? (
        <div className="glass-panel p-10 text-center text-sm text-slate-600 dark:text-slate-400">
          Loading ratings...
        </div>
      ) : ratings.length > 0 ? (
        <RatingPromptGroups ratings={ratings} mode="creator" onClear={clearRating} />
      ) : (
        <div className="glass-panel p-10 text-center text-sm text-slate-600 dark:text-slate-400">
          No ratings received yet.
        </div>
      )}
    </div>
  );
}
