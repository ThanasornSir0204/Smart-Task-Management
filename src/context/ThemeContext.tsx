"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

type Theme = "dark";

interface ThemeContextValue {
  theme: Theme;
  toggleTheme: () => void;
  mounted: boolean;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

function applyThemeToDocument(): void {
  document.documentElement.classList.add("dark");
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    applyThemeToDocument();
    setMounted(true);
  }, []);

  const toggleTheme = useCallback(() => {
    /* Linear design is dark-only */
  }, []);

  const value = useMemo(
    () => ({ theme: "dark" as const, toggleTheme, mounted }),
    [toggleTheme, mounted],
  );

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
}

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error("useTheme must be used within ThemeProvider");
  }
  return ctx;
}
