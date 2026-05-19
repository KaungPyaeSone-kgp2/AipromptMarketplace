import React from "react";
import { Link } from "react-router";
import { HeartIcon } from "./Icon.jsx";
import Tag from "./Tag.jsx";
import { useShop } from "../context/ShopContext.jsx";

export default function PromptCard({
  prompt,
  actionLabel = "View Prompt",
  variant = "detailed",
  showActions = false,
}) {
  const {
    addToCart,
    toggleWishlist,
    isInCart,
    isInWishlist,
  } = useShop();

  const inCart = isInCart(prompt.id);
  const inWishlist = isInWishlist(prompt.id);
  const isMarketplace = variant === "grid" || showActions;

  const creatorLink = prompt.creatorId
    ? `/creator/${prompt.creatorId}`
    : null;

  const imageBlock = (
    <div className="relative flex aspect-[4/3] items-center justify-center overflow-hidden bg-slate-950/60">
      {prompt.imageUrl ? (
        <img
          src={prompt.imageUrl}
          alt={prompt.title}
          className="h-full w-full object-cover"
          loading="lazy"
        />
      ) : (
        <span className="text-sm font-semibold text-slate-500">Prompt Image</span>
      )}
      {isMarketplace && (
        <button
          type="button"
          onClick={() => toggleWishlist(prompt)}
          aria-label={inWishlist ? "Remove from wishlist" : "Add to wishlist"}
          className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full border border-slate-600/50 bg-slate-900/80 text-rose-400 transition hover:scale-105 hover:bg-slate-800"
        >
          <HeartIcon filled={inWishlist} />
        </button>
      )}
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

  if (variant === "grid" || isMarketplace) {
    return (
      <article className="surface flex flex-col overflow-hidden transition hover:-translate-y-0.5 hover:border-violet-400/40">
        {imageBlock}
        <div className="flex flex-1 flex-col p-4">
          <h3 className="line-clamp-2 text-base font-bold text-white">
            {prompt.title}
          </h3>

          {prompt.description && (
            <p className="mt-2 line-clamp-3 flex-1 text-sm leading-6 text-slate-400">
              {prompt.description}
            </p>
          )}

          {creatorRow}

          <div className="mt-3 flex flex-wrap gap-2">
            {prompt.model && <Tag label={prompt.model} />}
            {prompt.category && <Tag label={prompt.category} />}
          </div>

          <div className="mt-4 flex items-center justify-between gap-3 border-t border-slate-700/40 pt-4">
            <p className="text-sm font-black text-violet-300">
              {Number(prompt.price) || 0} coins
            </p>
            <button
              type="button"
              disabled={inCart}
              onClick={() => addToCart(prompt)}
              className="rounded-xl bg-violet-600 px-4 py-2 text-xs font-bold text-white transition hover:bg-violet-500 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {inCart ? "In cart" : "Purchase"}
            </button>
          </div>
        </div>
      </article>
    );
  }

  return (
    <article className="surface overflow-hidden p-5 transition hover:-translate-y-0.5 hover:border-violet-400/40">
      <div className="mb-4 overflow-hidden rounded-2xl">{imageBlock}</div>

      <div className="flex items-start justify-between gap-3">
        <h3 className="line-clamp-1 text-base font-bold text-white">
          {prompt.title}
        </h3>
        {typeof prompt.rating === "number" && prompt.rating > 0 && (
          <span className="badge-pill bg-yellow-500/15 text-yellow-300">
            ★ {prompt.rating}
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
        <button
          type="button"
          className="rounded-xl bg-violet-600 px-4 py-2 text-xs font-bold text-white transition hover:bg-violet-500"
        >
          {actionLabel}
        </button>
      </div>
    </article>
  );
}
