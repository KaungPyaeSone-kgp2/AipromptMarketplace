import React, { useEffect, useState } from "react";
import { Outlet, useNavigate } from "react-router";
import Navbar from "../components/layout/Navbar.jsx";
import Sidebar from "../components/layout/Sidebar.jsx";
import {
  fetchBuyerRatings,
  fetchCreatorRatings,
  fetchPurchasedPrompts,
} from "../services/promptService.js";
import {
  fetchCurrentUser,
  fetchUnreadNotificationCount,
} from "../services/userService.js";

export default function UserLayout() {
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [notificationCount, setNotificationCount] = useState(0);
  const [libraryCount, setLibraryCount] = useState(0);
  const [buyerRatingCount, setBuyerRatingCount] = useState(0);
  const [creatorRatingCount, setCreatorRatingCount] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [isCreatorMode, setIsCreatorMode] = useState(false);
  const [showCreatorConfirm, setShowCreatorConfirm] = useState(false);
  const [showCreatorSuccess, setShowCreatorSuccess] = useState(false);

  useEffect(() => {
    async function loadLayoutData() {
      const [userData, notifications, purchased, buyerRatings, creatorRatings] =
        await Promise.all([
          fetchCurrentUser(),
          fetchUnreadNotificationCount(),
          fetchPurchasedPrompts(),
          fetchBuyerRatings(),
          fetchCreatorRatings(),
        ]);

      setUser(userData);
      setNotificationCount(notifications);
      setLibraryCount(purchased.length);
      setBuyerRatingCount(buyerRatings.length);
      setCreatorRatingCount(creatorRatings.length);
      setIsCreatorMode(userData.isCreator ?? false);
    }

    loadLayoutData();
  }, []);

  const handleSubscribeCreator = () => {
    setShowCreatorConfirm(false);
    setIsCreatorMode(true);
    setShowCreatorSuccess(true);
    if (user) setUser({ ...user, isCreator: true });
    navigate("/creator");
  };

  const handleSignOut = () => {
    setIsCreatorMode(false);
    navigate("/");
  };

  return (
    <div className="app-shell min-h-screen text-slate-100">
      <Navbar
        user={user}
        notificationCount={notificationCount}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        isCreatorMode={isCreatorMode}
        onSwitchToCreator={() => setShowCreatorConfirm(true)}
        onSignOut={handleSignOut}
      />

      <div className="flex">
        <Sidebar
          libraryCount={libraryCount}
          isCreatorMode={isCreatorMode}
          buyerRatingCount={buyerRatingCount}
          creatorRatingCount={creatorRatingCount}
        />

        <main className="app-scrollbar flex-1 overflow-y-auto p-6">
          <Outlet context={{ isCreatorMode, searchQuery }} />
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
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-sm rounded-2xl border border-slate-700 bg-slate-900 p-6 text-center shadow-2xl">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500/15 text-xl font-black text-emerald-300">
              ✓
            </div>
            <h2 className="mt-4 text-xl font-black text-white">
              You successfully became a creator.
            </h2>
            <button
              type="button"
              onClick={() => setShowCreatorSuccess(false)}
              className="mt-6 rounded-xl bg-violet-600 px-4 py-2 text-sm font-bold text-white transition hover:bg-violet-500"
            >
              OK
            </button>
          </div>
        </div>
      )}
    </div>
  );
}


