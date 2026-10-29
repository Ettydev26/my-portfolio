import { useCallback, useEffect, useState } from "react";

const STORAGE_KEY = "theme";
const THEME_COLORS = { dark: "#0b1220", light: "#ffffff" };
const media = () => window.matchMedia("(prefers-color-scheme: light)");

function readStored() {
  try {
    const v = localStorage.getItem(STORAGE_KEY);
    return v === "light" || v === "dark" ? v : null;
  } catch {
    return null;
  }
}

// White + cyan is the default; dark is opt-in via the toggle.
function systemTheme() {
  return "light";
}

// Mirrors the inline script in index.html, which applies the theme before first paint.
export function applyTheme(theme) {
  const root = document.documentElement;
  root.classList.toggle("light", theme === "light");
  root.classList.toggle("dark", theme === "dark");
  root.style.colorScheme = theme;
  document
    .querySelector('meta[name="theme-color"]')
    ?.setAttribute("content", THEME_COLORS[theme]);
}

export function useTheme() {
  const [theme, setTheme] = useState(() => readStored() ?? systemTheme());

  useEffect(() => {
    applyTheme(theme);
  }, [theme]);

  // Track OS changes until the visitor picks a theme explicitly.
  useEffect(() => {
    const mq = media();
    const onChange = () => {
      if (!readStored()) setTheme(systemTheme());
    };
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  const toggleTheme = useCallback(() => {
    setTheme((cur) => {
      const next = cur === "dark" ? "light" : "dark";
      try {
        localStorage.setItem(STORAGE_KEY, next);
      } catch {
        // storage unavailable (private mode); choice lasts for this page only
      }
      return next;
    });
  }, []);

  return { theme, toggleTheme };
}
