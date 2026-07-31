import { useEffect } from "react";
import { useLocation } from "react-router";

export default function ScrollToTop() {
  const { pathname, search, hash } = useLocation();

  useEffect(() => {
    // Disable browser default scroll restoration so refreshing the page always starts at the top
    if ("scrollRestoration" in window.history) {
      window.history.scrollRestoration = "manual";
    }

    const handleBeforeUnload = () => {
      if ("scrollRestoration" in window.history) {
        window.history.scrollRestoration = "manual";
      }
      try {
        window.scrollTo(0, 0);
      } catch {
        // Fallback for older browsers
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, []);

  useEffect(() => {
    if (hash) {
      const id = hash.replace("#", "");
      const element = document.getElementById(id);
      if (element) {
        setTimeout(() => {
          element.scrollIntoView({ behavior: "smooth", block: "start" });
        }, 100);
        return;
      }
    }

    // Instantly scroll window to top
    try {
      window.scrollTo({ top: 0, left: 0, behavior: "instant" });
    } catch {
      window.scrollTo(0, 0);
    }

    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;

    // Reset scroll for main user dashboard container if present
    const scrollContainer = document.querySelector(".app-scrollbar");
    if (scrollContainer) {
      scrollContainer.scrollTop = 0;
    }
  }, [pathname, search, hash]);

  return null;
}
