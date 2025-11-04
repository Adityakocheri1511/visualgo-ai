import React, { createContext, useContext, useState } from "react";

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState({
    background: "#f9fafb",
    text: "#111827",
    card: "#ffffff",
    cardBorder: "1px solid #e5e7eb",
    accent: "#4f46e5",
    subtext: "#6b7280",
  });

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);