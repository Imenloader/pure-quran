import { Link } from "react-router-dom";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Surah, getSurahSlug } from "@/lib/quran-api";

interface SurahNavigationProps {
  currentSurah: number;
  allSurahs: Surah[];
}

export function SurahNavigation({ currentSurah, allSurahs }: SurahNavigationProps) {
  const prevSurah = allSurahs.find((s) => s.number === currentSurah - 1);
  const nextSurah = allSurahs.find((s) => s.number === currentSurah + 1);

  return (
    <nav className="flex items-center justify-between mt-12 pt-8 border-t border-border/60 fade-enter">
      {nextSurah ? (
        <Link to={`/surah/${getSurahSlug(nextSurah)}`}>
          <Button variant="ghost" className="gap-2 font-arabic text-muted-foreground hover:text-foreground">
            <span>{nextSurah.name}</span>
            <ChevronLeft className="h-4 w-4" />
          </Button>
        </Link>
      ) : <div />}

      {prevSurah ? (
        <Link to={`/surah/${getSurahSlug(prevSurah)}`}>
          <Button variant="ghost" className="gap-2 font-arabic text-muted-foreground hover:text-foreground">
            <ChevronRight className="h-4 w-4" />
            <span>{prevSurah.name}</span>
          </Button>
        </Link>
      ) : <div />}
    </nav>
  );
}
