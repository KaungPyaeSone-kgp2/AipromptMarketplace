import React, { useRef, useState } from "react";
import { ChevronIcon } from "../Icon.jsx";
import { useOutsideClick } from "../../hooks/useOutsideClick.js";

export default function ProfileMenu({ user, onSignOut, onOpenWishlist }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const points = Number(user.points ?? 0);

  useOutsideClick(ref, () => setOpen(false));

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="flex items-center gap-2 rounded-2xl border border-transparent p-1 pr-2 transition hover:border-slate-700/80 hover:bg-slate-800/60"
      >
        <img
          src={user.avatarUrl}
          alt={user.displayName}
          className="h-9 w-9 rounded-full object-cover ring-2 ring-violet-500/35"
        />
        <span className="hidden text-sm font-bold text-white sm:block">
          {user.displayName}
        </span>
        <span className="hidden sm:block">
          <ChevronIcon open={open} />
        </span>
      </button>

      {open && (
        <div className="absolute right-0 top-full z-50 mt-2 w-64 overflow-hidden rounded-2xl border border-slate-700/80 bg-slate-900 shadow-2xl">
          <div className="flex items-center gap-3 border-b border-slate-700/80 px-4 py-3">
            <img
              src={user.avatarUrl}
              alt={user.displayName}
              className="h-10 w-10 rounded-full object-cover ring-2 ring-violet-500/35"
            />
            <div>
              <p className="truncate text-sm font-bold text-white">
                {user.fullName ?? user.displayName}
              </p>
              <p className="truncate text-xs text-slate-400">{user.email}</p>
              <p className="mt-1 text-xs font-bold text-emerald-300">
                {points.toLocaleString()} pts
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 border-b border-slate-700/80 px-4 py-3">
            {user.isCreator ? (
              <>
                <div>
                  <p className="text-[11px] font-bold uppercase text-slate-500">
                    Followers
                  </p>
                  <p className="text-sm font-black text-white">
                    {(user.followersCount ?? 0).toLocaleString()}
                  </p>
                </div>
                <div>
                  <p className="text-[11px] font-bold uppercase text-slate-500">
                    Posts
                  </p>
                  <p className="text-sm font-black text-white">
                    {(user.postedPromptCount ?? 0).toLocaleString()}
                  </p>
                </div>
                <div>
                  <p className="text-[11px] font-bold uppercase text-slate-500">
                    Sales
                  </p>
                  <p className="text-sm font-black text-white">
                    {(user.totalSalesCount ?? 0).toLocaleString()}
                  </p>
                </div>
                <div>
                  <p className="text-[11px] font-bold uppercase text-slate-500">
                    Earned
                  </p>
                  <p className="text-sm font-black text-white">
                    {(user.totalEarningCoins ?? 0).toLocaleString()}
                  </p>
                </div>
              </>
            ) : (
              <>
                <div>
                  <p className="text-[11px] font-bold uppercase text-slate-500">
                    Following
                  </p>
                  <p className="text-sm font-black text-white">
                    {(user.followingCount ?? 0).toLocaleString()}
                  </p>
                </div>
                <div>
                  <p className="text-[11px] font-bold uppercase text-slate-500">
                    Purchased
                  </p>
                  <p className="text-sm font-black text-white">
                    {(user.purchasedPromptsCount ?? 0).toLocaleString()}
                  </p>
                </div>
              </>
            )}
          </div>

          <button
            type="button"
            className="w-full px-4 py-2.5 text-left text-sm text-slate-300 transition hover:bg-slate-800"
          >
            Settings
          </button>
          <button
            type="button"
            onClick={() => {
              setOpen(false);
              onOpenWishlist?.();
            }}
            className="w-full px-4 py-2.5 text-left text-sm text-slate-300 transition hover:bg-slate-800"
          >
            Exchange History
          </button>
          <button
            type="button"
            onClick={() => {
              setOpen(false);
              onSignOut?.();
            }}
            className="w-full border-t border-slate-700/80 px-4 py-2.5 text-left text-sm text-rose-300 transition hover:bg-rose-500/10"
          >
            Sign out
          </button>
        </div>
      )}
    </div>
  );
}

