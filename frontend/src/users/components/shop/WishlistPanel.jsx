import React, { useRef } from "react";
import { Link } from "react-router";
import { useShop } from "../../context/ShopContext.jsx";
import { useOutsideClick } from "../../hooks/useOutsideClick.js";

export default function WishlistPanel({ open, onClose }) {
  const ref = useRef(null);
  const { wishlist, removeFromWishlist, addToCart, isInCart } = useShop();

  useOutsideClick(ref, () => {
    if (open) onClose?.();
  });

  if (!open) return null;

  return (
    <div
      ref={ref}
      className="absolute right-0 top-full z-50 mt-2 w-[min(300px,calc(100vw-2rem))] overflow-hidden rounded-2xl border border-slate-700 bg-slate-900 shadow-2xl"
    >
      <div className="border-b border-slate-700 px-4 py-3">
        <h3 className="text-sm font-black text-white">Wishlist</h3>
        <p className="text-xs text-slate-400">{wishlist.length} saved</p>
      </div>

      <div className="max-h-80 overflow-y-auto">
        {wishlist.length === 0 ? (
          <p className="px-4 py-8 text-center text-sm text-slate-500">
            No prompts in your wishlist yet.
          </p>
        ) : (
          wishlist.map((prompt) => (
            <div
              key={prompt.id}
              className="flex gap-3 border-b border-slate-800 px-4 py-3 last:border-0"
            >
              <div className="h-14 w-14 shrink-0 overflow-hidden rounded-lg bg-slate-800">
                {prompt.imageUrl ? (
                  <img
                    src={prompt.imageUrl}
                    alt=""
                    className="h-full w-full object-cover"
                  />
                ) : null}
              </div>
              <div className="min-w-0 flex-1">
                <p className="line-clamp-1 text-sm font-bold text-white">
                  {prompt.title}
                </p>
                <p className="text-xs text-violet-300">
                  {Number(prompt.price) || 0} coins
                </p>
                <div className="mt-2 flex flex-wrap gap-2">
                  <button
                    type="button"
                    disabled={isInCart(prompt.id)}
                    onClick={() => addToCart(prompt)}
                    className="text-xs font-semibold text-violet-300 hover:text-violet-200 disabled:opacity-50"
                  >
                    {isInCart(prompt.id) ? "In cart" : "Add to cart"}
                  </button>
                  <button
                    type="button"
                    onClick={() => removeFromWishlist(prompt.id)}
                    className="text-xs font-semibold text-rose-400 hover:text-rose-300"
                  >
                    Remove
                  </button>
                  {prompt.creatorId && (
                    <Link
                      to={`/creator/${prompt.creatorId}`}
                      onClick={() => onClose?.()}
                      className="text-xs font-semibold text-slate-400 hover:text-white"
                    >
                      Creator
                    </Link>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
