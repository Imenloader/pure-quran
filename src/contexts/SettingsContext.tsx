import { createContext, useContext, useState, useEffect, ReactNode } from "react";

export type FontSize = "small" | "medium" | "large" | "xlarge";
export type LineSpacing = "normal" | "relaxed" | "loose";
export type Theme = "light" | "dark" | "system";

interface SettingsState {
  fontSize: FontSize;
  lineSpacing: LineSpacing;
  theme: Theme;
  defaultTafsirIds: number[];
}

interface SettingsContextType extends SettingsState {
  setFontSize: (size: FontSize) => void;
  setLineSpacing: (spacing: LineSpacing) => void;
  setTheme: (theme: Theme) => void;
  setDefaultTafsirIds: (ids: number[]) => void;
}

const defaultSettings: SettingsState = {
  fontSize: "medium",
  lineSpacing: "relaxed",
  theme: "light",
  defaultTafsirIds: [169, 170],
};

const SettingsContext = createContext<SettingsContextType | null>(null);

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<SettingsState>(() => {
    try {
      const stored = localStorage.getItem("quran-settings");
      return stored ? { ...defaultSettings, ...JSON.parse(stored) } : defaultSettings;
    } catch {
      return defaultSettings;
    }
  });

  // Apply theme
  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove("light", "dark");

    if (settings.theme === "system") {
      const systemDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      root.classList.add(systemDark ? "dark" : "light");
    } else {
      root.classList.add(settings.theme);
    }
  }, [settings.theme]);

  // Persist settings
  useEffect(() => {
    localStorage.setItem("quran-settings", JSON.stringify(settings));
  }, [settings]);

  // Apply font size
  useEffect(() => {
    const root = document.documentElement;
    const sizes = {
      small: "1.5rem",
      medium: "1.875rem",
      large: "2.25rem",
      xlarge: "2.75rem",
    };
    root.style.setProperty("--quran-font-size", sizes[settings.fontSize]);
  }, [settings.fontSize]);

  // Apply line spacing
  useEffect(() => {
    const root = document.documentElement;
    const spacings = {
      normal: "2.4",
      relaxed: "2.8",
      loose: "3.2",
    };
    root.style.setProperty("--quran-line-height", spacings[settings.lineSpacing]);
  }, [settings.lineSpacing]);

  const value: SettingsContextType = {
    ...settings,
    setFontSize: (fontSize) => setSettings((s) => ({ ...s, fontSize })),
    setLineSpacing: (lineSpacing) => setSettings((s) => ({ ...s, lineSpacing })),
    setTheme: (theme) => setSettings((s) => ({ ...s, theme })),
    setDefaultTafsirIds: (defaultTafsirIds) => setSettings((s) => ({ ...s, defaultTafsirIds })),
  };

  return (
    <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>
  );
}

export function useSettings() {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error("useSettings must be used within SettingsProvider");
  }
  return context;
}
