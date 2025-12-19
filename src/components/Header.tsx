import { Link, useLocation } from "react-router-dom";
import { BookOpen, Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SettingsSheet } from "@/components/SettingsSheet";

export function Header() {
  const location = useLocation();
  const isHome = location.pathname === "/";

  return (
    <header className="sticky top-0 z-50 bg-background/95 backdrop-blur-md supports-[backdrop-filter]:bg-background/80 border-b border-border">
      <div className="container flex items-center justify-between h-16">
        {/* Right side - Settings & Navigation */}
        <div className="flex items-center gap-1">
          <SettingsSheet />
          
          {!isHome && (
            <Link to="/">
              <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-primary hover:bg-primary/10">
                <Home className="h-5 w-5" />
                <span className="sr-only">الرئيسية</span>
              </Button>
            </Link>
          )}
        </div>

        {/* Center - Logo */}
        <Link to="/" className="flex items-center gap-3 group absolute left-1/2 -translate-x-1/2">
          <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center group-hover:shadow-lg group-hover:shadow-primary/25 transition-all duration-300">
            <BookOpen className="h-5 w-5 text-primary-foreground" />
          </div>
          <div className="text-right hidden sm:block">
            <h1 className="font-arabic text-xl font-bold text-foreground surah-name">
              القرآن الكريم
            </h1>
            <p className="text-xs text-muted-foreground">
              مع التفسير
            </p>
          </div>
        </Link>

        {/* Left side - placeholder for balance */}
        <div className="w-10" />
      </div>
    </header>
  );
}
