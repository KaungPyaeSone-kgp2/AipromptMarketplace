import React from "react";
import { Link } from "react-router";
import { HeartIcon, GlobeIcon, FollowersIcon, DraftIcon } from "./Icon.jsx";
import Tag from "./Tag.jsx";
import { useShop } from "../context/ShopContext.jsx";
import { getCurrentUserId } from "../services/currentUser.js";

function VisibilityBadge({ visibility }) {
  const normVis = (visibility || "").toLowerCase().replace(/_/g, " ").replace(/-/g, " ");
  
  if (normVis === "draft") {
    return (
      <div className="flex items-center gap-1.5 rounded-md bg-slate-800/90 px-2 py-1 text-[10px] font-bold text-slate-700 dark:text-slate-300 ring-1 ring-slate-600/50 backdrop-blur-md">
        <DraftIcon className="h-3 w-3" /> Draft
      </div>
    );
  }
  if (normVis === "followers only" || normVis === "only follower" || normVis === "only followers") {
    return (
      <div className="flex items-center gap-1.5 rounded-md bg-blue-500/90 px-2 py-1 text-[10px] font-bold text-slate-900 dark:text-white ring-1 ring-blue-500/30 backdrop-blur-md">
        <FollowersIcon className="h-3 w-3" /> Followers Only
      </div>
    );
  }
  return (
    <div className="flex items-center gap-1.5 rounded-md bg-emerald-500/90 px-2 py-1 text-[10px] font-bold text-slate-900 dark:text-white ring-1 ring-emerald-500/30 backdrop-blur-md">
      <GlobeIcon className="h-3 w-3" /> Public
    </div>
  );
}


/* ── Inline icons for hover overlay ── */
function ExternalLinkIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-4 w-4"
    >
      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
      <polyline points="15 3 21 3 21 9" />
      <line x1="10" y1="14" x2="21" y2="3" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-3.5 w-3.5"
    >
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}

