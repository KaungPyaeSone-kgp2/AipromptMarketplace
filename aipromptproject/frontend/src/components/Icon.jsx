import React from "react";

export function Icon({ children, className = "h-5 w-5", fill = "none" }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill={fill}
      stroke={fill === "none" ? "currentColor" : "none"}
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      {children}
    </svg>
  );
}

export function HomeIcon() {
  return (
    <Icon>
      <path d="M3 9.5 12 3l9 6.5V20a1 1 0 0 1-1 1h-5v-8H9v8H4a1 1 0 0 1-1-1Z" />
    </Icon>
  );
}

export function PurchasedIcon() {
  return (
    <Icon>
      <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" />
      <path d="M3 6h18" />
      <path d="M16 10a4 4 0 0 1-8 0" />
    </Icon>
  );
}

export function StarIcon() {
  return (
    <Icon fill="currentColor">
      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
    </Icon>
  );
}

export function CreatorIcon() {
  return (
    <Icon>
      <path d="M12 20h9" />
      <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z" />
    </Icon>
  );
}

export function SearchIcon() {
  return (
    <Icon className="h-4 w-4">
      <circle cx="11" cy="11" r="8" />
      <path d="m21 21-4.35-4.35" />
    </Icon>
  );
}

export function CartIcon() {
  return (
    <Icon fill="currentColor">
      <path d="M2.25 3a.75.75 0 0 0 0 1.5h1.386c.17 0 .318.114.362.279l1.528 5.728.86 3.224A2.25 2.25 0 0 0 8.563 15.5h8.62a2.25 2.25 0 0 0 2.174-1.665l1.43-5.148A.75.75 0 0 0 20.064 7H5.82l-.376-1.409A1.875 1.875 0 0 0 3.636 4.5H2.25Z" />
      <path d="M8.25 18.75a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3ZM17.25 18.75a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3Z" />
    </Icon>
  );
}

export function BellIcon() {
  return (
    <Icon fill="currentColor">
      <path d="M12 2.25a4.5 4.5 0 0 0-4.5 4.5v1.122c0 .61-.181 1.207-.52 1.714L5.73 11.46A5.25 5.25 0 0 0 4.5 14.373V16.5c0 .414.336.75.75.75h13.5a.75.75 0 0 0 .75-.75v-2.127a5.25 5.25 0 0 0-1.23-2.913l-1.25-1.874a3.09 3.09 0 0 1-.52-1.714V6.75A4.5 4.5 0 0 0 12 2.25Z" />
      <path d="M9.75 18.75a2.25 2.25 0 1 0 4.5 0h-4.5Z" />
    </Icon>
  );
}

export function FilterIcon() {
  return (
    <Icon className="h-4 w-4">
      <path d="M4 6h16" />
      <path d="M7 12h10" />
      <path d="M10 18h4" />
    </Icon>
  );
}

export function ChevronIcon({ open = false }) {
  return (
    <svg
      viewBox="0 0 20 20"
      fill="currentColor"
      className={`h-4 w-4 transition-transform ${open ? "rotate-180" : ""}`}
    >
      <path
        fillRule="evenodd"
        d="M5.23 7.21a.75.75 0 0 1 1.06.02L10 11.168l3.71-3.938a.75.75 0 1 1 1.08 1.04l-4.25 4.51a.75.75 0 0 1-1.08 0l-4.25-4.51a.75.75 0 0 1 .02-1.06Z"
        clipRule="evenodd"
      />
    </svg>
  );
}

export function LockIcon() {
  return (
    <svg viewBox="0 0 16 16" fill="currentColor" className="h-3.5 w-3.5">
      <path d="M4.5 7V4.5a3.5 3.5 0 1 1 7 0V7A1.5 1.5 0 0 1 13 8.5v4A1.5 1.5 0 0 1 11.5 14h-7A1.5 1.5 0 0 1 3 12.5v-4A1.5 1.5 0 0 1 4.5 7Zm5.5 0V4.5a2 2 0 1 0-4 0V7h4Z" />
    </svg>
  );
}

export function LibraryIcon() {
  return (
    <Icon>
      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
      <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2Z" />
    </Icon>
  );
}

export function CommunityIcon() {
  return (
    <Icon>
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
    </Icon>
  );
}

export function ExchangeIcon() {
  return (
    <Icon className="h-5 w-5">
      <path d="M7 16V4M7 4 3 8m4-4 4 4" />
      <path d="M17 8v12m0 0 4-4m-4 4-4-4" />
    </Icon>
  );
}

export function MagicIcon() {
  return (
    <Icon fill="currentColor" className="h-4 w-4">
      <path d="M11.645 20.91a.75.75 0 0 1-1.29 0l-1.12-1.945a3.75 3.75 0 0 0-1.37-1.37l-1.945-1.12a.75.75 0 0 1 0-1.29l1.945-1.12a3.75 3.75 0 0 0 1.37-1.37l1.12-1.945a.75.75 0 0 1 1.29 0l1.12 1.945a3.75 3.75 0 0 0 1.37 1.37l1.945 1.12a.75.75 0 0 1 0 1.29l-1.945 1.12a3.75 3.75 0 0 0-1.37 1.37l-1.12 1.945ZM17.4 9.2a.55.55 0 0 1-.95 0l-.42-.72a1.7 1.7 0 0 0-.62-.62l-.72-.42a.55.55 0 0 1 0-.95l.72-.42c.26-.15.47-.36.62-.62l.42-.72a.55.55 0 0 1 .95 0l.42.72c.15.26.36.47.62.62l.72.42a.55.55 0 0 1 0 .95l-.72.42c-.26.15-.47.36-.62.62l-.42.72Z" />
    </Icon>
  );
}

export function LogoIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
      <path d="M6 4h12a2 2 0 0 1 2 2v14l-8-4-8 4V6a2 2 0 0 1 2-2Z" />
    </svg>
  );
}
