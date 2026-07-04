"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

type Theme = "light" | "dark";

interface ThemeContextType {
  theme: string;
  setTheme: (theme: string) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<string>("light");

  // Read from localStorage on mount (client-only)
  useEffect(() => {
    try {
      const savedTheme = localStorage.getItem("theme") as Theme;
      if (savedTheme && ["light", "dark"].includes(savedTheme)) {
        setThemeState(savedTheme);
        document.documentElement.className = savedTheme;
        document.documentElement.setAttribute("data-theme", savedTheme);
      } else {
        // Default to light
        document.documentElement.className = "light";
        document.documentElement.setAttribute("data-theme", "light");
      }
    } catch (e) {
      console.warn("Failed to access localStorage for theme settings:", e);
    }
  }, []);

  const setTheme = (newTheme: string) => {
    if (!["light", "dark"].includes(newTheme)) return;
    try {
      setThemeState(newTheme);
      localStorage.setItem("theme", newTheme);
      document.documentElement.className = newTheme;
      document.documentElement.setAttribute("data-theme", newTheme);
    } catch (e) {
      console.warn("Failed to save theme setting to localStorage:", e);
    }
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}
