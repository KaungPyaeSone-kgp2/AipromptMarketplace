import { useEffect, useState } from "react";
import RatingPromptGroups from "../components/RatingPromptGroup.jsx";
import { fetchCreatorReceivedRatings } from "../services/reviewService.js";

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

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-4xl font-black text-violet-600 dark:text-violet-400">
          Ratings Received
        </h1>
        <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
          Your prompt posts with reviews. Click a prompt to show comments.
        </p>
      </div>

      {loading ? (
        <div className="glass-panel p-10 text-center text-sm text-slate-600 dark:text-slate-400">
          Loading ratings...
        </div>
      ) : ratings.length > 0 ? (
        <RatingPromptGroups ratings={ratings} mode="creator" />
      ) : (
        <div className="glass-panel p-10 text-center text-sm text-slate-600 dark:text-slate-400">
          No ratings received yet.
        </div>
      )}
    </div>
  );
}
