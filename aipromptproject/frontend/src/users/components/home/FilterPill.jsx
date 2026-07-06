import React from "react";
import { getTagColor } from "../../utils/styles.js";

export default function FilterPill({ label, selected, onClick }) {
  const color = getTagColor(label);

  return (
    <button
      type="button"
      onClick={onClick}
      className="rounded-full px-4 py-2 text-sm font-bold transition hover:-translate-y-0.5"
      style={{
        background: selected ? color.bg : color.bg.replace("0.16", "0.08").replace("0.12", "0.08"),
        border: `1px solid ${selected ? color.border : color.border.replace("0.36", "0.20").replace("0.28", "0.18").replace("0.24", "0.18")}`,
        color: selected ? color.text : "#cbd5e1",
      }}
    >
      {label}
    </button>
  );
}
