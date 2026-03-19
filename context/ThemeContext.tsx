import React, { createContext, useContext, useState } from "react";

type Theme = "light" | "dark";

type ThemeContextType = {
  theme: Theme;
  toggleTheme: () => void;
  colors: typeof lightColors;
};

export const lightColors = {
  background: "#f8f8f8",
  card: "#ffffff",
  text: "#1a1a1a",
  subtext: "#888888",
  border: "#f0f0f0",
  input: "#f8f8f8",
  inputBorder: "#eeeeee",
  header: "#ffffff",
  tabBar: "#ffffff",
  primary: "#3498db",
  danger: "#FF3B30",
  orange: "#FF9500",
};

export const darkColors = {
  background: "#121212",
  card: "#1e1e1e",
  text: "#ffffff",
  subtext: "#aaaaaa",
  border: "#2c2c2c",
  input: "#2c2c2c",
  inputBorder: "#3a3a3a",
  header: "#1e1e1e",
  tabBar: "#1e1e1e",
  primary: "#3498db",
  danger: "#FF3B30",
  orange: "#FF9500",
};

const ThemeContext = createContext<ThemeContextType>({
  theme: "light",
  toggleTheme: () => {},
  colors: lightColors,
});

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const [theme, setTheme] = useState<Theme>("light");

  const toggleTheme = () => {
    setTheme((prev) => (prev === "light" ? "dark" : "light"));
  };

  const colors = theme === "light" ? lightColors : darkColors;

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, colors }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
