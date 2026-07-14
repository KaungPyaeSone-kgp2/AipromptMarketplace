import { useEffect, useMemo, useState } from "react";
import { Link, useParams, useNavigate, useLocation } from "react-router";
import { HeartIcon, TrashIcon, CopyIcon } from "../components/Icon.jsx";
import ReportButton from "../components/ReportButton.jsx";
import { useShop, WISHLIST_UPDATED_EVENT } from "../context/ShopContext.jsx";

import {
  fetchPromptById,
  PROMPTS_UPDATED_EVENT,
  updatePromptInCache,
} from "../services/promptService.js";
import {
  addPromptReview,
  deletePromptReview,
  fetchPromptReviews,
  RATINGS_UPDATED_EVENT,
} from "../services/reviewService.js";
import { getCurrentUserId } from "../services/currentUser.js";
import { fetchFollowStatus } from "../services/followService.js";

function formatDate(value) {
  if (!value) return "";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";

  return date.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function Stars({ value = 0 }) {
  const rounded = Math.round(Number(value) || 0);

  return (
    <span className="text-amber-300" aria-label={`${value} star rating`}>
      {"★".repeat(Math.max(0, Math.min(5, rounded)))}
      <span className="text-slate-600">
        {"★".repeat(Math.max(0, 5 - rounded))}
      </span>
    </span>
  );
}

export default function PromptDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { isInWishlist, toggleWishlist } = useShop();

  const [prompt, setPrompt] = useState(null);
  const [reviewSummary, setReviewSummary] = useState({
    count: 0,
    averageRating: 0,
    reviews: [],
  });
  const [commentRating, setCommentRating] = useState(5);
  const [commentText, setCommentText] = useState("");
  const [commentSubmitting, setCommentSubmitting] = useState(false);
  const [commentError, setCommentError] = useState("");
  const [deletingReviewId, setDeletingReviewId] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function loadPromptDetail() {
      try {
        const [promptData, reviewsData] = await Promise.all([
          fetchPromptById(id),
          fetchPromptReviews(id).catch(() => ({
            count: 0,
            averageRating: 0,
            reviews: [],
          })),
        ]);

        let finalPromptData = promptData;

        if (finalPromptData) {
          const currentUserId = String(getCurrentUserId());
          if (
            finalPromptData.visibility === 'followers_only' &&
            String(finalPromptData.creatorId) !== currentUserId
          ) {
            const isFollowing = await fetchFollowStatus(finalPromptData.creatorId).catch(() => false);
            if (!isFollowing) {
              finalPromptData = null;
            }
          }
        }

        if (cancelled) return;

        setPrompt(finalPromptData);
        setReviewSummary(reviewsData);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadPromptDetail();
    window.addEventListener(PROMPTS_UPDATED_EVENT, loadPromptDetail);

    const handleWishlistUpdated = (e) => {
      const { promptId, added } = e.detail;
      if (String(promptId) === String(id)) {
        setPrompt((currentPrompt) => {
          if (!currentPrompt) return currentPrompt;
          return {
            ...currentPrompt,
            wishlistCount: Math.max(0, (currentPrompt.wishlistCount ?? 0) + (added ? 1 : -1))
          };
        });
      }
    };
    window.addEventListener(WISHLIST_UPDATED_EVENT, handleWishlistUpdated);

    return () => {
      cancelled = true;
      window.removeEventListener(PROMPTS_UPDATED_EVENT, loadPromptDetail);
      window.removeEventListener(WISHLIST_UPDATED_EVENT, handleWishlistUpdated);
    };
  }, [id]);

  const rating = reviewSummary.averageRating ?? prompt?.rating ?? 0;
  const reviewCount = reviewSummary.count ?? prompt?.reviewCount ?? 0;
  const priceLabel = Number(prompt?.price) > 0 ? `${prompt.price} coins` : "Free";
  const currentUserId = String(getCurrentUserId());
  const getAccountPath = (accountId) => `/user/profile/${accountId}`;
  const inWishlist = prompt ? isInWishlist(prompt.id) : false;
  // const syncReviewSummary = (updatedReviews) => {
  //   setReviewSummary(updatedReviews);
  //   updatePromptInCache(prompt.id, {
  //     rating: updatedReviews.averageRating,
  //     reviewCount: updatedReviews.count,
  //   });
  //   setPrompt((currentPrompt) =>
  //     currentPrompt
  //       ? {
  //           ...currentPrompt,
  //           reviewCount: updatedReviews.count,
  //           rating: updatedReviews.averageRating,
  //         }
  //       : currentPrompt
  //   );
  // };
  const getCurrentScrollTop = () => {
    const scrollContainer = document.querySelector(".app-scrollbar");
    return scrollContainer ? scrollContainer.scrollTop : window.scrollY;
  };

  const restoreScrollTop = (scrollTop) => {
    requestAnimationFrame(() => {
      const scrollContainer = document.querySelector(".app-scrollbar");

      if (scrollContainer) {
        scrollContainer.scrollTop = scrollTop;
        return;
      }

      window.scrollTo({ top: scrollTop, left: 0, behavior: "auto" });
    });
  };

  const syncReviewSummary = (updatedReviews) => {
    setReviewSummary(updatedReviews);
    updatePromptInCache(prompt.id, {
      rating: updatedReviews.averageRating,
      reviewCount: updatedReviews.count,
    });
    setPrompt((currentPrompt) =>
      currentPrompt
        ? {
          ...currentPrompt,
          reviewCount: updatedReviews.count,
          rating: updatedReviews.averageRating,
        }
        : currentPrompt
    );
  };

  const renderHighlightedPromptText = () => {
    if (!prompt?.promptText) return "No prompt content available.";

    let text = prompt.promptText
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");

    if (prompt.promptVariables && prompt.promptVariables.length > 0) {
      prompt.promptVariables.forEach((variable) => {
        if (!variable.name?.trim()) return;
        const safeName = variable.name
          .trim()
          .replace(/&/g, "&amp;")
          .replace(/</g, "&lt;")
          .replace(/>/g, "&gt;")
          .replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
        const regex = new RegExp(`\\[?${safeName}\\]?`, "gi");
        text = text.replace(regex, (match) => (
          `<mark class="rounded px-1 mx-0.5 font-bold shadow-sm" style="background-color: ${variable.color || '#8b5cf6'}; color: white;">${match}</mark>`
        ));
      });
    }

    return <span dangerouslySetInnerHTML={{ __html: text }} />;
  };

  const handleSubmitComment = async (event) => {
    event.preventDefault();

    const trimmedComment = commentText.trim();
    if (!trimmedComment) {
      setCommentError("Please write a comment before submitting.");
      return;
    }

    const scrollTop = getCurrentScrollTop();
    setCommentSubmitting(true);
    setCommentError("");

    try {
      await addPromptReview(prompt.id, {
        rating: commentRating,
        comment: trimmedComment,
      });

      const updatedReviews = await fetchPromptReviews(prompt.id);
      syncReviewSummary(updatedReviews);
      restoreScrollTop(scrollTop);
      setCommentText("");
      setCommentRating(5);
    } catch (error) {
      setCommentError(error.message || "Failed to add comment.");
      restoreScrollTop(scrollTop);
    } finally {
      setCommentSubmitting(false);
    }
  };

  const handleCommentKeyDown = (event) => {
    if (event.key !== "Enter" || event.shiftKey || event.nativeEvent.isComposing) {
      return;
    }

    event.preventDefault();
    event.currentTarget.form?.requestSubmit();
  };

  const handleDeleteReview = async (reviewId) => {
    if (!prompt || deletingReviewId) return;
    const scrollTop = getCurrentScrollTop();
    const previousSummary = reviewSummary;
    const nextReviews = reviewSummary.reviews.filter(
      (review) => String(review.id) !== String(reviewId)
    );
    const nextCount = Math.max(0, reviewSummary.count - 1);
    const nextAverageRating =
      nextReviews.length > 0
        ? nextReviews.reduce(
          (sum, review) => sum + Number(review.rating || 0),
          0
        ) / nextReviews.length
        : 0;

    setDeletingReviewId(reviewId);
    setCommentError("");
    syncReviewSummary({
      count: nextCount,
      averageRating: nextAverageRating,
      reviews: nextReviews,
    });
    restoreScrollTop(scrollTop);
    window.dispatchEvent(
      new CustomEvent(RATINGS_UPDATED_EVENT, {
        detail: { buyerDelta: -1 },
      })
    );

    try {
      const result = await deletePromptReview(reviewId);

      syncReviewSummary({
        count: Number(result.review_count ?? nextCount),
        averageRating: Number(result.average_rating ?? nextAverageRating),
        reviews: nextReviews,
      });
      restoreScrollTop(scrollTop);
    } catch (error) {
      syncReviewSummary(previousSummary);
      window.dispatchEvent(
        new CustomEvent(RATINGS_UPDATED_EVENT, {
          detail: { buyerDelta: 1 },
        })
      );
      restoreScrollTop(scrollTop);
      setCommentError(error.message || "Failed to delete comment.");
    } finally {
      setDeletingReviewId(null);
    }
  };



  const handleToggleWishlist = () => {
    if (prompt) toggleWishlist(prompt);
  };

  if (loading) {
    return (
      <div className="glass-panel p-10 text-center text-sm text-slate-600 dark:text-slate-400">
        Loading prompt detail...
      </div>
    );
  }

  if (!prompt) {
    return (
      <div className="glass-panel p-10 text-center">
        <p className="text-sm text-slate-600 dark:text-slate-400">Prompt not found.</p>
        <Link to="/" className="mt-4 inline-block text-sm font-bold text-violet-700 dark:text-violet-300">
          Back to Home
        </Link>
      </div>
    );
  }

  return (
    <div className="grid gap-8 xl:grid-cols-[minmax(0,0.95fr)_minmax(380px,0.75fr)]">
      <div className="space-y-6">
        <div className="overflow-hidden rounded-2xl border border-slate-700/60 bg-slate-950/70">
          {prompt.imageUrl ? (
            <img
              src={prompt.imageUrl}
              alt={prompt.title}
              className="w-full object-cover transition-transform duration-300 hover:scale-105"
            />
          ) : (
            <div className="flex aspect-[4/3] items-center justify-center text-sm font-semibold text-slate-500">
              Prompt Image
            </div>
          )}
        </div>

        <section className="surface-strong p-6">
          <h3 className="text-sm font-bold uppercase tracking-widest text-slate-500 mb-2">Description</h3>
          <p className="text-sm leading-6 text-slate-700 dark:text-slate-300">
            {prompt.description || "No description available."}
          </p>

          <div className="mt-6 flex items-center justify-between mb-2">
            <h3 className="text-sm font-bold uppercase tracking-widest text-slate-500">Full Prompt</h3>
            <button
              onClick={() => {
                if (prompt.promptText) {
                  navigator.clipboard.writeText(prompt.promptText);
                }
              }}
              className="p-1.5 text-slate-500 hover:text-violet-600 dark:hover:text-violet-400 transition-colors rounded-md hover:bg-slate-200 dark:hover:bg-slate-800"
              title="Copy prompt text"
            >
              <CopyIcon className="h-5 w-5" />
            </button>
          </div>
          <div className="rounded-xl bg-slate-100 dark:bg-slate-950/50 p-4 border border-slate-300 dark:border-slate-800">
            <p className="text-sm leading-6 text-slate-800 dark:text-slate-200 font-mono whitespace-pre-wrap break-words">
              {renderHighlightedPromptText()}
            </p>
          </div>
        </section>

        <section className="surface-strong p-5">
          <div className="flex flex-wrap items-end justify-between gap-3 border-b border-slate-700/70 pb-4">
            <div>
              <h2 className="text-lg font-black text-slate-900 dark:text-white">Reviews</h2>
              <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                {reviewCount.toLocaleString()} review{reviewCount === 1 ? "" : "s"} for this prompt
              </p>
            </div>
            <div className="text-sm font-black text-slate-900 dark:text-white">
              {rating.toFixed(1).replace(".0", "")} <Stars value={rating} />
            </div>
          </div>

          {String(prompt.creatorId) !== currentUserId && (
            <form
              onSubmit={handleSubmitComment}
              className="mt-5 rounded-xl border border-slate-300 dark:border-slate-800 bg-slate-100 dark:bg-slate-950/50 p-4"
            >
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h3 className="text-sm font-black text-slate-900 dark:text-white">Add Comment</h3>
                  <p className="mt-1 text-xs text-slate-500">
                    Share your rating and review for this prompt.
                  </p>
                </div>
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setCommentRating(star)}
                      className={`text-xl transition ${star <= commentRating
                        ? "text-amber-300"
                        : "text-slate-600 hover:text-amber-200"
                        }`}
                      aria-label={`${star} star rating`}
                    >
                      ★
                    </button>
                  ))}
                </div>
              </div>

              <textarea
                value={commentText}
                onChange={(event) => setCommentText(event.target.value)}
                onKeyDown={handleCommentKeyDown}
                rows={4}
                placeholder="Write your review comment..."
                className="mt-4 w-full resize-none rounded-xl border border-slate-400 dark:border-slate-700 bg-slate-100 dark:bg-slate-900 px-4 py-3 text-sm text-slate-800 dark:text-slate-200 outline-none transition placeholder:text-slate-500 focus:border-violet-500 focus:ring-4 focus:ring-violet-500/10"
              />

              {commentError && (
                <p className="mt-2 text-xs font-semibold text-rose-700 dark:text-rose-300">
                  {commentError}
                </p>
              )}

              <div className="mt-3 flex justify-end">
                <button
                  type="submit"
                  disabled={commentSubmitting}
                  className="h-10 rounded-xl bg-violet-600 px-5 text-sm font-black text-slate-900 dark:text-white transition hover:bg-violet-500 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {commentSubmitting ? "Submitting..." : "Submit Comment"}
                </button>
              </div>
            </form>
          )}

          <div className="mt-5 space-y-4">
            {reviewSummary.reviews.length === 0 ? (
              <p className="rounded-xl border border-slate-300 dark:border-slate-800 bg-slate-100 dark:bg-slate-950/50 p-5 text-sm text-slate-800 dark:text-slate-500">
                No reviews yet.
              </p>
            ) : (
              reviewSummary.reviews.map((review) => (
                <article
                  key={review.id}
                  className="rounded-xl border border-slate-300 dark:border-slate-800 bg-slate-100 dark:bg-slate-950/50 p-4"
                >
                  <div className="flex items-start gap-3">
                    <Link
                      to={getAccountPath(review.userId, review.reviewerIsCreator)}
                      className="shrink-0 rounded-full transition hover:scale-105"
                    >
                      <img
                        src={review.reviewerAvatarUrl}
                        alt={review.reviewerName}
                        className="h-10 w-10 rounded-full object-cover ring-2 ring-violet-500/25"
                      />
                    </Link>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="flex flex-wrap items-center gap-2">
                          <Link
                            to={getAccountPath(review.userId, review.reviewerIsCreator)}
                            className="font-bold text-slate-900 dark:text-white transition hover:text-violet-300"
                          >
                            {review.reviewerName}
                          </Link>
                          <span className="text-sm">
                            <Stars value={review.rating} />
                          </span>
                        </div>
                        {String(review.userId) === currentUserId ? (
                          <button
                            type="button"
                            onClick={() => handleDeleteReview(review.id)}
                            disabled={deletingReviewId === review.id}
                            className="inline-flex items-center gap-1.5 rounded-lg px-2 py-1 text-xs font-bold text-rose-700 dark:text-rose-300 transition hover:bg-rose-500/10 hover:text-rose-200 disabled:cursor-not-allowed disabled:opacity-60"
                          >
                            <TrashIcon />
                            <span>{deletingReviewId === review.id ? "Deleting..." : "Delete"}</span>
                          </button>
                        ) : (
                          <ReportButton targetType="comment" targetId={review.id} />
                        )}
                      </div>
                      {review.createdAt && (
                        <p className="mt-0.5 text-xs text-slate-500">
                          {formatDate(review.createdAt)}
                        </p>
                      )}
                      <p className="mt-3 text-sm leading-6 text-slate-700 dark:text-slate-300">
                        {review.comment || "No review comment."}
                      </p>
                    </div>
                  </div>
                </article>
              ))
            )}
          </div>
        </section>
      </div>

      <aside className="xl:sticky xl:top-24 xl:self-start">
        <section className="surface-strong p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-black uppercase tracking-widest text-violet-700 dark:text-violet-300">
                {prompt.model}
              </p>
              <h1 className="mt-3 text-3xl font-black leading-tight text-slate-900 dark:text-white">
                {prompt.title}
              </h1>
            </div>
            <div className="flex shrink-0 items-center gap-2">
              {String(prompt.creatorId) !== currentUserId && (
                <button
                  type="button"
                  onClick={handleToggleWishlist}
                  className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100/80 dark:bg-slate-900/80 text-slate-900 dark:text-white shadow-lg ring-1 ring-white/10 backdrop-blur-sm transition-all duration-200 hover:scale-110 hover:bg-rose-500 hover:text-white hover:ring-rose-400/30"
                  aria-label={inWishlist ? "Remove from wishlist" : "Add to wishlist"}
                  title={inWishlist ? "Remove from wishlist" : "Add to wishlist"}
                >
                  <HeartIcon filled={inWishlist} className="h-5 w-5" />
                </button>
              )}
              {String(prompt.creatorId) !== currentUserId && (
                <ReportButton targetType="prompt" targetId={prompt.id} />
              )}
            </div>
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-3 text-sm text-slate-700 dark:text-slate-300">
            {prompt.creatorId && (
              <Link
                to={`/user/profile/${prompt.creatorId}`}
                className="inline-flex items-center gap-2 rounded-xl pr-2 font-bold text-violet-800 dark:text-violet-200 transition hover:bg-slate-800/70 hover:text-white"
              >
                <img
                  src={prompt.creatorAvatarUrl}
                  alt={prompt.creatorName}
                  className="h-8 w-8 rounded-full object-cover"
                />
                {prompt.creatorName}
              </Link>
            )}
            <span>{rating.toFixed(1).replace(".0", "")} ★</span>
            <span>{reviewCount.toLocaleString()} reviews</span>
          </div>

          <div className="mt-6 grid grid-cols-2 gap-3 border-t border-slate-700/70 pt-5 text-sm">
            <div>
              <p className="font-black text-slate-900 dark:text-white">
                {(prompt.wishlistCount ?? 0).toLocaleString()}
              </p>
              <p className="text-slate-500">Wishlist</p>
            </div>
            <div>
              <p className="font-black text-slate-900 dark:text-white">
                {rating.toFixed(1).replace(".0", "")}
              </p>
              <p className="text-slate-500">Average rating</p>
            </div>
            <div>
              <p className="font-black text-slate-900 dark:text-white">
                {reviewCount.toLocaleString()}
              </p>
              <p className="text-slate-500">Review count</p>
            </div>
          </div>

          </div>
        </section>
      </aside>
    </div>
  );
}
