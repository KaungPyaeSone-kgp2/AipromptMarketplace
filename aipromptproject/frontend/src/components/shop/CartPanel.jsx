import React, { useRef } from "react";
import { useShop } from "../../context/ShopContext.jsx";
import { useOutsideClick } from "../../hooks/useOutsideClick.js";

export default function CartPanel({ open, onClose }) {
  const ref = useRef(null);
  const { cart, cartTotal, removeFromCart, clearCart, purchaseCart } = useShop();

  useOutsideClick(ref, () => {
    if (open) onClose?.();
  });

  if (!open) return null;

  const handleBuyAll = () => {
    if (cart.length === 0) return;
    purchaseCart();
    alert("Purchase successful! Prompts added to your library.");
    onClose?.();
  };

  return (
    <div
      ref={ref}
      className="absolute right-0 top-full z-50 mt-2 w-[min(380px,calc(100vw-2rem))] overflow-hidden rounded-2xl border border-slate-700 bg-slate-900 shadow-2xl"
    >
      <div className="border-b border-slate-700 px-4 py-3">
        <h3 className="text-sm font-black text-white">Cart</h3>
        <p className="text-xs text-slate-400">{cart.length} item(s)</p>
      </div>

      <div className="max-h-80 overflow-y-auto">
        {cart.length === 0 ? (
          <p className="px-4 py-8 text-center text-sm text-slate-500">
            Your cart is empty.
          </p>
        ) : (
          cart.map(({ prompt }) => (
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
                <button
                  type="button"
                  onClick={() => removeFromCart(prompt.id)}
                  className="mt-1 text-xs font-semibold text-rose-400 hover:text-rose-300"
                >
                  Remove
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {cart.length > 0 && (
        <div className="border-t border-slate-700 p-4">
          <div className="mb-3 flex justify-between text-sm">
            <span className="text-slate-400">Total</span>
            <span className="font-black text-violet-300">{cartTotal} coins</span>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={clearCart}
              className="rounded-xl border border-rose-400/30 bg-rose-500/10 py-2.5 text-sm font-bold text-rose-300 transition hover:bg-rose-500/20"
            >
              Remove all
            </button>
            <button
              type="button"
              onClick={handleBuyAll}
              className="rounded-xl bg-violet-600 py-2.5 text-sm font-bold text-white transition hover:bg-violet-500"
            >
              Buy all
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
