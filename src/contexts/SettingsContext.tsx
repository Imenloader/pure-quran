import { createContext, useContext, useState, useEffect, ReactNode } from "react";

export type FontSize = "small" | "medium" | "large" | "xlarge";
export type LineSpacing = "normal" | "relaxed" | "loose";
export type Theme = "light" | "dark" | "system";

interface SettingsState {
  fontSize: FontSize;
  lineSpacing: LineSpacing;
  theme: Theme;
  defaultTafsirIds: number[];
  showTranslation: boolean;
  defaultTranslationId: number;
}

interface SettingsContextType extends SettingsState {
  setFontSize: (size: FontSize) => void;
  setLineSpacing: (spacing: LineSpacing) => void;
  setTheme: (theme: Theme) => void;
  setDefaultTafsirIds: (ids: number[]) => void;
  toggleTranslation: () => void;
  setDefaultTranslationId: (id: number) => void;
}

const defaultSettings: SettingsState = {
  fontSize: "medium",
  lineSpacing: "relaxed",
  theme: "light",
  defaultTafsirIds: [169, 93], // Ibn Kathir Arabic & English
  showTranslation: false,
  defaultTranslationId: 131, // Sahih International
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

  // Apply theme to document
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

  // Apply font size CSS variable
  useEffect(() => {
    const root = document.documentElement;
    const sizes = {
      small: "1.5rem",
      medium: "1.75rem",
      large: "2.25rem",
      xlarge: "2.75rem",
    };
    root.style.setProperty("--ayah-font-size", sizes[settings.fontSize]);
  }, [settings.fontSize]);

  // Apply line spacing CSS variable
  useEffect(() => {
    const root = document.documentElement;
    const spacings = {
      normal: "2",
      relaxed: "2.5",
      loose: "3",
    };
    root.style.setProperty("--ayah-line-height", spacings[settings.lineSpacing]);
  }, [settings.lineSpacing]);

  const value: SettingsContextType = {
    ...settings,
    setFontSize: (fontSize) => setSettings((s) => ({ ...s, fontSize })),
    setLineSpacing: (lineSpacing) => setSettings((s) => ({ ...s, lineSpacing })),
    setTheme: (theme) => setSettings((s) => ({ ...s, theme })),
    setDefaultTafsirIds: (defaultTafsirIds) => setSettings((s) => ({ ...s, defaultTafsirIds })),
    toggleTranslation: () => setSettings((s) => ({ ...s, showTranslation: !s.showTranslation })),
    setDefaultTranslationId: (defaultTranslationId) => setSettings((s) => ({ ...s, defaultTranslationId })),
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
