import { useEffect, useState } from "react";

const PRODUCT_THEME_KEY = "productPageTheme";

export function useProductDarkMode() {
  const [isDarkMode, setIsDarkMode] = useState(() => {
    if (typeof window === "undefined") {
      return false;
    }

    return localStorage.getItem(PRODUCT_THEME_KEY) === "dark";
  });

  useEffect(() => {
    localStorage.setItem(PRODUCT_THEME_KEY, isDarkMode ? "dark" : "light");
  }, [isDarkMode]);

  return {
    isDarkMode,
    toggleDarkMode: () => setIsDarkMode((current) => !current),
  };
}
