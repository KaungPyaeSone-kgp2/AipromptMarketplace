import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router";
import { HeartIcon } from "../components/Icon.jsx";
import { useShop } from "../context/ShopContext.jsx";
import { fetchPromptById } from "../services/promptService.js";
import { addPromptReview, fetchPromptReviews } from "../services/reviewService.js";

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
  const { promptId } = useParams();
  const { addToCart, toggleWishlist, isInCart, isInWishlist } = useShop();
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
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function loadPromptDetail() {
      setLoading(true);

      try {
        const [promptData, reviewsData] = await Promise.all([
          fetchPromptById(promptId),
          fetchPromptReviews(promptId).catch(() => ({
            count: 0,
            averageRating: 0,
            reviews: [],
          })),
        ]);

        if (cancelled) return;

        setPrompt(promptData);
        setReviewSummary(reviewsData);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadPromptDetail();

    return () => {
      cancelled = true;
    };
  }, [promptId]);

  const rating = reviewSummary.averageRating || prompt?.rating || 0;
  const reviewCount = reviewSummary.count || prompt?.reviewCount || 0;
  const priceLabel = Number(prompt?.price) > 0 ? `${prompt.price} coins` : "Free";
  const inWishlist = useMemo(
    () => (prompt ? isInWishlist(prompt.id) : false),
    [isInWishlist, prompt]
  );

  const handleSubmitComment = async (event) => {
    event.preventDefault();

    const trimmedComment = commentText.trim();
    if (!trimmedComment) {
      setCommentError("Please write a comment before submitting.");
      return;
    }

    setCommentSubmitting(true);
    setCommentError("");

    try {
      await addPromptReview(prompt.id, {
        rating: commentRating,
        comment: trimmedComment,
      });

      const updatedReviews = await fetchPromptReviews(prompt.id);
      setReviewSummary(updatedReviews);
      setPrompt((currentPrompt) =>
        currentPrompt
          ? {
              ...currentPrompt,
              reviewCount: updatedReviews.count,
              rating: updatedReviews.averageRating,
            }
          : currentPrompt
      );
      setCommentText("");
      setCommentRating(5);
    } catch (error) {
      setCommentError(error.message || "Failed to add comment.");
    } finally {
      setCommentSubmitting(false);
    }
  };

  const updateWishlistCount = (delta) => {
    setPrompt((currentPrompt) =>
      currentPrompt
        ? {
            ...currentPrompt,
            wishlistCount: Math.max(
              0,
              (currentPrompt.wishlistCount ?? 0) + delta
            ),
          }
        : currentPrompt
    );
  };

  const handleToggleWishlist = async () => {
    if (!prompt) return;

    const delta = inWishlist ? -1 : 1;
    updateWishlistCount(delta);

    try {
      await toggleWishlist(prompt);
    } catch {
      updateWishlistCount(-delta);
    }
  };

  if (loading) {
    return (
      <div className="glass-panel p-10 text-center text-sm text-slate-400">
        Loading prompt detail...
      </div>
    );
  }

  if (!prompt) {
    return (
      <div className="glass-panel p-10 text-center">
        <p className="text-sm text-slate-400">Prompt not found.</p>
        <Link to="/" className="mt-4 inline-block text-sm font-bold text-violet-300">
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
              className="w-full object-cover"
            />
          ) : (
            <div className="flex aspect-[4/3] items-center justify-center text-sm font-semibold text-slate-500">
              Prompt Image
            </div>
          )}
        </div>

        <section className="surface-strong p-5">
          <div className="flex flex-wrap items-end justify-between gap-3 border-b border-slate-700/70 pb-4">
            <div>
              <h2 className="text-lg font-black text-white">Reviews</h2>
              <p className="mt-1 text-sm text-slate-400">
                {reviewCount.toLocaleString()} review{reviewCount === 1 ? "" : "s"} for this prompt
              </p>
            </div>
            <div className="text-sm font-black text-white">
              {rating.toFixed(1).replace(".0", "")} <Stars value={rating} />
            </div>
          </div>

          <form
            onSubmit={handleSubmitComment}
            className="mt-5 rounded-xl border border-slate-800 bg-slate-950/50 p-4"
          >
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h3 className="text-sm font-black text-white">Add Comment</h3>
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
                    className={`text-xl transition ${
                      star <= commentRating
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
              rows={4}
              placeholder="Write your review comment..."
              className="mt-4 w-full resize-none rounded-xl border border-slate-700 bg-slate-900 px-4 py-3 text-sm text-slate-200 outline-none transition placeholder:text-slate-500 focus:border-violet-500 focus:ring-4 focus:ring-violet-500/10"
            />

            {commentError && (
              <p className="mt-2 text-xs font-semibold text-rose-300">
                {commentError}
              </p>
            )}

            <div className="mt-3 flex justify-end">
              <button
                type="submit"
                disabled={commentSubmitting}
                className="h-10 rounded-xl bg-violet-600 px-5 text-sm font-black text-white transition hover:bg-violet-500 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {commentSubmitting ? "Submitting..." : "Submit Comment"}
              </button>
            </div>
          </form>

          <div className="mt-5 space-y-4">
            {reviewSummary.reviews.length === 0 ? (
              <p className="rounded-xl border border-slate-800 bg-slate-950/50 p-5 text-sm text-slate-500">
                No reviews yet.
              </p>
            ) : (
              reviewSummary.reviews.map((review) => (
                <article
                  key={review.id}
                  className="rounded-xl border border-slate-800 bg-slate-950/50 p-4"
                >
                  <div className="flex items-start gap-3">
                    <img
                      src={review.reviewerAvatarUrl}
                      alt={review.reviewerName}
                      className="h-10 w-10 rounded-full object-cover ring-2 ring-violet-500/25"
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="font-bold text-white">{review.reviewerName}</p>
                        <span className="text-sm">
                          <Stars value={review.rating} />
                        </span>
                      </div>
                      {review.createdAt && (
                        <p className="mt-0.5 text-xs text-slate-500">
                          {formatDate(review.createdAt)}
                        </p>
                      )}
                      <p className="mt-3 text-sm leading-6 text-slate-300">
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
              <p className="text-xs font-black uppercase tracking-widest text-violet-300">
                {prompt.model}
              </p>
              <h1 className="mt-3 text-3xl font-black leading-tight text-white">
                {prompt.title}
              </h1>
            </div>
            <button
              type="button"
              onClick={handleToggleWishlist}
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-slate-700 bg-slate-900 text-white transition hover:border-rose-400 hover:bg-rose-500/15"
              aria-label={
                inWishlist ? "Remove from wishlist" : "Add to wishlist"
              }
              title={
                inWishlist ? "Remove from wishlist" : "Add to wishlist"
              }
            >
              <HeartIcon filled={inWishlist} className="h-5 w-5" />
            </button>
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-3 text-sm text-slate-300">
            {prompt.creatorId && (
              <Link
                to={`/creator/${prompt.creatorId}`}
                className="inline-flex items-center gap-2 rounded-xl pr-2 font-bold text-violet-200 transition hover:bg-slate-800/70 hover:text-white"
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

          <div className="mt-8">
            <p className="text-sm font-bold uppercase tracking-widest text-slate-500">
              Price
            </p>
            <p className="mt-2 text-4xl font-black text-white">{priceLabel}</p>
          </div>

          <button
            type="button"
            onClick={() => addToCart(prompt)}
            disabled={isInCart(prompt.id)}
            className="mt-6 h-12 rounded-xl bg-violet-600 px-6 text-sm font-black text-white transition hover:bg-violet-500 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isInCart(prompt.id) ? "Already in Cart" : "Add to Cart"}
          </button>

          <div className="mt-6 grid grid-cols-2 gap-3 border-y border-slate-700/70 py-5 text-sm">
            <div>
              <p className="font-black text-white">
                {(prompt.wishlistCount ?? 0).toLocaleString()}
              </p>
              <p className="text-slate-500">Wishlist</p>
            </div>
            <div>
              <p className="font-black text-white">
                {(prompt.viewCount ?? 0).toLocaleString()}
              </p>
              <p className="text-slate-500">Views</p>
            </div>
            <div>
              <p className="font-black text-white">
                {rating.toFixed(1).replace(".0", "")}
              </p>
              <p className="text-slate-500">Average rating</p>
            </div>
            <div>
              <p className="font-black text-white">
                {reviewCount.toLocaleString()}
              </p>
              <p className="text-slate-500">Review count</p>
            </div>
          </div>

          <p className="mt-5 text-sm leading-6 text-slate-300">
            {prompt.description || prompt.promptText || "No description available."}
          </p>
        </section>
      </aside>
    </div>
  );
}
