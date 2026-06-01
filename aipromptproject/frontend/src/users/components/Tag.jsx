import React from "react";
import { getTagColor } from "../utils/styles";

export default function Tag({ label, className = "" }) {
  const color = getTagColor(label);

  return (
    <span
      className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${className}`}
      style={{
        background: color.bg,
        border: `1px solid ${color.border}`,
        color: color.text,
      }}
    >
      {label}
    </span>
  );
}
