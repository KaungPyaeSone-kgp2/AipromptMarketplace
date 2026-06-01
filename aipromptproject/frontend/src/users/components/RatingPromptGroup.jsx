import { useMemo, useState } from "react";
import { Link } from "react-router";

function formatRating(value) {
  return Number(value || 0).toFixed(1).replace(".0", "");
}

function groupRatingsByPrompt(ratings) {
  const groups = new Map();

  ratings.forEach((rating) => {
    const key = rating.promptId;
    const current = groups.get(key) ?? {
      promptId: rating.promptId,
      promptTitle: rating.promptTitle,
      promptDescription: rating.promptDescription,
      creatorName: rating.creatorName,
      reviews: [],
      ratingTotal: 0,
    };

    current.reviews.push(rating);
    current.ratingTotal += Number(rating.rating || 0);
    groups.set(key, current);
  });

  return Array.from(groups.values()).map((group) => ({
    ...group,
    averageRating:
      group.reviews.length > 0 ? group.ratingTotal / group.reviews.length : 0,
    reviewCount: group.reviews.length,
  }));
}

export default function RatingPromptGroups({ ratings, mode = "buyer" }) {
  const [openPromptIds, setOpenPromptIds] = useState(new Set());
  const groups = useMemo(() => groupRatingsByPrompt(ratings), [ratings]);

  const togglePrompt = (promptId) => {
    setOpenPromptIds((current) => {
      const next = new Set(current);

      if (next.has(promptId)) {
        next.delete(promptId);
      } else {
        next.add(promptId);
      }

      return next;
    });
  };

  return (
    <div className="space-y-3">
      {groups.map((group) => {
        const open = openPromptIds.has(group.promptId);

        return (
          <section key={group.promptId} className="surface p-5">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
              <button
                type="button"
                onClick={() => togglePrompt(group.promptId)}
                className="min-w-0 flex-1 text-left"
              >
                <p className="font-bold text-white">{group.promptTitle}</p>
                <p className="mt-1 text-sm text-slate-400">
                  Creator: {group.creatorName}
                </p>
                <p className="mt-3 line-clamp-2 text-sm leading-6 text-slate-300">
                  {group.promptDescription || "No prompt description."}
                </p>
              </button>

              <div className="flex shrink-0 items-center gap-3">
                <div className="text-right">
                  <span className="badge-pill bg-yellow-500/15 text-yellow-300">
                    ★ {formatRating(group.averageRating)}
                  </span>
                  <p className="mt-2 text-xs text-slate-500">
                    {group.reviewCount} review{group.reviewCount === 1 ? "" : "s"}
                  </p>
                </div>
                <Link
                  to={`/prompt/${group.promptId}`}
                  className="rounded-xl bg-violet-600 px-4 py-2 text-xs font-black text-white transition hover:bg-violet-500"
                >
                  Detail
                </Link>
              </div>
            </div>

            {open && (
              <div className="mt-5 space-y-3 border-t border-slate-800 pt-4">
                {group.reviews.map((review) => (
                  <div
                    key={review.id}
                    className="rounded-xl bg-slate-950/50 p-4"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <img
                          src={review.buyerAvatarUrl}
                          alt={review.buyerName}
                          className="h-9 w-9 rounded-full object-cover ring-2 ring-violet-500/30"
                        />
                        <div>
                          <p className="text-sm font-black text-white">
                            {mode === "creator" ? review.buyerName : "Your review"}
                          </p>
                          <p className="text-xs text-slate-500">{review.date}</p>
                        </div>
                      </div>
                      <span className="text-sm font-black text-yellow-300">
                        ★ {formatRating(review.rating)}
                      </span>
                    </div>
                    <p className="mt-3 text-sm leading-6 text-slate-300">
                      {review.review || "No review comment."}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </section>
        );
      })}
    </div>
  );
}
