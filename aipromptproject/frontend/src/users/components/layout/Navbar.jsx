import React, { useRef, useState } from "react";
import { Link } from "react-router";
import { useShop } from "../../context/ShopContext.jsx";
import {
  BellIcon,
  CartIcon,
  ExchangeIcon,
  HeartIcon,
  LogoIcon,
  MagicIcon,
  SearchIcon,
} from "../Icon.jsx";
import CartPanel from "../shop/CartPanel.jsx";
import WishlistPanel from "../shop/WishlistPanel.jsx";
import NavIconButton from "./NavIconButton.jsx";
import ProfileMenu from "./ProfileMenu.jsx";
import { useOutsideClick } from "../../hooks/useOutsideClick.js";

export default function Navbar({
  user,
  notificationCount = 0,
  onNotificationChange,
  searchQuery = "",
  onSearchChange,
  isCreatorMode = false,
  onSwitchToCreator,
  onSignOut,
}) {
  const {
    cartCount,
    markCartSeen,
    markWishlistSeen,
    wishlistUnseenCount,
  } = useShop();
  const [cartOpen, setCartOpen] = useState(false);
  const [wishlistOpen, setWishlistOpen] = useState(false);

  const openCart = () => {
    setWishlistOpen(false);
    setCartOpen(true);
    markCartSeen();
  };

  const openWishlist = () => {
    setCartOpen(false);
    setWishlistOpen(true);
    markWishlistSeen();
  };

  // For the notification dropdown
  const [notifications, setNotifications] = useState([]);
  const [showNotiDropdown, setShowNotiDropdown] = useState(false);
  const [dismissingIds, setDismissingIds] = useState(new Set());
  const notiRef = useRef(null);

  useOutsideClick(notiRef, () => {
    if (showNotiDropdown) setShowNotiDropdown(false);
  });

  const formatTimeAgo = (dateStr) => {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now - date;
    const diffMin = Math.floor(diffMs / 60000);
    const diffHr = Math.floor(diffMs / 3600000);
    const diffDay = Math.floor(diffMs / 86400000);

    if (diffMin < 1) return "Just now";
    if (diffMin < 60) return `${diffMin}m ago`;
    if (diffHr < 24) return `${diffHr}h ago`;
    if (diffDay < 7) return `${diffDay}d ago`;
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: date.getFullYear() !== now.getFullYear() ? "numeric" : undefined });
  };

  const loadNotifications = async () => {
    if (!user) return;
    if (showNotiDropdown) {
      setShowNotiDropdown(false);
      return;
    }
    try {
      const res = await fetch(`/api/users/notification/getNotifications.php?user_id=${user.id}`);
      const json = await res.json();
      if (json.success) setNotifications(json.data);
    } catch (error) {
      console.error("Failed to load notifications:", error);
    }
    setShowNotiDropdown(true);
  };

  const handleDismiss = (id) => {
    // Start exit animation
    setDismissingIds((prev) => new Set(prev).add(id));

    // Mark as read in backend
    if (user) {
      fetch("/api/users/notification/markRead.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id: Number(user.id), notification_id: id }),
      }).catch(() => {});
    }

    // Remove from list after animation completes (300ms)
    setTimeout(() => {
      setNotifications((prev) => prev.filter((n) => n.id !== id));
      setDismissingIds((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
      // Decrement badge count by 1
      onNotificationChange?.(-1);
    }, 300);
  };

  const handleClearAll = () => {
    // Trigger animation for all notifications at once
    const allIds = notifications.map(n => n.id);
    setDismissingIds(new Set(allIds));

    // Mark all as read in backend
    if (user) {
      fetch("/api/users/notification/markRead.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id: Number(user.id), mark_all: true }),
      }).catch(() => {});
    }

    // Clear them from state and reset badge after animation finishes
    setTimeout(() => {
      const cleared = notifications.length;
      setNotifications([]);
      setDismissingIds(new Set());
      // Decrement badge by the number of cleared notifications
      onNotificationChange?.(-cleared);
    }, 300);
  };

  return (
    <nav
      className="sticky top-0 z-40 flex h-16 items-center gap-3 border-b border-slate-700/30 px-4 backdrop-blur-xl"
      style={{ background: "rgba(8, 13, 28, 0.96)" }}
    >
      <Link to="/" className="flex shrink-0 items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-violet-600 text-white shadow-lg shadow-violet-600/25">
          <LogoIcon />
        </div>
        <span className="text-lg font-black tracking-tight text-white">
          Dream Key
        </span>
      </Link>

      <div className="relative ml-2 max-w-xl flex-1">
        <span className="pointer-events-none absolute inset-y-0 left-4 flex items-center text-slate-500">
          <SearchIcon />
        </span>
        <input
          type="search"
          value={searchQuery}
          onChange={(e) => onSearchChange?.(e.target.value)}
          placeholder="Search prompts, styles, models..."
          className="h-11 w-full rounded-2xl border border-slate-700/80 bg-slate-900/90 px-4 pl-10 text-sm text-slate-200 outline-none transition placeholder:text-slate-500 focus:border-violet-500 focus:ring-4 focus:ring-violet-500/10"
        />
      </div>

      <div className="ml-auto flex items-center gap-2 sm:gap-3">
        {!isCreatorMode && (
          <button
            type="button"
            onClick={onSwitchToCreator}
            className="inline-flex h-9 items-center gap-2 rounded-xl border border-violet-500/35 bg-violet-600 px-4 text-xs font-black text-white shadow-lg shadow-violet-600/20 transition hover:bg-violet-500"
          >
            <MagicIcon />
            <span className="hidden sm:inline">Creator Mode</span>
          </button>
        )}

        <div className="relative">
          <NavIconButton
            badge={wishlistUnseenCount}
            badgeVariant="violet"
            label="Wishlist"
            onClick={openWishlist}
          >
            <HeartIcon className="h-5 w-5" />
          </NavIconButton>
          <WishlistPanel open={wishlistOpen} onClose={() => setWishlistOpen(false)} />
        </div>

        <div className="relative">
          <NavIconButton
            badge={cartCount}
            badgeVariant="blue"
            label="Cart"
            onClick={openCart}
          >
            <CartIcon />
          </NavIconButton>
          <CartPanel open={cartOpen} onClose={() => setCartOpen(false)} />
        </div>

        <button
          type="button"
          className="hidden h-9 items-center gap-2 rounded-xl px-3 text-xs font-black text-slate-300 transition hover:bg-slate-800 hover:text-white sm:inline-flex"
        >
          <ExchangeIcon />
          Exchange
        </button>

        <div className="relative" ref={notiRef}>
          <NavIconButton badge={notificationCount} label="Notifications" onClick={loadNotifications}>
            <BellIcon />
          </NavIconButton>

          {showNotiDropdown && (
            <div className="absolute right-0 top-full mt-2 w-80 max-h-96 overflow-y-auto overflow-x-hidden rounded-xl bg-slate-900 border border-slate-700 p-3 shadow-2xl">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2 mb-2">
                <h3 className="text-sm font-black text-white">Notifications</h3>
                {notifications.length > 0 && (
                  <button
                    onClick={handleClearAll}
                    className="text-xs font-bold text-violet-400 hover:text-violet-300"
                  >
                    Clear All
                  </button>
                )}
              </div>
              {notifications.length === 0 ? (
                <p className="text-sm text-slate-500 py-4 text-center">No notifications.</p>
              ) : null}
              <div className="flex flex-col gap-1">
                {notifications.map(noti => (
                  <div
                    key={noti.id}
                    onDoubleClick={() => handleDismiss(noti.id)}
                    title="Double-click to dismiss"
                    className={`p-3 rounded-xl transition-all duration-300 transform select-none cursor-pointer ${dismissingIds.has(noti.id)
                      ? "opacity-0 translate-x-full scale-95 h-0 overflow-hidden py-0 my-0 border-none"
                      : "opacity-100 translate-x-0 hover:bg-slate-800"
                      }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-sm font-bold text-violet-300 truncate">{noti.title}</p>
                      <span className="shrink-0 text-[10px] font-medium text-slate-500">{formatTimeAgo(noti.created_at)}</span>
                    </div>
                    <p className="mt-1 text-xs text-slate-400 leading-relaxed pointer-events-none">{noti.message}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {user && <ProfileMenu user={user} onSignOut={onSignOut} onOpenWishlist={openWishlist} />}
      </div>
    </nav>
  );
}
