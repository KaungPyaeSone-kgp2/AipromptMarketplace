import React, { createContext, useContext, useEffect, useState } from "react";
import { getCurrentUserId } from "../services/currentUser.js";

const ThemeContext = createContext();

export const useTheme = () => useContext(ThemeContext);

export const ThemeProvider = ({ children }) => {
  const uid = getCurrentUserId() || "guest";
  const THEME_KEY = `promptai-theme-${uid}`;

  const [theme, setTheme] = useState(
    () => localStorage.getItem(THEME_KEY) || "system"
  );

  useEffect(() => {
    setTheme(localStorage.getItem(THEME_KEY) || "system");
  }, [THEME_KEY]);

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
