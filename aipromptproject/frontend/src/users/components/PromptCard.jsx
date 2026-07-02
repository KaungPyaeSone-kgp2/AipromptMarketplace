import React from "react";
import { Link } from "react-router";
import { CartIcon, HeartIcon } from "./Icon.jsx";
import Tag from "./Tag.jsx";
import { useShop } from "../context/ShopContext.jsx";

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
}) {
  const { addToCart, toggleWishlist, isInCart, isInWishlist, hasPurchased } = useShop();

  const inCart = isInCart(prompt.id);
  const inWishlist = isInWishlist(prompt.id);
  const isPurchased = hasPurchased ? hasPurchased(prompt.id) : false;
  const isMarketplace = variant === "grid" || showActions;

  const creatorLink = prompt.creatorId
    ? `/creator/${prompt.creatorId}`
    : null;
  const promptLink = `/prompt/${prompt.id}`;
  const actionLink = actionTo ?? promptLink;
  const priceLabel =
    Number(prompt.price) > 0 ? `${Number(prompt.price)} coins` : "Free";
  const ratingLabel =
    typeof prompt.rating === "number" && prompt.rating > 0
      ? prompt.rating.toFixed(1).replace(".0", "")
      : "New";

  const ctaLabel =
    Number(prompt.price) > 0 ? `${Number(prompt.price)} coins` : "Get for Free";
  const ctaGradient =
    Number(prompt.price) > 0
      ? "from-violet-500 to-fuchsia-500"
      : "from-rose-400 to-orange-300";

  /* ═══════════════════════════════════════════════════════
     Grid / Marketplace card — PromptBase-style hover
     ═══════════════════════════════════════════════════════ */
  if (variant === "grid" || isMarketplace) {
    return (
      <article className="prompt-card group relative overflow-hidden rounded-2xl border border-slate-700/50 bg-slate-900/80">
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
          <div className="absolute left-3 top-3 text-xs font-black text-white drop-shadow transition-opacity duration-200 group-hover:opacity-0 pointer-events-none">
            {prompt.model || "AI"}
          </div>

          <div className="absolute right-3 top-3 text-xs font-black text-white drop-shadow transition-opacity duration-200 group-hover:opacity-0 pointer-events-none">
            {ratingLabel} ★
          </div>

          <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-3 p-3 transition-opacity duration-200 group-hover:opacity-0 pointer-events-none">
            <h3 className="line-clamp-2 text-base font-black leading-tight text-white drop-shadow">
              {prompt.title}
            </h3>
            <span className="shrink-0 text-sm font-black text-white drop-shadow">
              {priceLabel}
            </span>
          </div>

          {/* ════════════════════════════════════════════════
              HOVER OVERLAY — action buttons (top-right)
              ════════════════════════════════════════════════ */}
          <div className="prompt-card__actions absolute right-3 top-3 flex items-center gap-2">
            {!hideCommerceActions && (
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
                className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-900/80 text-white shadow-lg ring-1 ring-white/10 backdrop-blur-sm transition-all duration-200 hover:scale-110 hover:bg-rose-500 hover:text-white hover:ring-rose-400/30"
              >
                <HeartIcon filled={inWishlist} className="h-4 w-4" />
              </button>
            )}

            <Link
              to={promptLink}
              aria-label="View details"
              title="View details"
              onClick={(e) => e.stopPropagation()}
              className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-900/80 text-white shadow-lg ring-1 ring-white/10 backdrop-blur-sm transition-all duration-200 hover:scale-110 hover:bg-violet-500 hover:ring-violet-400/30"
            >
              <ExternalLinkIcon />
            </Link>

            {!hideCommerceActions && (
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  addToCart(prompt);
                }}
                disabled={inCart || isPurchased}
                aria-label={isPurchased ? "Already purchased" : inCart ? "Already in cart" : "Add to cart"}
                title={isPurchased ? "Already purchased" : inCart ? "Already in cart" : "Add to cart"}
                className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-900/80 text-white shadow-lg ring-1 ring-white/10 backdrop-blur-sm transition-all duration-200 hover:scale-110 hover:bg-sky-500 hover:ring-sky-400/30 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <CartIcon />
              </button>
            )}
          </div>
          {/* ════════════════════════════════════════════════
              HOVER OVERLAY — bottom info + CTA
              ════════════════════════════════════════════════ */}
          <div className="prompt-card__info absolute inset-x-0 bottom-0 flex items-end justify-between gap-3 p-4">
            <div className="min-w-0 flex-1">
              <h3 className="line-clamp-1 text-sm font-bold leading-tight text-white drop-shadow-lg">
                {prompt.title}
              </h3>
              <p className="mt-0.5 text-xs font-medium text-slate-300/80">
                {prompt.model || "AI"}
              </p>
              <div className="mt-1 flex items-center gap-2 text-xs text-white/70">
                <span className="font-bold text-amber-300">
                  {ratingLabel} ★
                </span>
                <span className="text-white/30">·</span>
                <span className="font-semibold">{priceLabel}</span>
              </div>
            </div>

            {onActionClick ? (
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); onActionClick(prompt); }}
                className="shrink-0 rounded-xl bg-violet-600 px-3 py-2 text-[11px] font-black text-white shadow-lg transition hover:bg-violet-500"
              >
                {actionLabel}
              </button>
            ) : (
              <Link
                to={actionLink}
                onClick={(e) => e.stopPropagation()}
                className="shrink-0 rounded-xl bg-violet-600 px-3 py-2 text-[11px] font-black text-white shadow-lg transition hover:bg-violet-500"
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

      <div className="absolute left-3 top-3 text-xs font-black text-white drop-shadow">
        <span>{prompt.model || "AI"}</span>
      </div>

      <div className="absolute right-3 top-3 text-xs font-black text-white drop-shadow">
        {ratingLabel} *
      </div>

      <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-3 p-3">
        <h3 className="line-clamp-2 text-base font-black leading-tight text-white drop-shadow">
          {prompt.title}
        </h3>
        <span className="shrink-0 text-sm font-black text-white drop-shadow">
          {priceLabel}
        </span>
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
            className="h-8 w-8 shrink-0 rounded-full object-cover ring-2 ring-violet-500/30"
          />
          <span className="truncate text-xs font-bold text-violet-200">
            {prompt.creatorName ?? prompt.creator}
          </span>
        </Link>
      ) : (
        <>
          <img
            src={prompt.creatorAvatarUrl}
            alt={prompt.creatorName ?? prompt.creator}
            className="h-8 w-8 rounded-full object-cover ring-2 ring-violet-500/30"
          />
          <span className="text-xs font-bold text-slate-400">
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
        <h3 className="line-clamp-1 text-base font-bold text-white">
          {prompt.title}
        </h3>
        {typeof prompt.rating === "number" && prompt.rating > 0 && (
          <span className="badge-pill bg-yellow-500/15 text-yellow-300">
            ★ {ratingLabel}
          </span>
        )}
      </div>

      <p className="mt-3 line-clamp-3 text-sm leading-6 text-slate-400">
        {prompt.description || prompt.promptText}
      </p>

      {creatorRow}

      <div className="mt-4 flex flex-wrap gap-2">
        {prompt.model && <Tag label={prompt.model} />}
        {prompt.category && <Tag label={prompt.category} />}
      </div>

      <div className="mt-5 flex items-center justify-between gap-3">
        <p className="text-sm font-bold text-violet-300">
          {Number(prompt.price) || 0} coins
        </p>
        <Link
          to={actionLink}
          className="rounded-xl bg-violet-600 px-4 py-2 text-xs font-bold text-white transition hover:bg-violet-500"
        >
          {actionLabel}
        </Link>
      </div>
    </article>
  );
}
