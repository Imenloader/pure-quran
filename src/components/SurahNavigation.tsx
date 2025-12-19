import { Link } from "react-router-dom";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Surah, getSurahSlug } from "@/lib/quran-api";
import { Button } from "@/components/ui/button";

interface SurahNavigationProps {
  currentSurah: number;
  allSurahs: Surah[];
}

export function SurahNavigation({ currentSurah, allSurahs }: SurahNavigationProps) {
  const prevSurah = allSurahs.find((s) => s.number === currentSurah - 1);
  const nextSurah = allSurahs.find((s) => s.number === currentSurah + 1);

  return (
    <nav className="flex items-center justify-between mt-8 pt-6 border-t border-border fade-enter">
      {nextSurah ? (
        <Link to={`/surah/${getSurahSlug(nextSurah)}`}>
          <Button variant="outline" size="sm" className="gap-2">
            <span className="font-arabic">{nextSurah.name}</span>
            <ChevronLeft className="h-4 w-4" />
          </Button>
        </Link>
      ) : <div />}

      <Link to="/">
        <Button variant="ghost" size="sm" className="text-link">
          فهرس السور
        </Button>
      </Link>

      {prevSurah ? (
        <Link to={`/surah/${getSurahSlug(prevSurah)}`}>
          <Button variant="outline" size="sm" className="gap-2">
            <ChevronRight className="h-4 w-4" />
            <span className="font-arabic">{prevSurah.name}</span>
          </Button>
        </Link>
      ) : <div />}
    </nav>
  );
}