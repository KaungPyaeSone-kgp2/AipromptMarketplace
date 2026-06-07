import React, { useCallback, useEffect, useRef, useState } from "react";
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
  fetchCreatorRequestStatus,
  fetchUnreadNotificationCount,
  requestCreatorMode,
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
  const [creatorRequestStatus, setCreatorRequestStatus] = useState(null); // null | 'pending' | 'approved' | 'rejected'
  const [rejectedMessage, setRejectedMessage] = useState("");
  const [showCreatorConfirm, setShowCreatorConfirm] = useState(false);
  const [showCreatorSuccess, setShowCreatorSuccess] = useState(false);
  const [creatorSubscribeError, setCreatorSubscribeError] = useState("");
  const [creatorStep, setCreatorStep] = useState(1);
  const [withdrawPassword, setWithdrawPassword] = useState("");
  const [withdrawPasswordConfirm, setWithdrawPasswordConfirm] = useState("");
  const [showWithdrawPw, setShowWithdrawPw] = useState(false);
  const [showWithdrawPwConfirm, setShowWithdrawPwConfirm] = useState(false);
  const [showApprovedToast, setShowApprovedToast] = useState(false);
  const [showRejectedToast, setShowRejectedToast] = useState(false);
  const [toastCountdown, setToastCountdown] = useState(0);
  const prevRequestStatusRef = useRef(null);
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
      const [userData, notifications, buyerRatings, creatorRatings, requestStatus] =
        await Promise.all([
          fetchCurrentUser({ creatorMode: isCreatorMode }),
          fetchUnreadNotificationCount(),
          // fetchPurchasedPrompts(),
          fetchBuyerRatings(),
          fetchCreatorRatings(),
          fetchCreatorRequestStatus(),
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

      // Update creator request status
      if (requestStatus) {
        setCreatorRequestStatus(requestStatus.request_status);
        setRejectedMessage(requestStatus.rejected_message ?? "");
      } else {
        setCreatorRequestStatus(null);
        setRejectedMessage("");
      }
    }

    loadLayoutData();
    return () => {
      cancelled = true;
    };
  }, [isCreatorMode]);

  // Poll for creator request status changes every 15 seconds
  useEffect(() => {
    if (isCreatorMode || !creatorRequestStatus) return;
    // Only poll when there's an active pending request
    if (creatorRequestStatus !== "pending") return;

    const pollStatus = async () => {
      const status = await fetchCreatorRequestStatus();
      if (!status) return;

      if (status.request_status === "approved" && prevRequestStatusRef.current === "pending") {
        // Approved! Transition to creator mode
        setCreatorRequestStatus("approved");
        setShowApprovedToast(true);
        setToastCountdown(5);
        const creatorUser = await fetchCurrentUser({ creatorMode: true });
        setUser(creatorUser);
        setIsCreatorMode(true);
      } else if (status.request_status === "rejected" && prevRequestStatusRef.current === "pending") {
        // Rejected
        setCreatorRequestStatus("rejected");
        setRejectedMessage(status.rejected_message ?? "");
        setShowRejectedToast(true);
        setToastCountdown(8);
      }

      prevRequestStatusRef.current = status.request_status;
    };

    const interval = setInterval(pollStatus, 15000);
    return () => clearInterval(interval);
  }, [isCreatorMode, creatorRequestStatus]);

  // Sync the ref whenever creatorRequestStatus changes
  useEffect(() => {
    prevRequestStatusRef.current = creatorRequestStatus;
  }, [creatorRequestStatus]);

  // Countdown timer for toasts
  useEffect(() => {
    if (toastCountdown <= 0) {
      if (showApprovedToast) setShowApprovedToast(false);
      if (showRejectedToast) setShowRejectedToast(false);
      return;
    }
    const timer = setTimeout(() => setToastCountdown((c) => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [toastCountdown, showApprovedToast, showRejectedToast]);

  // Poll for new notifications every 30 seconds
  useEffect(() => {
    const interval = setInterval(refreshNotificationCount, 30000);
    
    // Also allow forcing a refresh immediately via custom event
    const forceUpdate = () => {
      refreshNotificationCount();
    };
    window.addEventListener("promptai:force-notification-update", forceUpdate);
    
    return () => {
      clearInterval(interval);
      window.removeEventListener("promptai:force-notification-update", forceUpdate);
    };
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
    if (creatorStep === 1) {
      setCreatorStep(2);
      setCreatorSubscribeError("");
      return;
    }

    if (withdrawPassword.length < 8) {
      setCreatorSubscribeError("Password must be at least 8 characters.");
      return;
    }

    if (!/[A-Z]/.test(withdrawPassword)) {
      setCreatorSubscribeError("Password must contain at least 1 uppercase letter.");
      return;
    }

    if (!/[0-9]/.test(withdrawPassword)) {
      setCreatorSubscribeError("Password must contain at least 1 number.");
      return;
    }

    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(withdrawPassword)) {
      setCreatorSubscribeError("Password must contain at least 1 special character.");
      return;
    }

    if (withdrawPassword !== withdrawPasswordConfirm) {
      setCreatorSubscribeError("Passwords do not match.");
      return;
    }

    try {
      await requestCreatorMode(withdrawPassword);
      setCreatorRequestStatus("pending");
      setShowCreatorConfirm(false);
      setShowCreatorSuccess(true);
      setCreatorSubscribeError("");
      setCreatorStep(1);
      setWithdrawPassword("");
      setWithdrawPasswordConfirm("");
      setTimeout(() => setShowCreatorSuccess(false), 3500);
    } catch (error) {
      setCreatorSubscribeError(error.message || "Creator request failed.");
    }
  };

  const handleDismissRejection = () => {
    setCreatorRequestStatus(null);
    setRejectedMessage("");
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
        creatorRequestStatus={creatorRequestStatus}
        rejectedMessage={rejectedMessage}
        onSwitchToCreator={() => {
          if (creatorRequestStatus === "rejected") {
            // Allow re-applying after rejection
            setCreatorRequestStatus(null);
            setRejectedMessage("");
          }
          setShowCreatorConfirm(true);
        }}
        onDismissRejection={handleDismissRejection}
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
            {/* Top bar: Back arrow (left) + Close icon (right) */}
            <div className="flex items-center justify-between mb-4">
              {creatorStep === 2 ? (
                <button
                  type="button"
                  onClick={() => {
                    setCreatorStep(1);
                    setCreatorSubscribeError("");
                  }}
                  className="p-1.5 rounded-lg hover:bg-slate-800 transition text-slate-400 hover:text-white"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12" /><polyline points="12 19 5 12 12 5" /></svg>
                </button>
              ) : (
                <div />
              )}
              <button
                type="button"
                onClick={() => {
                  setShowCreatorConfirm(false);
                  setCreatorStep(1);
                  setWithdrawPassword("");
                  setWithdrawPasswordConfirm("");
                  setCreatorSubscribeError("");
                }}
                className="p-1.5 rounded-lg hover:bg-slate-800 transition text-slate-400 hover:text-white"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
              </button>
            </div>

            {creatorStep === 1 ? (
              <>
                <h2 className="text-xl font-black text-white">Become a Creator</h2>
                <div className="mt-4 space-y-3 text-sm leading-6 text-slate-300">
                  <p>1. When you become a creator, you can create prompts and post prompts.</p>
                  <p>2. You can withdraw the coins you earn from posted prompts.</p>
                  <p>3. When you sell a prompt, the platform will take a 10% fee.</p>
                  <p className="text-amber-300/90">4. Your request will be reviewed by an admin before activation.</p>
                </div>
              </>
            ) : (
              <>
                <h2 className="text-xl font-black text-white">Set Withdraw Password</h2>
                <p className="mt-2 text-sm text-slate-400">This password will be required when you withdraw your earnings.</p>
                <div className="mt-4 space-y-3">
                  <div>
                    <label className="text-xs font-bold text-slate-400 mb-1 block">Password</label>
                    <div className="relative">
                      <input
                        type={showWithdrawPw ? "text" : "password"}
                        value={withdrawPassword}
                        onChange={(e) => setWithdrawPassword(e.target.value)}
                        placeholder="Enter withdraw password"
                        className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-2.5 pr-11 text-sm text-white outline-none transition focus:border-violet-500 focus:ring-4 focus:ring-violet-500/10"
                      />
                      <button
                        type="button"
                        onClick={() => setShowWithdrawPw((v) => !v)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition"
                      >
                        {showWithdrawPw ? (
                          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg>
                        ) : (
                          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" /><line x1="1" y1="1" x2="23" y2="23" /></svg>
                        )}
                      </button>
                    </div>
                    {withdrawPassword.length > 0 && (
                      <div className="mt-2 space-y-1">
                        {[
                          { label: "At least 8 characters", met: withdrawPassword.length >= 8 },
                          { label: "At least 1 uppercase letter", met: /[A-Z]/.test(withdrawPassword) },
                          { label: "At least 1 number", met: /[0-9]/.test(withdrawPassword) },
                          { label: "At least 1 special character", met: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(withdrawPassword) },
                        ].map((rule) => (
                          <div key={rule.label} className="flex items-center gap-2">
                            {rule.met ? (
                              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
                            ) : (
                              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /></svg>
                            )}
                            <span className={`text-xs ${rule.met ? 'text-emerald-400' : 'text-slate-500'}`}>{rule.label}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-400 mb-1 block">Confirm Password</label>
                    <div className="relative">
                      <input
                        type={showWithdrawPwConfirm ? "text" : "password"}
                        value={withdrawPasswordConfirm}
                        onChange={(e) => setWithdrawPasswordConfirm(e.target.value)}
                        placeholder="Re-enter withdraw password"
                        className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-2.5 pr-11 text-sm text-white outline-none transition focus:border-violet-500 focus:ring-4 focus:ring-violet-500/10"
                      />
                      <button
                        type="button"
                        onClick={() => setShowWithdrawPwConfirm((v) => !v)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition"
                      >
                        {showWithdrawPwConfirm ? (
                          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg>
                        ) : (
                          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" /><line x1="1" y1="1" x2="23" y2="23" /></svg>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </>
            )}
            {creatorSubscribeError && (
              <p className="mt-4 rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm font-bold text-rose-200">
                {creatorSubscribeError}
              </p>
            )}
            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => {
                  setShowCreatorConfirm(false);
                  setCreatorStep(1);
                  setWithdrawPassword("");
                  setWithdrawPasswordConfirm("");
                  setCreatorSubscribeError("");
                }}
                className="rounded-xl bg-slate-800 px-4 py-2 text-sm font-bold text-slate-300 transition hover:bg-slate-700"
              >
                Cancel
              </button>
              {/* {creatorStep === 2 && (
                <button
                  type="button"
                  onClick={() => {
                    setCreatorStep(1);
                    setCreatorSubscribeError("");
                  }}
                  className="rounded-xl bg-slate-800 px-4 py-2 text-sm font-bold text-slate-300 transition hover:bg-slate-700"
                >
                  Back
                </button> )}}*/}

              <button
                type="button"
                onClick={handleSubscribeCreator}
                className="rounded-xl bg-violet-600 px-4 py-2 text-sm font-bold text-white transition hover:bg-violet-500"
              >
                {creatorStep === 1 ? "Next" : "Submit Request"}
              </button>
            </div>
          </div>
        </div>
      )}

      {showCreatorSuccess && (
        <div className="fixed right-6 top-24 z-[9999] w-full max-w-xs rounded-2xl border border-amber-400/30 bg-slate-900 p-5 shadow-2xl animate-slide-in-right">
          <div className="flex items-start gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-amber-500/15 text-sm font-black text-amber-300">
              ⏳
            </div>
            <div>
              <p className="text-sm font-black text-white">
                Request Submitted
              </p>
              <p className="mt-1 text-xs leading-5 text-slate-400">
                Your creator request is pending approval. You'll be notified once it's reviewed.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Approved toast */}
      {showApprovedToast && (
        <div className="fixed right-6 top-24 z-[9999] w-full max-w-sm rounded-2xl border border-emerald-400/30 bg-slate-900 p-5 shadow-2xl animate-slide-in-right">
          <div className="flex items-start gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-emerald-500/15 text-sm font-black text-emerald-300">
              ✓
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <p className="text-sm font-black text-white">
                  You are now a Creator!
                </p>
                <span className="text-xs font-bold text-slate-500">{toastCountdown}s</span>
              </div>
              <p className="mt-1 text-xs leading-5 text-slate-400">
                Your creator request has been approved. Creator mode is now active — start creating prompts!
              </p>
              {/* Countdown progress bar */}
              <div className="mt-3 h-1 w-full overflow-hidden rounded-full bg-slate-800">
                <div
                  className="h-full rounded-full bg-emerald-500 transition-all duration-1000 ease-linear"
                  style={{ width: `${(toastCountdown / 5) * 100}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Rejected toast */}
      {showRejectedToast && (
        <div className="fixed right-6 top-24 z-[9999] w-full max-w-sm rounded-2xl border border-rose-400/30 bg-slate-900 p-5 shadow-2xl animate-slide-in-right">
          <div className="flex items-start gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-rose-500/15 text-sm font-black text-rose-300">
              ✗
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <p className="text-sm font-black text-white">
                  Request Rejected
                </p>
                <span className="text-xs font-bold text-slate-500">{toastCountdown}s</span>
              </div>
              <p className="mt-1 text-xs leading-5 text-slate-400">
                {rejectedMessage || "Your creator request was rejected by the admin."}
              </p>
              {/* Countdown progress bar */}
              <div className="mt-3 h-1 w-full overflow-hidden rounded-full bg-slate-800">
                <div
                  className="h-full rounded-full bg-rose-500 transition-all duration-1000 ease-linear"
                  style={{ width: `${(toastCountdown / 8) * 100}%` }}
                />
              </div>
              <button
                onClick={() => { setShowRejectedToast(false); setToastCountdown(0); }}
                className="mt-2 text-xs font-bold text-rose-400 hover:text-rose-300 transition"
              >
                Dismiss
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
