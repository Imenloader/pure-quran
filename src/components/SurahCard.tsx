import { Link } from "react-router-dom";
import { Surah, getSurahSlug, toArabicNumerals, getRevelationTypeArabic } from "@/lib/quran-api";

interface SurahCardProps {
  surah: Surah;
  index: number;
}

export function SurahCard({ surah }: SurahCardProps) {
  return (
    <Link
      to={`/surah/${getSurahSlug(surah)}`}
      className="table-row-hover block border-b border-border last:border-b-0"
    >
      <div className="flex items-center gap-4 py-3.5 px-4">
        {/* Surah Number */}
        <div className="flex-shrink-0 w-10 text-center">
          <span className="font-arabic text-sm text-primary font-semibold">
            {toArabicNumerals(surah.number)}
          </span>
        </div>

        {/* Arabic Name */}
        <div className="flex-1 min-w-0">
          <h3 className="font-amiri text-lg font-semibold text-foreground">
            {surah.name}
          </h3>
        </div>

        {/* Ayah Count */}
        <div className="text-sm text-muted-foreground font-arabic">
          {toArabicNumerals(surah.numberOfAyahs)} آية
        </div>

        {/* Revelation Type */}
        <div className="hidden sm:block text-xs text-muted-foreground/70 font-arabic w-12 text-center">
          {getRevelationTypeArabic(surah.revelationType)}
        </div>
      </div>
    </Link>
  );
}
