import { Link, useLocation } from "react-router-dom";
import { BookOpen, Search, Heart, Sparkles } from "lucide-react";
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
    <header className="sticky top-0 z-50 bg-header border-b border-primary/20 shadow-lg">
      <div className="container">
        <div className="flex items-center justify-between py-3 md:py-4">
          {/* Logo/Title */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="relative w-11 h-11 md:w-12 md:h-12 rounded-xl flex items-center justify-center overflow-hidden">
              {/* Decorative background */}
              <div className="absolute inset-0 bg-gradient-to-br from-primary/30 to-gold/20 group-hover:from-primary/40 group-hover:to-gold/30 transition-all duration-300" />
              <div className="absolute inset-0 border-2 border-primary-foreground/20 rounded-xl" />
              <BookOpen className="h-5 w-5 md:h-6 md:w-6 text-primary-foreground relative z-10" />
              <Sparkles className="absolute top-1 left-1 h-3 w-3 text-gold opacity-60" />
            </div>
            <div>
              <h1 className="font-amiri text-lg md:text-xl font-bold tracking-wide text-header-foreground">
                القرآن الكريم
              </h1>
              <p className="text-[10px] md:text-xs text-header-foreground/50 font-arabic">
                القراءة والتدبر والتفسير
              </p>
            </div>
          </Link>

          {/* Navigation */}
          <nav className="flex items-center gap-1 md:gap-2">
            <Link
              to="/"
              className={`px-3 py-2 rounded-lg text-sm font-arabic transition-all duration-200 ${
                isHome 
                  ? "bg-primary-foreground/15 text-primary-foreground shadow-inner" 
                  : "text-header-foreground/70 hover:bg-primary-foreground/10 hover:text-primary-foreground"
              }`}
            >
              الرئيسية
            </Link>
            <Link
              to="/search"
              className={`px-3 py-2 rounded-lg text-sm font-arabic transition-all duration-200 flex items-center gap-1.5 ${
                isSearch 
                  ? "bg-primary-foreground/15 text-primary-foreground shadow-inner" 
                  : "text-header-foreground/70 hover:bg-primary-foreground/10 hover:text-primary-foreground"
              }`}
            >
              <Search className="h-4 w-4" />
              <span className="hidden sm:inline">البحث</span>
            </Link>
            <Link
              to="/favorites"
              className={`px-3 py-2 rounded-lg text-sm font-arabic transition-all duration-200 flex items-center gap-1.5 ${
                isFavorites 
                  ? "bg-primary-foreground/15 text-primary-foreground shadow-inner" 
                  : "text-header-foreground/70 hover:bg-primary-foreground/10 hover:text-primary-foreground"
              }`}
            >
              <Heart className={`h-4 w-4 ${favorites.length > 0 ? "fill-current text-red-400" : ""}`} />
              <span className="hidden sm:inline">المفضلة</span>
              {favorites.length > 0 && (
                <span className="text-xs bg-gold text-header px-1.5 py-0.5 rounded-full min-w-[1.25rem] text-center font-bold">
                  {toArabicNumerals(favorites.length)}
                </span>
              )}
            </Link>
            <div className="mr-2 md:mr-3 border-r border-header-foreground/20 h-6" />
            <SettingsSheet />
          </nav>
        </div>
      </div>
    </header>
  );
}