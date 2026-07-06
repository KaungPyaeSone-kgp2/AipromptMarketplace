import React, { useRef, useState } from "react";
import { Link, useNavigate } from "react-router";
import dreamKeyLogo from "../../../assets/dream-key-logo.jpg";
import { useShop } from "../../context/ShopContext.jsx";

import {
  BellIcon,
  ExchangeIcon,
  HeartIcon,
  LogoIcon,
  MagicIcon,
  SearchIcon,
} from "../Icon.jsx";

import NavIconButton from "./NavIconButton.jsx";
import ProfileMenu from "./ProfileMenu.jsx";
import { useOutsideClick } from "../../hooks/useOutsideClick.js";

export default function Navbar({
  user,
  notificationCount = 0,
  onNotificationChange,
  searchQuery = "",
  onSearchChange,
  onSignOut,
}) {
  const navigate = useNavigate();
  const { wishlist, wishlistUnseenCount, markWishlistSeen } = useShop();

  // For the notification dropdown
  const [notifications, setNotifications] = useState([]);
  const [showNotiDropdown, setShowNotiDropdown] = useState(false);
  const [dismissingIds, setDismissingIds] = useState(new Set());
  const notiRef = useRef(null);

  // For the wishlist dropdown
  const [showWishlistDropdown, setShowWishlistDropdown] = useState(false);
  const wishlistRef = useRef(null);

  useOutsideClick(notiRef, () => {
    if (showNotiDropdown) setShowNotiDropdown(false);
  });

  useOutsideClick(wishlistRef, () => {
    if (showWishlistDropdown) setShowWishlistDropdown(false);
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
      const res = await fetch(`/api/notification/getNotifications.php?user_id=${user.id}`);
      const json = await res.json();
      if (json.success) setNotifications(json.data);

      // Mark all as read automatically
      fetch("/api/notification/markRead.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id: Number(user.id), mark_all: true }),
      }).catch(() => { });

      // Instantly clear the notification badge count to 0
      onNotificationChange?.(-notificationCount);
    } catch (error) {
      console.error("Failed to load notifications:", error);
    }
    setShowNotiDropdown(true);
  };

  const handleDismiss = (id) => {
    // Start exit animation
    setDismissingIds((prev) => new Set(prev).add(id));

    // Delete from database permanently
    if (user) {
      fetch("/api/notification/deleteNotifications.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id: Number(user.id), notification_id: id }),
      }).catch(() => { });
    }

    // Remove from list after animation completes (300ms)
    setTimeout(() => {
      setNotifications((prev) => prev.filter((n) => n.id !== id));
      setDismissingIds((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    }, 300);
  };

  const handleClearAll = () => {
    // Trigger animation for all notifications at once
    const allIds = notifications.map(n => n.id);
    setDismissingIds(new Set(allIds));

    // Permanently delete all notifications from the database
    if (user) {
      fetch("/api/notification/deleteNotifications.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id: Number(user.id), delete_all: true }),
      }).catch(() => { });
    }

    // Clear them from state and reset badge after animation finishes
    setTimeout(() => {
      setNotifications([]);
      setDismissingIds(new Set());
      // Reset notification badge to 0
      onNotificationChange?.(-notificationCount);
    }, 300);
  };

  return (
    <nav
      className="sticky top-0 z-40 flex h-16 items-center gap-3 border-b border-slate-700/30 px-4 backdrop-blur-xl"
      style={{ background: "rgba(8, 13, 28, 0.96)" }}
    >
      <Link to="/user" className="flex shrink-0 items-center gap-3">
        <img src={dreamKeyLogo} alt="DreamKey Logo" className="w-9 h-9 rounded-lg object-cover shadow-lg" />
        <span className="text-lg font-black tracking-tight text-white">
          Dream Key
        </span>
      </Link>

      <div className="ml-auto flex items-center gap-2 sm:gap-3">

        <div className="relative" ref={wishlistRef}>
          <NavIconButton
            label="Wishlist"
            badge={wishlistUnseenCount}
            onClick={() => {
              if (!showWishlistDropdown) markWishlistSeen();
              setShowWishlistDropdown(!showWishlistDropdown);
            }}
          >
            <HeartIcon />
          </NavIconButton>

          {showWishlistDropdown && (
            <div className="absolute right-0 top-full mt-2 w-[300px] max-h-96 overflow-y-auto overflow-x-hidden rounded-xl bg-slate-900 border border-slate-700 p-3 shadow-2xl">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2 mb-2">
                <h3 className="text-sm font-black text-white">Wishlist</h3>
              </div>
              {(!wishlist || wishlist.length === 0) ? (
                <p className="text-sm text-slate-500 py-4 text-center">Your wishlist is empty.</p>
              ) : (
                <div className="flex flex-col gap-1">
                  {wishlist.map(item => (
                    <Link
                      key={item.id}
                      to={`/user/prompt/${item.id}`}
                      onClick={() => setShowWishlistDropdown(false)}
                      className="flex items-center gap-3 p-2 rounded-xl transition-all duration-300 hover:bg-slate-800"
                    >
                      <div className="h-10 w-10 shrink-0 overflow-hidden rounded-lg bg-slate-800">
                        {item.imageUrl ? (
                          <img src={item.imageUrl} alt={item.title} className="h-full w-full object-cover" />
                        ) : (
                          <div className="h-full w-full bg-violet-900/30"></div>
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-bold text-white truncate">{item.title}</p>
                        <p className="text-xs text-slate-400 truncate">{item.model}</p>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        <div className="relative" ref={notiRef}>
          <NavIconButton badge={notificationCount} label="Notifications" onClick={loadNotifications}>
            <BellIcon />
          </NavIconButton>

          {showNotiDropdown && (
            <div className="absolute right-0 top-full mt-2 w-[350px] max-h-96 overflow-y-auto overflow-x-hidden rounded-xl bg-slate-900 border border-slate-700 p-3 shadow-2xl">
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
                      <div className="flex items-center gap-2 min-w-0">
                        <p className="text-sm font-bold text-violet-300 truncate">{noti.title}</p>
                      </div>
                      <span className="shrink-0 text-[10px] font-medium text-slate-500">{formatTimeAgo(noti.created_at)}</span>
                    </div>
                    <p className="mt-1 text-xs text-slate-400 leading-relaxed pointer-events-none">{noti.message}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {user ? (
          <ProfileMenu user={user} onSignOut={onSignOut} />
        ) : (
          <div className="flex items-center gap-3">
            <Link to="/login" className="text-sm font-bold text-slate-300 hover:text-white transition">Login</Link>
            <Link to="/register" className="rounded-xl bg-violet-600 px-4 py-2 text-sm font-bold text-white transition hover:bg-violet-500">Sign Up</Link>
          </div>
        )}
      </div>
    </nav>
  );
}
