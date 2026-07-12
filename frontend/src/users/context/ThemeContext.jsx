import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { getCurrentUserId } from "../services/currentUser.js";
import { API_BASE } from "../../../config.js";

const ThemeContext = createContext();

export const useTheme = () => useContext(ThemeContext);

export const ThemeProvider = ({ children, serverTheme }) => {
  const uid = getCurrentUserId() || "guest";
  const THEME_KEY = `promptai-theme-${uid}`;

  const [activeKey, setActiveKey] = useState(THEME_KEY);
  const [theme, setThemeState] = useState(
    () => localStorage.getItem(THEME_KEY) || "light"
  );

  // If the user changes, update the theme state immediately before rendering
  if (THEME_KEY !== activeKey) {
    setActiveKey(THEME_KEY);
    setThemeState(localStorage.getItem(THEME_KEY) || "light");
  }

  // Sync with server if the server tells us a different theme on mount
  useEffect(() => {
    if (serverTheme && serverTheme !== theme) {
      setThemeState(serverTheme);
    }
  }, [serverTheme]);

  // Handle setting theme in UI and syncing to backend
  const setTheme = useCallback(async (newTheme) => {
    setThemeState(newTheme);
    
    // Only sync to db if logged in
    if (uid !== "guest") {
      try {
        await fetch(`${API_BASE}/users/update_theme.php`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({ theme: newTheme }),
        });
      } catch (e) {
        console.error("Failed to sync theme to server:", e);
      }
    }
  }, [uid]);

  useEffect(() => {
    localStorage.setItem(THEME_KEY, theme);
    
    const root = window.document.documentElement;
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    
    const applyTheme = () => {
      root.classList.remove("light", "dark");
      if (theme === "system") {
        const systemTheme = mediaQuery.matches ? "dark" : "light";
        root.classList.add(systemTheme);
      } else {
        root.classList.add(theme);
      }
    };

    applyTheme();

    if (theme === "system") {
      mediaQuery.addEventListener("change", applyTheme);
      return () => mediaQuery.removeEventListener("change", applyTheme);
    }
  }, [theme, THEME_KEY]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};
