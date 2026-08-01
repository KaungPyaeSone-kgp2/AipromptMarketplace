import React from "react";
import { getTagColor } from "../../utils/styles.js";

export default function FilterPill({ label, selected, onClick }) {
  const color = getTagColor(label);

  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full px-4 py-2 text-sm font-bold transition hover:-translate-y-0.5 border ${
        selected
          ? "shadow-sm border-violet-500/40"
          : "bg-slate-100 text-slate-700 border-slate-300 dark:bg-slate-800/80 dark:text-slate-300 dark:border-slate-700/60 hover:bg-slate-200 dark:hover:bg-slate-700"
      }`}
      style={
        selected
          ? {
              background: color.bg,
              borderColor: color.border,
            }
          : undefined
      }
    >
      <span
        style={selected ? { color: color.textLight || color.text } : undefined}
        className={selected ? "dark:hidden" : ""}
      >
        {label}
      </span>
      {selected && (
        <span
          style={{ color: color.text }}
          className="hidden dark:inline"
        >
          {label}
        </span>
      )}
    </button>
  );
}
