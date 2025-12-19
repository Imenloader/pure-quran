import { createContext, useContext, useState, useEffect, ReactNode } from "react";

export interface FavoriteAyah {
  surahNumber: number;
  surahName: string;
  ayahNumber: number;
  text: string;
  savedAt: number;
}

interface FavoritesContextType {
  favorites: FavoriteAyah[];
  addFavorite: (ayah: Omit<FavoriteAyah, "savedAt">) => void;
  removeFavorite: (surahNumber: number, ayahNumber: number) => void;
  isFavorite: (surahNumber: number, ayahNumber: number) => boolean;
  clearFavorites: () => void;
}

const FavoritesContext = createContext<FavoritesContextType | undefined>(undefined);

const STORAGE_KEY = "quran-favorites";

export function FavoritesProvider({ children }: { children: ReactNode }) {
  const [favorites, setFavorites] = useState<FavoriteAyah[]>(() => {
    if (typeof window === "undefined") return [];
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(favorites));
  }, [favorites]);

  const addFavorite = (ayah: Omit<FavoriteAyah, "savedAt">) => {
    setFavorites((prev) => {
      const exists = prev.some(
        (f) => f.surahNumber === ayah.surahNumber && f.ayahNumber === ayah.ayahNumber
      );
      if (exists) return prev;
      return [...prev, { ...ayah, savedAt: Date.now() }];
    });
  };

  const removeFavorite = (surahNumber: number, ayahNumber: number) => {
    setFavorites((prev) =>
      prev.filter((f) => !(f.surahNumber === surahNumber && f.ayahNumber === ayahNumber))
    );
  };

  const isFavorite = (surahNumber: number, ayahNumber: number) => {
    return favorites.some(
      (f) => f.surahNumber === surahNumber && f.ayahNumber === ayahNumber
    );
  };

  const clearFavorites = () => {
    setFavorites([]);
  };

  return (
    <FavoritesContext.Provider
      value={{ favorites, addFavorite, removeFavorite, isFavorite, clearFavorites }}
    >
      {children}
    </FavoritesContext.Provider>
  );
}

export function useFavorites() {
  const context = useContext(FavoritesContext);
  if (!context) {
    throw new Error("useFavorites must be used within FavoritesProvider");
  }
  return context;
}