export default function PromptCard({
  prompt,
  actionLabel = "View Prompt",
  variant = "detailed",
  showActions = false,
  hideCommerceActions = false,
  onActionClick = null,
  actionTo = null,
  showVisibilityInfo = false,
  showVisibilityBadge = false,
  children
}) {
  const { isInWishlist, toggleWishlist } = useShop();
  const inWishlist = isInWishlist(prompt.id);
  const isMarketplace = variant === "grid" || showActions;
  const currentUserId = String(getCurrentUserId());
  const isCreator = String(prompt.creatorId) === currentUserId;

  const creatorLink = prompt.creatorId
    ? `/user/profile/${prompt.creatorId}`
    : null;
  const promptLink = `/user/prompt/${prompt.id}`;
  const actionLink = actionTo ?? promptLink;
  const ratingLabel =
    typeof prompt.rating === "number" && prompt.rating > 0
      ? prompt.rating.toFixed(1).replace(".0", "")
      : "New";

  /* ═══════════════════════════════════════════════════════
     Grid / Marketplace card — PromptBase-style hover
     ═══════════════════════════════════════════════════════ */
  if (variant === "grid" || isMarketplace) {
    return (
      <article className="prompt-card group relative overflow-hidden rounded-2xl border border-slate-400/50 dark:border-slate-700/50 bg-slate-100/80 dark:bg-slate-900/80">
        <div className="relative flex aspect-[4/3] items-center justify-center overflow-hidden bg-slate-950/60">
          {/* ── Main image ── */}
          {prompt.imageUrl ? (
            <img
              src={prompt.imageUrl}
              alt={prompt.title}
              className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-110 select-none"
              loading="lazy"
              draggable="false"
            />
          ) : (
            <span className="text-sm font-semibold text-slate-500">
              Prompt Image
            </span>
          )}

          {/* ── Default gradient (visible at rest) ── */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/60 transition-opacity duration-300 group-hover:opacity-0 pointer-events-none" />

          {/* ── Hover gradient (visible on hover) ── */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/5 to-black/80 opacity-0 transition-opacity duration-300 group-hover:opacity-100 pointer-events-none" />

          {/* ── Default labels (fade out on hover) ── */}
          <div className="absolute left-3 top-3 text-xs font-black text-white drop-shadow-md transition-opacity duration-200 group-hover:opacity-0 pointer-events-none">
            {prompt.model || "AI"}
          </div>

          <div className="absolute right-3 top-3 text-xs font-black text-white drop-shadow-md transition-opacity duration-200 group-hover:opacity-0 pointer-events-none">
            {ratingLabel} ★
          </div>

          <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-3 p-3 transition-opacity duration-200 group-hover:opacity-0 pointer-events-none">
            <h3 className="line-clamp-2 text-base font-black leading-tight text-white drop-shadow-md">
              {prompt.title}
            </h3>
          </div>

          {/* ════════════════════════════════════════════════
              HOVER OVERLAY — action buttons (top-right)
              ════════════════════════════════════════════════ */}
          <div className="prompt-card__actions absolute right-3 top-3 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            {!hideCommerceActions && !isCreator && (
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  toggleWishlist(prompt);
                }}
                aria-label={
                  inWishlist ? "Remove from wishlist" : "Add to wishlist"
                }
                title={
                  inWishlist ? "Remove from wishlist" : "Add to wishlist"
                }
                className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100/80 dark:bg-slate-900/80 text-slate-900 dark:text-white shadow-lg ring-1 ring-white/10 backdrop-blur-sm transition-all duration-200 hover:scale-110 hover:bg-rose-500 hover:text-white hover:ring-rose-400/30"
              >
                <HeartIcon filled={inWishlist} className="h-4 w-4" />
              </button>
            )}

            <Link
              to={promptLink}
              aria-label="View details"
              title="View details"
              onClick={(e) => e.stopPropagation()}
              className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100/80 dark:bg-slate-900/80 text-slate-900 dark:text-white shadow-lg ring-1 ring-white/10 backdrop-blur-sm transition-all duration-200 hover:scale-110 hover:bg-violet-500 hover:ring-violet-400/30"
            >
              <ExternalLinkIcon />
            </Link>
          </div>
          {/* ════════════════════════════════════════════════
              HOVER OVERLAY — bottom info + CTA
              ════════════════════════════════════════════════ */}
          <div className="prompt-card__info absolute inset-x-0 bottom-0 flex items-end justify-between gap-3 p-4 opacity-0 group-hover:opacity-100 translate-y-4 group-hover:translate-y-0 transition-all duration-300">
            <div className="min-w-0 flex-1">
              <h3 className="line-clamp-1 text-sm font-bold leading-tight text-slate-900 dark:text-white drop-shadow-lg">
                {prompt.title}
              </h3>
              <p className="mt-0.5 text-xs font-medium text-slate-300/80">
                {prompt.model || "AI"}
              </p>
              <div className="mt-1 flex items-center gap-2 text-xs text-white/70">
                <span className="font-bold text-amber-300">
                  {ratingLabel} ★
                </span>
              </div>
            </div>

            {onActionClick ? (
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); onActionClick(prompt); }}
                className="shrink-0 rounded-xl bg-violet-600 px-3 py-2 text-[11px] font-black text-slate-900 dark:text-white shadow-lg transition hover:bg-violet-500"
              >
                {actionLabel}
              </button>
            ) : (
              <Link
                to={actionLink}
                onClick={(e) => e.stopPropagation()}
                className="shrink-0 rounded-xl bg-violet-600 px-3 py-2 text-[11px] font-black text-slate-900 dark:text-white shadow-lg transition hover:bg-violet-500"
              >
                {actionLabel}
              </Link>
            )}
          </div>
        </div>
      </article>
    );
  }

  /* ═══════════════════════════════════════════════════════
     Detailed variant (unchanged)
     ═══════════════════════════════════════════════════════ */
  const imageBlock = (
    <div className="relative flex aspect-[4/3] items-center justify-center overflow-hidden rounded-2xl bg-slate-950/60">
      {prompt.imageUrl ? (
        <img
          src={prompt.imageUrl}
          alt={prompt.title}
          className="h-full w-full object-cover transition duration-300 group-hover:scale-110 select-none"
          loading="lazy"
          draggable="false"
        />
      ) : (
        <span className="text-sm font-semibold text-slate-500">
          Prompt Image
        </span>
      )}

      <div className="absolute inset-0 bg-gradient-to-b from-black/45 via-transparent to-black/70" />

      <div className="absolute left-3 top-3 flex flex-col items-start gap-2 drop-shadow">
        <span className="text-xs font-black text-slate-900 dark:text-white">{prompt.model || "AI"}</span>
        {showVisibilityBadge && <VisibilityBadge visibility={prompt.visibility} />}
      </div>

      <div className="absolute right-3 top-3 text-xs font-black text-slate-900 dark:text-white drop-shadow">
        {ratingLabel} *
      </div>

      <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-3 p-3">
        <h3 className="line-clamp-2 text-base font-black leading-tight text-slate-900 dark:text-white drop-shadow">
          {prompt.title}
        </h3>
      </div>
    </div>
  );

  const creatorRow = (prompt.creatorName || prompt.creator) && (
    <div className="mt-3 flex items-center gap-2">
      {creatorLink ? (
        <Link
          to={creatorLink}
          className="flex min-w-0 items-center gap-2 rounded-xl p-1 transition hover:bg-slate-800/60"
          onClick={(e) => e.stopPropagation()}
        >
          <img
            src={prompt.creatorAvatarUrl}
            alt={prompt.creatorName ?? prompt.creator}
            className="h-8 w-8 shrink-0 rounded-full object-cover ring-2 ring-violet-500/50 dark:ring-violet-500/30"
          />
          <span className="truncate text-xs font-bold text-violet-800 dark:text-violet-200">
            {prompt.creatorName ?? prompt.creator}
          </span>
        </Link>
      ) : (
        <>
          <img
            src={prompt.creatorAvatarUrl}
            alt={prompt.creatorName ?? prompt.creator}
            className="h-8 w-8 rounded-full object-cover ring-2 ring-violet-500/50 dark:ring-violet-500/30"
          />
          <span className="text-xs font-bold text-slate-600 dark:text-slate-400">
            {prompt.creatorName ?? prompt.creator}
          </span>
        </>
      )}
    </div>
  );

  return (
    <article className="surface overflow-hidden p-5 transition hover:-translate-y-0.5 hover:border-violet-400/40">
      <div className="mb-4 overflow-hidden rounded-2xl">{imageBlock}</div>

      <div className="flex items-start justify-between gap-3">
        <h3 className="line-clamp-1 text-base font-bold text-slate-900 dark:text-white">
          {prompt.title}
        </h3>
        {typeof prompt.rating === "number" && prompt.rating > 0 && (
          <span className="badge-pill bg-amber-500/15 text-amber-600 dark:text-amber-400 px-2 py-1 rounded-full text-xs font-bold">
            ★ {ratingLabel}
          </span>
        )}
      </div>

      <p className="mt-3 line-clamp-3 text-sm leading-6 text-slate-600 dark:text-slate-400">
        {prompt.description || prompt.promptText}
      </p>

      {creatorRow}

      <div className="mt-4 flex flex-wrap gap-2">
        {prompt.model && <Tag label={prompt.model} />}
        {prompt.category && <Tag label={prompt.category} />}
      </div>

      <div className="mt-5 flex items-center justify-between gap-3">
        {showVisibilityInfo && (
          <Link
            to={promptLink}
            className="rounded-xl border border-slate-400 dark:border-slate-700 bg-slate-200 dark:bg-slate-800 px-4 py-2 text-xs font-bold text-slate-700 dark:text-slate-300 transition hover:bg-slate-700"
          >
            View Post
          </Link>
        )}
        <Link
          to={actionLink}
          className="rounded-xl bg-violet-600 px-4 py-2 text-xs font-bold text-slate-900 dark:text-white transition hover:bg-violet-500"
        >
          {actionLabel}
        </Link>
      </div>
      {children}
    </article>
  );
}
