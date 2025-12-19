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
      className="table-row-hover block border-b border-table-border last:border-b-0"
    >
      <div className="flex items-center gap-4 py-3 px-4">
        {/* Surah Number */}
        <div className="flex-shrink-0 w-8 text-center">
          <span className="text-sm font-semibold text-primary">
            {toArabicNumerals(surah.number)}
          </span>
        </div>

        {/* Arabic Name */}
        <div className="flex-1 min-w-0">
          <h3 className="font-arabic text-base font-semibold text-foreground">
            {surah.name}
          </h3>
        </div>

        {/* Ayah Count */}
        <div className="text-sm text-muted-foreground">
          {toArabicNumerals(surah.numberOfAyahs)} آية
        </div>

        {/* Revelation Type */}
        <div className="hidden sm:block text-sm text-muted-foreground w-12">
          {getRevelationTypeArabic(surah.revelationType)}
        </div>
      </div>
    </Link>
  );
}