import React from "react";
import { Link } from "react-router";

export default function RatingPromptGroups({ ratings, mode, onClear }) {
  if (!ratings || ratings.length === 0) return null;

  return (
    <div className="space-y-6">
      {ratings.map((item) => (
        <div 
          key={item.id} 
          className="surface overflow-hidden p-5 transition hover:-translate-y-0.5 hover:border-violet-400/40 rounded-2xl border border-slate-400/50 dark:border-slate-700/50 bg-slate-100/80 dark:bg-slate-900/80"
        >
          <div className="flex items-start justify-between gap-3">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              <Link to={`/user/prompt/${item.promptId}`} className="hover:text-violet-400 transition-colors">
                {item.promptTitle || "Prompt"}
              </Link>
            </h3>
            <div className="flex items-center gap-2">
              <span className="badge-pill bg-amber-500/15 text-amber-600 dark:text-amber-400 px-3 py-1 rounded-full text-xs font-bold">
                ★ {item.rating}
              </span>
              {onClear && (
                <button onClick={() => onClear(item.id)} className="text-slate-400 hover:text-rose-500 transition-colors" title="Clear">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
                </button>
              )}
            </div>
          </div>

          <div className="mt-4 p-4 rounded-xl bg-slate-200/50 dark:bg-slate-800/50 border border-slate-400/50 dark:border-slate-700/50">
            <div className="flex items-center gap-3 mb-3">
              <img 
                src={mode === "buyer" ? (item.creatorAvatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(item.creatorName || "Creator")}&background=8b5cf6&color=fff`) : item.buyerAvatarUrl} 
                alt="Avatar" 
                className="h-8 w-8 rounded-full object-cover ring-2 ring-violet-500/50 dark:ring-violet-500/30"
              />
              <div>
                <p className="text-sm font-bold text-violet-800 dark:text-violet-200">
                  {mode === "buyer" ? "Review for " + (item.creatorName || "Creator") : "Review by " + (item.buyerName || "Buyer")}
                </p>
                <p className="text-xs text-slate-600 dark:text-slate-400">{item.date}</p>
              </div>
            </div>
            <p className="text-sm text-slate-700 dark:text-slate-300">{item.review}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
