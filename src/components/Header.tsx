import { Link, useLocation } from "react-router-dom";
import { Book, Search, Heart } from "lucide-react";
import { SettingsSheet } from "@/components/SettingsSheet";
import { useFavorites } from "@/contexts/FavoritesContext";
import { toArabicNumerals } from "@/lib/quran-api";

export function Header() {
  const location = useLocation();
  const { favorites } = useFavorites();
  const isHome = location.pathname === "/";
  const isSearch = location.pathname === "/search";
  const isFavorites = location.pathname === "/favorites";

  return (
    <header className="sticky top-0 z-50 bg-header text-header-foreground">
      <div className="container">
        <div className="flex items-center justify-between py-4">
          {/* Logo/Title */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 bg-primary/20 rounded-lg flex items-center justify-center transition-colors group-hover:bg-primary/30">
              <Book className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h1 className="font-amiri text-xl font-bold tracking-wide">القرآن الكريم</h1>
              <p className="text-xs text-header-foreground/60">القراءة والتفسير</p>
            </div>
          </Link>

          {/* Navigation */}
          <nav className="flex items-center gap-1">
            <Link
              to="/"
              className={`px-3 py-2 rounded-md text-sm font-arabic transition-colors ${
                isHome ? "bg-primary/15 text-primary" : "text-header-foreground/80 hover:bg-primary/10 hover:text-primary"
              }`}
            >
              الرئيسية
            </Link>
            <Link
              to="/search"
              className={`px-3 py-2 rounded-md text-sm font-arabic transition-colors flex items-center gap-1.5 ${
                isSearch ? "bg-primary/15 text-primary" : "text-header-foreground/80 hover:bg-primary/10 hover:text-primary"
              }`}
            >
              <Search className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">البحث</span>
            </Link>
            <Link
              to="/favorites"
              className={`px-3 py-2 rounded-md text-sm font-arabic transition-colors flex items-center gap-1.5 ${
                isFavorites ? "bg-primary/15 text-primary" : "text-header-foreground/80 hover:bg-primary/10 hover:text-primary"
              }`}
            >
              <Heart className={`h-3.5 w-3.5 ${favorites.length > 0 ? "fill-current" : ""}`} />
              <span className="hidden sm:inline">المفضلة</span>
              {favorites.length > 0 && (
                <span className="text-xs bg-primary text-primary-foreground px-1.5 py-0.5 rounded-full min-w-[1.25rem] text-center">
                  {toArabicNumerals(favorites.length)}
                </span>
              )}
            </Link>
            <div className="mr-2 border-r border-header-foreground/20 h-6" />
            <SettingsSheet />
          </nav>
        </div>
      </div>
    </header>
  );
}
