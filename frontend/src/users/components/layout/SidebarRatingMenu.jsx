import React, { useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router";
import { LockIcon, StarIcon } from "../Icon.jsx";
import { useOutsideClick } from "../../hooks/useOutsideClick.js";

function MenuRow({ label, count, disabled = false, onClick }) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className="flex w-full items-center justify-between rounded-xl px-3 py-2 text-left text-sm font-semibold text-slate-700 dark:text-slate-300 transition hover:bg-slate-800 hover:text-white disabled:cursor-not-allowed disabled:text-slate-600 disabled:hover:bg-transparent"
    >
      <span>{label}</span>
      <span className="flex items-center gap-2">
        {count > 0 && (
          <span className="rounded-full bg-violet-600 px-2 py-0.5 text-[10px] font-bold text-slate-900 dark:text-white">
            {count}
          </span>
        )}
        {disabled && <LockIcon />}
      </span>
    </button>
  );
}

export default function SidebarRatingMenu({
  buyerRatingCount = 0,
  creatorRatingCount = 0,
}) {
  const [open, setOpen] = useState(false);
  const [hovered, setHovered] = useState(false);
  const ref = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();

  useOutsideClick(ref, () => setOpen(false));

  const isActive =
    location.pathname === "/user/rating" ||
    location.pathname === "/user/ratingreceive";

  const totalBadge = buyerRatingCount + creatorRatingCount;

  return (
    <div
      ref={ref}
      className="relative flex w-full justify-center"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className={[
          "relative flex h-11 w-11 items-center justify-center rounded-2xl transition-all duration-150",
          open || isActive
            ? "bg-violet-500/20 text-violet-700 dark:text-violet-300 ring-1 ring-violet-500/60 dark:ring-violet-500/35"
            : "text-slate-600 dark:text-slate-400 hover:bg-white/10 hover:text-white",
        ].join(" ")}
        aria-label="Rating"
      >
        <StarIcon />
        {totalBadge > 0 && (
          <span className="absolute -right-1 -top-1 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-violet-600 px-0.5 text-[10px] font-bold text-slate-900 dark:text-white">
            {totalBadge}
          </span>
        )}
      </button>

      {open && (
        <div
          className="absolute left-full top-0 z-[9999] ml-3 w-[280px] rounded-2xl border border-slate-400 dark:border-slate-700 bg-slate-100 dark:bg-slate-900 p-2 shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          <MenuRow
            label="Rating"
            count={buyerRatingCount}
            onClick={() => {
              navigate("/user/rating");
              setOpen(false);
            }}
          />
          <MenuRow
            label="Ratings Received"
            count={creatorRatingCount}
            onClick={() => {
              navigate("/user/ratingreceive");
              setOpen(false);
            }}
          />
        </div>
      )}

      {hovered && !open && (
        <div className="pointer-events-none absolute left-full top-1/2 z-[9999] ml-2 -translate-y-1/2 whitespace-nowrap rounded-xl bg-slate-200 dark:bg-slate-800 px-3 py-1.5 text-xs font-bold text-slate-900 dark:text-white shadow-xl">
          Rating
        </div>
      )}
    </div>
  );
}


