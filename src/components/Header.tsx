import { Link, useLocation } from "react-router-dom";
import { Home, Search, Book, Settings } from "lucide-react";
import { SettingsSheet } from "@/components/SettingsSheet";

export function Header() {
  const location = useLocation();
  const isHome = location.pathname === "/";

  return (
    <header className="sticky top-0 z-50">
      {/* Top nav bar */}
      <div className="bg-neutral-800 text-neutral-300 text-xs py-1.5">
        <div className="container flex items-center justify-between">
          <nav className="flex items-center gap-4">
            <Link to="/" className="hover:text-white transition-colors">الرئيسية</Link>
            <span className="text-neutral-600">|</span>
            <Link to="/" className="hover:text-white transition-colors">فهرس السور</Link>
            <span className="text-neutral-600">|</span>
            <span className="text-neutral-500">تفسير القرآن</span>
          </nav>
          <SettingsSheet />
        </div>
      </div>

      {/* Main header */}
      <div className="bg-primary text-primary-foreground py-6">
        <div className="container">
          <div className="flex items-center justify-between">
            {/* Logo/Title */}
            <Link to="/" className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                <Book className="h-5 w-5" />
              </div>
              <div>
                <h1 className="font-arabic text-xl font-bold">القرآن الكريم</h1>
                <p className="text-xs text-white/70">القراءة والتفسير</p>
              </div>
            </Link>

            {/* Navigation */}
            <nav className="hidden md:flex items-center gap-1">
              <Link
                to="/"
                className={`px-4 py-2 rounded text-sm transition-colors ${
                  isHome ? "bg-white/20" : "hover:bg-white/10"
                }`}
              >
                <span className="flex items-center gap-2">
                  <Home className="h-4 w-4" />
                  الرئيسية
                </span>
              </Link>
              <Link
                to="/"
                className="px-4 py-2 rounded text-sm hover:bg-white/10 transition-colors"
              >
                <span className="flex items-center gap-2">
                  <Book className="h-4 w-4" />
                  فهرس السور
                </span>
              </Link>
            </nav>

            {/* Mobile nav */}
            <div className="flex md:hidden items-center gap-2">
              {!isHome && (
                <Link to="/" className="p-2 hover:bg-white/10 rounded transition-colors">
                  <Home className="h-5 w-5" />
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}