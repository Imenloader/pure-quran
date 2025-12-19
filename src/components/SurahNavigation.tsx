import { Link } from "react-router-dom";
import { ChevronRight, ChevronLeft } from "lucide-react";
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
    <div className="flex items-center justify-between gap-4 py-6">
      {/* Previous Surah (appears on the right in RTL) */}
      {nextSurah ? (
        <Link to={`/surah/${getSurahSlug(nextSurah)}`} className="flex-1">
          <Button
            variant="outline"
            className="w-full justify-start gap-2 h-auto py-3 px-4"
          >
            <ChevronRight className="h-4 w-4 flex-shrink-0" />
            <div className="text-right flex-1 min-w-0">
              <p className="text-xs text-muted-foreground">السورة التالية</p>
              <p className="font-arabic text-sm truncate">{nextSurah.name}</p>
            </div>
          </Button>
        </Link>
      ) : (
        <div className="flex-1" />
      )}

      {/* Next Surah (appears on the left in RTL) */}
      {prevSurah ? (
        <Link to={`/surah/${getSurahSlug(prevSurah)}`} className="flex-1">
          <Button
            variant="outline"
            className="w-full justify-end gap-2 h-auto py-3 px-4"
          >
            <div className="text-left flex-1 min-w-0">
              <p className="text-xs text-muted-foreground">السورة السابقة</p>
              <p className="font-arabic text-sm truncate">{prevSurah.name}</p>
            </div>
            <ChevronLeft className="h-4 w-4 flex-shrink-0" />
          </Button>
        </Link>
      ) : (
        <div className="flex-1" />
      )}
    </div>
  );
}
