import React, { createContext, useContext, useState, useEffect } from "react";

// ─── Theme Context (Dark / Light Mode) ───────────────────────────────────────
const ThemeContext = createContext({
  isDark: false,
  toggleTheme: () => {},
});

// ─── Currency Context ─────────────────────────────────────────────────────────
const CurrencyContext = createContext({
  currency: "USD",
  setCurrency: () => {},
  formatPrice: (price) => `$${price}`,
});

// Exchange rates relative to USD (approximate, fixed)
const EXCHANGE_RATES = {
  USD: { rate: 1,     symbol: "$",  label: "USD $" },
  EUR: { rate: 0.92,  symbol: "€",  label: "EUR €" },
  INR: { rate: 83.5,  symbol: "₹",  label: "INR ₹" },
  GBP: { rate: 0.79,  symbol: "£",  label: "GBP £" },
};

// ─── Combined Provider ────────────────────────────────────────────────────────
export const AppContextProvider = ({ children }) => {
  // Dark mode ──────────────────────────────────────────────────────────────────
  const [isDark, setIsDark] = useState(() => {
    try {
      return localStorage.getItem("tripnest_dark") === "true";
    } catch {
      return false;
    }
  });

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
    try {
      localStorage.setItem("tripnest_dark", String(isDark));
    } catch {}
  }, [isDark]);

  const toggleTheme = () => setIsDark((prev) => !prev);

  // Currency ───────────────────────────────────────────────────────────────────
  const [currency, setCurrencyState] = useState(() => {
    try {
      return localStorage.getItem("tripnest_currency") || "USD";
    } catch {
      return "USD";
    }
  });

  const setCurrency = (code) => {
    setCurrencyState(code);
    try {
      localStorage.setItem("tripnest_currency", code);
    } catch {}
  };

  const formatPrice = (price) => {
    if (price == null || isNaN(price)) return "N/A";
    const { rate, symbol } = EXCHANGE_RATES[currency] || EXCHANGE_RATES.USD;
    const converted = (Number(price) * rate).toFixed(0);
    return `${symbol}${Number(converted).toLocaleString()}`;
  };

  return (
    <ThemeContext.Provider value={{ isDark, toggleTheme }}>
      <CurrencyContext.Provider value={{ currency, setCurrency, formatPrice, EXCHANGE_RATES }}>
        {children}
      </CurrencyContext.Provider>
    </ThemeContext.Provider>
  );
};

// ─── Hooks ────────────────────────────────────────────────────────────────────
export const useTheme    = () => useContext(ThemeContext);
export const useCurrency = () => useContext(CurrencyContext);

export { ThemeContext, CurrencyContext, EXCHANGE_RATES };
