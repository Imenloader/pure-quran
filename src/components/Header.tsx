import { Link, useLocation } from "react-router-dom";
import { Book, Home, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SettingsSheet } from "@/components/SettingsSheet";

export function Header() {
  const location = useLocation();
  const isHome = location.pathname === "/";

  return (
    <header className="sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 border-b border-border">
      <div className="container flex items-center justify-between h-14 md:h-16">
        {/* Left side - Settings & Navigation */}
        <div className="flex items-center gap-1">
          <SettingsSheet />
          
          {!isHome && (
            <Link to="/">
              <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground">
                <Home className="h-5 w-5" />
                <span className="sr-only">الرئيسية</span>
              </Button>
            </Link>
          )}
        </div>

        {/* Center - Logo */}
        <Link to="/" className="flex items-center gap-2 md:gap-3 group absolute left-1/2 -translate-x-1/2">
          <div className="w-8 h-8 md:w-10 md:h-10 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
            <Book className="h-4 w-4 md:h-5 md:w-5 text-primary" />
          </div>
          <div className="text-right hidden sm:block">
            <h1 className="font-arabic text-lg md:text-xl font-bold text-foreground surah-name">
              القرآن الكريم
            </h1>
          </div>
        </Link>

        {/* Right side - Search (optional placeholder) */}
        <div className="w-10">
          {/* Placeholder for balance / future search button */}
        </div>
      </div>
    </header>
  );
}
