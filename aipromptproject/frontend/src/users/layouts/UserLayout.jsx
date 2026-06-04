import React, { useCallback, useEffect, useState } from "react";
import { Outlet, useLocation, useNavigate } from "react-router";
import Navbar from "../components/layout/Navbar.jsx";
import Sidebar from "../components/layout/Sidebar.jsx";
import { FOLLOW_COUNTS_UPDATED_EVENT } from "../services/followService.js";
import {
  fetchBuyerRatings,
  fetchCreatorRatings,
  fetchPurchasedPrompts,
} from "../services/promptService.js";
import {
  fetchCurrentUser,
  fetchUnreadNotificationCount,
  subscribeCreatorMode,
} from "../services/userService.js";
import { RATINGS_UPDATED_EVENT } from "../services/reviewService.js";

export default function UserLayout() {
  const location = useLocation();
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [notificationCount, setNotificationCount] = useState(0);
  const [libraryCount, setLibraryCount] = useState(0);
  // const [librarySeen, setLibrarySeen] = useState(false);
  const [buyerRatingCount, setBuyerRatingCount] = useState(0);
  const [creatorRatingCount, setCreatorRatingCount] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [isCreatorMode, setIsCreatorMode] = useState(false);
  const [showCreatorConfirm, setShowCreatorConfirm] = useState(false);
  const [showCreatorSuccess, setShowCreatorSuccess] = useState(false);
  const [creatorSubscribeError, setCreatorSubscribeError] = useState("");
  const reloadCurrentUser = useCallback(async () => {
    const userData = await fetchCurrentUser({ creatorMode: isCreatorMode });
    setUser(userData);
  }, [isCreatorMode]);

  const refreshNotificationCount = useCallback(async () => {
    try {
      const count = await fetchUnreadNotificationCount();
      setNotificationCount(count);
    } catch {
      // silently ignore
    }
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function loadLayoutData() {
      const [userData, notifications, buyerRatings, creatorRatings] =
        await Promise.all([
          fetchCurrentUser({ creatorMode: isCreatorMode }),
          fetchUnreadNotificationCount(),
          // fetchPurchasedPrompts(),
          fetchBuyerRatings(),
          fetchCreatorRatings(),
        ]);

      if (cancelled) return;

      setUser(userData);
      setNotificationCount(notifications);
      // setLibraryCount(purchased.length);
      setBuyerRatingCount(buyerRatings.length);
      setCreatorRatingCount(creatorRatings.length);
      if ((userData.isCreator ?? false) !== isCreatorMode) {
        setIsCreatorMode(userData.isCreator ?? false);
      }
    }

    loadLayoutData();
    return () => {
      cancelled = true;
    };
  }, [isCreatorMode]);

  // Poll for new notifications every 30 seconds
  useEffect(() => {
    const interval = setInterval(refreshNotificationCount, 30000);
    return () => clearInterval(interval);
  }, [refreshNotificationCount]);

  useEffect(() => {
    const handleFollowCountsUpdated = (event) => {
      const followingCount = event.detail?.followingCount;

      if (typeof followingCount !== "number") return;

      setUser((currentUser) =>
        currentUser
          ? {
            ...currentUser,
            followingCount,
          }
          : currentUser
      );
    };

    window.addEventListener(
      FOLLOW_COUNTS_UPDATED_EVENT,
      handleFollowCountsUpdated
    );

    return () => {
      window.removeEventListener(
        FOLLOW_COUNTS_UPDATED_EVENT,
        handleFollowCountsUpdated
      );
    };
  }, []);

  useEffect(() => {
    window.addEventListener("promptai:user-profile-updated", reloadCurrentUser);

    return () => {
      window.removeEventListener("promptai:user-profile-updated", reloadCurrentUser);
    };
  }, [reloadCurrentUser]);

  useEffect(() => {
    if (location.pathname.startsWith("/purchased")) {
      setLibraryCount(0);
    }
  }, [location.pathname]);

  useEffect(() => {
    const handleNewpurchase = async () => {
      setLibraryCount((prev) => prev + 1);
      
      // Refresh user balance to instantly update the profile menu drop down
      await reloadCurrentUser();
      
      // Fetch updated unread notification count from API
      await refreshNotificationCount();
    };
    
    window.addEventListener("promptai:purchase-success", handleNewpurchase);
    return () => {
      window.removeEventListener("promptai:purchase-success", handleNewpurchase);
    };
  }, [reloadCurrentUser]);

  useEffect(() => {
    const handleRatingsUpdated = (event) => {
      const buyerDelta = Number(event.detail?.buyerDelta ?? 0);
      const creatorDelta = Number(event.detail?.creatorDelta ?? 0);

      if (buyerDelta) {
        setBuyerRatingCount((prev) => Math.max(0, prev + buyerDelta));
      }

      if (creatorDelta) {
        setCreatorRatingCount((prev) => Math.max(0, prev + creatorDelta));
      }
    };

    window.addEventListener(RATINGS_UPDATED_EVENT, handleRatingsUpdated);

    return () => {
      window.removeEventListener(RATINGS_UPDATED_EVENT, handleRatingsUpdated);
    };
  }, []);

  const handleSubscribeCreator = async () => {
    setShowCreatorConfirm(false);

    try {
      await subscribeCreatorMode();
      const creatorUser = await fetchCurrentUser({ creatorMode: true });
      setUser(creatorUser);
      setIsCreatorMode(true);
      setShowCreatorSuccess(true);
      setCreatorSubscribeError("");
      setTimeout(() => setShowCreatorSuccess(false), 2500);
    } catch (error) {
      setCreatorSubscribeError(error.message || "Creator mode update failed.");
      setShowCreatorConfirm(true);
    }
  };

  const handleSignOut = () => {
    setIsCreatorMode(false);
    navigate("/");
  };

  const handleSearchChange = (value) => {
    setSearchQuery(value);
    if (value.trim() && location.pathname !== "/") {
      navigate("/");
    }
  };

  return (
    <div className="app-shell min-h-screen text-slate-100">
      <Navbar
        user={user}
        notificationCount={notificationCount}
        onNotificationChange={(delta) => {
          if (typeof delta === "number") {
            setNotificationCount((prev) => Math.max(0, prev + delta));
          } else {
            refreshNotificationCount();
          }
        }}
        searchQuery={searchQuery}
        onSearchChange={handleSearchChange}
        isCreatorMode={isCreatorMode}
        onSwitchToCreator={() => setShowCreatorConfirm(true)}
        onSignOut={handleSignOut}
      />

      <div className="flex items-start">
        <Sidebar
          libraryCount={libraryCount}
          isCreatorMode={isCreatorMode}
          buyerRatingCount={buyerRatingCount}
          creatorRatingCount={creatorRatingCount}
        />

        <main className="app-scrollbar min-w-0 flex-1 overflow-y-auto p-6">
          <Outlet context={{ isCreatorMode, searchQuery, reloadCurrentUser }} />
        </main>
      </div>

      {showCreatorConfirm && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-md rounded-2xl border border-slate-700 bg-slate-900 p-6 shadow-2xl">
            <h2 className="text-xl font-black text-white">Become a Creator</h2>
            <div className="mt-4 space-y-3 text-sm leading-6 text-slate-300">
              <p>1. When you become a creator, you can create prompts and post prompts.</p>
              <p>2. You can withdraw the coins you earn from posted prompts.</p>
              <p>3. When you sell a prompt, the platform will take a 10% fee.</p>
            </div>
            {creatorSubscribeError && (
              <p className="mt-4 rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm font-bold text-rose-200">
                {creatorSubscribeError}
              </p>
            )}
            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowCreatorConfirm(false)}
                className="rounded-xl bg-slate-800 px-4 py-2 text-sm font-bold text-slate-300 transition hover:bg-slate-700"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSubscribeCreator}
                className="rounded-xl bg-violet-600 px-4 py-2 text-sm font-bold text-white transition hover:bg-violet-500"
              >
                Subscribe
              </button>
            </div>
          </div>
        </div>
      )}

      {showCreatorSuccess && (
        <div className="fixed right-6 top-24 z-[9999] w-full max-w-xs rounded-2xl border border-emerald-400/30 bg-slate-900 p-5 shadow-2xl">
          <div className="flex items-start gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-emerald-500/15 text-sm font-black text-emerald-300">
              ✓
            </div>
            <div>
              <p className="text-sm font-black text-white">
                You become the creator.
              </p>
              <p className="mt-1 text-xs leading-5 text-slate-400">
                Creator mode is active now.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
