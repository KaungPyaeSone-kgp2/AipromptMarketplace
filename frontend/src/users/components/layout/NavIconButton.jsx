import React from "react";

function Badge({ count, variant = "violet" }) {
  if (!count) return null;

  const colors =
    variant === "blue"
      ? "bg-sky-500"
      : "bg-violet-600";

  return (
    <span
      className={`absolute -right-1 -top-1 flex h-4 min-w-[16px] items-center justify-center rounded-full px-0.5 text-[10px] font-bold text-slate-900 dark:text-white ${colors}`}
    >
      {count > 99 ? "99+" : count}
    </span>
  );
}

export default function NavIconButton({
  children,
  badge,
  badgeVariant = "violet",
  onClick,
  label,
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className="relative flex h-9 w-9 items-center justify-center rounded-xl text-slate-600 dark:text-slate-400 transition hover:bg-slate-100 dark:hover:bg-slate-800/80 hover:text-slate-900 dark:hover:text-white"
    >
      {children}
      <Badge count={badge} variant={badgeVariant} />
    </button>
  );
}
