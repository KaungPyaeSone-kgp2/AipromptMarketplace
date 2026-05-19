import React from "react";
import { getTagColor } from "../../utils/styles.js";

export default function FilterPill({ label, selected, onClick }) {
  const color = getTagColor(label);

  return (
    <button
      type="button"
      onClick={onClick}
      className="rounded-full px-4 py-2 text-sm font-bold transition"
      style={{
        background: selected ? color.bg : "rgba(15, 23, 42, 0.62)",
        border: `1px solid ${selected ? color.border : "rgba(148, 163, 184, 0.16)"}`,
        color: selected ? color.text : "#94a3b8",
      }}
    >
      {label}
    </button>
  );
}
