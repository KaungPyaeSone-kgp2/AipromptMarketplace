import React, { useCallback, useEffect, useRef, useState } from "react";
import { Outlet, useLocation, useNavigate } from "react-router";
import Navbar from "../components/layout/Navbar.jsx";
import Sidebar from "../components/layout/Sidebar.jsx";
import { FOLLOW_COUNTS_UPDATED_EVENT } from "../services/followService.js";
import {
  fetchBuyerRatings,
  fetchCreatorRatings,
  PROMPTS_UPDATED_EVENT,
  clearPromptCache,
} from "../services/promptService.js";
import {
  fetchCurrentUser,
  fetchUnreadNotificationCount,
} from "../services/userService.js";
import { RATINGS_UPDATED_EVENT } from "../services/reviewService.js";
import { fetchReports } from "../services/reportService.js";
import { getCurrentUserId } from "../services/currentUser.js";
import { useSocket } from "../context/SocketContext.jsx";
import { ThemeProvider } from "../context/ThemeContext.jsx";

export default function UserLayout() {
  const location = useLocation();
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [notificationCount, setNotificationCount] = useState(0);
  const [reportCount, setReportCount] = useState(0);
  const [totalReportCount, setTotalReportCount] = useState(0);
  // const [librarySeen, setLibrarySeen] = useState(false);
  const [buyerRatingCount, setBuyerRatingCount] = useState(0);
  const [totalBuyerRatingCount, setTotalBuyerRatingCount] = useState(0);
  const [creatorRatingCount, setCreatorRatingCount] = useState(0);
  const [totalCreatorRatingCount, setTotalCreatorRatingCount] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  // Auto-clear report count when visiting the reports page
  useEffect(() => {
    if (location.pathname === "/user/reports") {
      const uid = getCurrentUserId();
      localStorage.setItem(`seenReportCount_${uid}`, totalReportCount.toString());
      setReportCount(0);
    }
  }, [location.pathname, totalReportCount]);

  // Auto-clear buyer rating count when visiting /user/rating
  useEffect(() => {
    if (location.pathname === "/user/rating") {
      const uid = getCurrentUserId();
      localStorage.setItem(`promptai_seen_buyer_rating_count_${uid}`, totalBuyerRatingCount.toString());
      setBuyerRatingCount(0);
    }
  }, [location.pathname, totalBuyerRatingCount]);

  // Auto-clear creator rating count when visiting /user/ratingreceive
  useEffect(() => {
    if (location.pathname === "/user/ratingreceive") {
      const uid = getCurrentUserId();
      localStorage.setItem(`promptai_seen_creator_rating_count_${uid}`, totalCreatorRatingCount.toString());
      setCreatorRatingCount(0);
    }
  }, [location.pathname, totalCreatorRatingCount]);

  const reloadCurrentUser = useCallback(async () => {
    const userData = await fetchCurrentUser();
    setUser(userData);
  }, []);

  const refreshNotificationCount = useCallback(async () => {
    try {
      const uid = getCurrentUserId();
      const count = await fetchUnreadNotificationCount();
      const userReports = await fetchReports(uid).catch(() => null);

      const totalReports = (userReports?.received?.length || 0) + (userReports?.submitted?.length || 0);
      let seenReportsStr = localStorage.getItem(`seenReportCount_${uid}`);
      if (seenReportsStr === null) {
        localStorage.setItem(`seenReportCount_${uid}`, totalReports.toString());
        seenReportsStr = totalReports;
      }
      const newReportCount = Math.max(0, totalReports - Number(seenReportsStr));

      const buyerRatings = await fetchBuyerRatings().catch(() => []);
      let creatorRatings = await fetchCreatorRatings().catch(() => []);
      // Filter out self-ratings so users don't get double-notified when rating their own prompts
      creatorRatings = creatorRatings.filter(r => String(r.user_id) !== String(uid));

      setTotalReportCount(totalReports);
      setReportCount(newReportCount);
      setNotificationCount(Number(count || 0));

      const totalBuyerRatings = buyerRatings.length;
      let seenBuyerRatingsStr = localStorage.getItem(`promptai_seen_buyer_rating_count_${uid}`);
      if (seenBuyerRatingsStr === null) {
        localStorage.setItem(`promptai_seen_buyer_rating_count_${uid}`, totalBuyerRatings.toString());
        seenBuyerRatingsStr = totalBuyerRatings;
      }
      setTotalBuyerRatingCount(totalBuyerRatings);
      setBuyerRatingCount(Math.max(0, totalBuyerRatings - Number(seenBuyerRatingsStr)));

      const totalCreatorRatings = creatorRatings.length;
      let seenCreatorRatingsStr = localStorage.getItem(`promptai_seen_creator_rating_count_${uid}`);
      if (seenCreatorRatingsStr === null) {
        localStorage.setItem(`promptai_seen_creator_rating_count_${uid}`, totalCreatorRatings.toString());
        seenCreatorRatingsStr = totalCreatorRatings;
      }
      setTotalCreatorRatingCount(totalCreatorRatings);
      setCreatorRatingCount(Math.max(0, totalCreatorRatings - Number(seenCreatorRatingsStr)));
    } catch {
      // silently ignore
    }
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function loadLayoutData() {
      const [userData, notifications, buyerRatings, creatorRatings, userReports] =
        await Promise.all([
          fetchCurrentUser(),
          fetchUnreadNotificationCount(),
          fetchBuyerRatings(),
          fetchCreatorRatings().then(ratings =>
            ratings.filter(r => String(r.user_id) !== String(getCurrentUserId()))
          ),
          fetchReports(getCurrentUserId()).catch(() => ({ submitted: [], received: [] })),
        ]);

      if (cancelled) return;

      const uid = getCurrentUserId();
      const totalReports = (userReports?.received?.length || 0) + (userReports?.submitted?.length || 0);
      let seenReportsStr = localStorage.getItem(`seenReportCount_${uid}`);
      if (seenReportsStr === null) {
        localStorage.setItem(`seenReportCount_${uid}`, totalReports.toString());
        seenReportsStr = totalReports;
      }
      const newReportCount = Math.max(0, totalReports - Number(seenReportsStr));

      setUser(userData);
      setNotificationCount(Number(notifications || 0));
      setTotalReportCount(totalReports);
      setReportCount(newReportCount);

      const totalBuyerRatings = buyerRatings.length;
      let seenBuyerRatingsStr = localStorage.getItem(`promptai_seen_buyer_rating_count_${uid}`);
      if (seenBuyerRatingsStr === null) {
        localStorage.setItem(`promptai_seen_buyer_rating_count_${uid}`, totalBuyerRatings.toString());
        seenBuyerRatingsStr = totalBuyerRatings;
      }
      const newBuyerRatingCount = Math.max(0, totalBuyerRatings - Number(seenBuyerRatingsStr));

      const totalCreatorRatings = creatorRatings.length;
      let seenCreatorRatingsStr = localStorage.getItem(`promptai_seen_creator_rating_count_${uid}`);
      if (seenCreatorRatingsStr === null) {
        localStorage.setItem(`promptai_seen_creator_rating_count_${uid}`, totalCreatorRatings.toString());
        seenCreatorRatingsStr = totalCreatorRatings;
      }
      const newCreatorRatingCount = Math.max(0, totalCreatorRatings - Number(seenCreatorRatingsStr));

      setTotalBuyerRatingCount(totalBuyerRatings);
      setBuyerRatingCount(newBuyerRatingCount);
      setTotalCreatorRatingCount(totalCreatorRatings);
      setCreatorRatingCount(newCreatorRatingCount);
    }

    loadLayoutData();
    return () => {
      cancelled = true;
    };
  }, []);



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

  const socket = useSocket();

  useEffect(() => {
    if (!socket || !user?.id) return;

    const roomName = "user_" + user.id;
    socket.emit("join_room", roomName);

    const handleReportNotification = (data) => {
      console.log("Received websocket report notification", data);
      refreshNotificationCount();
    };

    const handleFollowUpdated = (data) => {
      console.log("Received websocket follow updated", data);
      if (typeof data.followers_count === "number") {
        setUser((currentUser) => currentUser ? {
          ...currentUser,
          followersCount: data.followers_count
        } : currentUser);
        
        window.dispatchEvent(new CustomEvent(FOLLOW_COUNTS_UPDATED_EVENT, {
          detail: { followersCount: data.followers_count }
        }));
      }
    };

    const handlePromptUpdated = () => {
      clearPromptCache();
    };

    socket.on("report_notification", handleReportNotification);
    socket.on("follow_updated", handleFollowUpdated);
    socket.on("prompt_inserted", handlePromptUpdated);
    socket.on("prompt_updated", handlePromptUpdated);

    return () => {
      socket.emit("leave_room", roomName);
      socket.off("report_notification", handleReportNotification);
      socket.off("follow_updated", handleFollowUpdated);
      socket.off("prompt_inserted", handlePromptUpdated);
      socket.off("prompt_updated", handlePromptUpdated);
    };
  }, [socket, user?.id, refreshNotificationCount]);

  useEffect(() => {
    const handleFollowCountsUpdated = (event) => {
      const followingCount = event.detail?.followingCount;
      const followersCount = event.detail?.followersCount;

      setUser((currentUser) => {
        if (!currentUser) return currentUser;
        
        const updates = {};
        if (typeof followingCount === "number") updates.followingCount = followingCount;
        if (typeof followersCount === "number") updates.followersCount = followersCount;
        
        if (Object.keys(updates).length > 0) {
          return { ...currentUser, ...updates };
        }
        return currentUser;
      });
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
    window.addEventListener(PROMPTS_UPDATED_EVENT, reloadCurrentUser);

    return () => {
      window.removeEventListener("promptai:user-profile-updated", reloadCurrentUser);
      window.removeEventListener(PROMPTS_UPDATED_EVENT, reloadCurrentUser);
    };
  }, [reloadCurrentUser]);



  useEffect(() => {
    const handleRatingsUpdated = (event) => {
      const buyerDelta = Number(event.detail?.buyerDelta ?? 0);
      const creatorDelta = Number(event.detail?.creatorDelta ?? 0);

      if (buyerDelta) {
        setTotalBuyerRatingCount((prev) => Math.max(0, prev + buyerDelta));
        setBuyerRatingCount((prev) => Math.max(0, prev + buyerDelta));
      }

      if (creatorDelta) {
        setTotalCreatorRatingCount((prev) => Math.max(0, prev + creatorDelta));
        setCreatorRatingCount((prev) => Math.max(0, prev + creatorDelta));
      }
    };

    window.addEventListener(RATINGS_UPDATED_EVENT, handleRatingsUpdated);

    return () => {
      window.removeEventListener(RATINGS_UPDATED_EVENT, handleRatingsUpdated);
    };
  }, []);



  const handleSignOut = () => {
    sessionStorage.removeItem("promptai_user_id");
    window.location.href = "/";
  };

  const handleSearchChange = (value) => {
    setSearchQuery(value);
    if (value.trim() && location.pathname !== "/user") {
      navigate("/user");
    }
  };

  return (
    <ThemeProvider>
      <div className="app-shell min-h-screen bg-white dark:bg-[#09090b] text-slate-900 dark:text-slate-100 transition-colors duration-200">
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
          onSignOut={handleSignOut}
        />

        <div className="flex items-start">
          <Sidebar
            buyerRatingCount={buyerRatingCount}
            creatorRatingCount={creatorRatingCount}
            reportCount={reportCount}
          />

          <main className="app-scrollbar min-w-0 flex-1 overflow-y-auto p-6">
            <Outlet context={{ searchQuery, reloadCurrentUser }} />
          </main>
        </div>


      </div>
    </ThemeProvider>
  );
}
