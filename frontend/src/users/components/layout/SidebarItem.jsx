import React, { useState } from "react";
import { NavLink } from "react-router";

export default function SidebarItem({
  to,
  icon,
  label,
  badgeCount = 0,
  badgeVariant = "violet",
  end = false,
}) {
  const [hovered, setHovered] = useState(false);
  const badgeColorMap = {
    blue: "bg-sky-500",
    rose: "bg-rose-500",
    violet: "bg-violet-600",
  };
  const badgeColor = badgeColorMap[badgeVariant] || "bg-violet-600";

  return (
    <div
      className="relative flex w-full justify-center"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <NavLink
        to={to}
        end={end}
        className={({ isActive }) =>
          [
            "relative flex h-11 w-11 items-center justify-center rounded-2xl transition-all duration-150",
            isActive
              ? "bg-violet-500/20 text-violet-700 dark:text-violet-300 ring-1 ring-violet-500/60 dark:ring-violet-500/35"
              : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-white",
          ].join(" ")
        }
      >
        {icon}
        {badgeCount > 0 && (
          <span
            className={`absolute -right-1 -top-1 flex h-4 min-w-[16px] items-center justify-center rounded-full px-0.5 text-[10px] font-bold text-slate-900 dark:text-white ${badgeColor}`}
          >
            {badgeCount}
          </span>
        )}
      </NavLink>

      {hovered && (
        <div className="pointer-events-none absolute left-full top-1/2 z-[9999] ml-2 -translate-y-1/2 whitespace-nowrap rounded-xl bg-slate-200 dark:bg-slate-800 px-3 py-1.5 text-xs font-bold text-slate-900 dark:text-white shadow-xl">
          {label}
        </div>
      )}
    </div>
  );
}

