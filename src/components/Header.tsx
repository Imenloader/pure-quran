import { Link } from "react-router-dom";
import { Book, Home } from "lucide-react";
import { Button } from "@/components/ui/button";

export function Header() {
  return (
    <header className="sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 border-b border-border">
      <div className="container flex items-center justify-between h-16">
        <Link to="/" className="flex items-center gap-2">
          <Button variant="ghost" size="icon" className="md:hidden">
            <Home className="h-5 w-5" />
          </Button>
          <span className="hidden md:flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
            <Home className="h-4 w-4" />
            <span className="text-sm">الرئيسية</span>
          </span>
        </Link>

        <Link to="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
            <Book className="h-5 w-5 text-primary" />
          </div>
          <div className="text-right">
            <h1 className="font-arabic text-xl font-bold text-foreground surah-name">
              القرآن الكريم
            </h1>
            <p className="text-xs text-muted-foreground hidden sm:block">
              The Noble Quran
            </p>
          </div>
        </Link>

        <div className="w-10" /> {/* Spacer for balance */}
      </div>
    </header>
  );
}
