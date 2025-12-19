import { Link, useLocation } from "react-router-dom";
import { Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SettingsSheet } from "@/components/SettingsSheet";

export function Header() {
  const location = useLocation();
  const isHome = location.pathname === "/";

  return (
    <header className="sticky top-0 z-50 bg-background/98 backdrop-blur-sm border-b border-border/60">
      <div className="container flex items-center justify-between h-14">
        {/* Right - Settings */}
        <div className="flex items-center gap-1">
          <SettingsSheet />
          {!isHome && (
            <Link to="/">
              <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground">
                <Home className="h-4 w-4" />
              </Button>
            </Link>
          )}
        </div>

        {/* Center - Title */}
        <Link to="/" className="absolute left-1/2 -translate-x-1/2">
          <h1 className="font-arabic text-xl font-bold text-foreground surah-title">
            القرآن الكريم
          </h1>
        </Link>

        {/* Left - Spacer */}
        <div className="w-10" />
      </div>
    </header>
  );
}
