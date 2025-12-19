import { Link } from "react-router-dom";
import { Surah, getSurahSlug, toArabicNumerals } from "@/lib/quran-api";

interface SurahCardProps {
  surah: Surah;
  index: number;
}

export function SurahCard({ surah, index }: SurahCardProps) {
  return (
    <Link
      to={`/surah/${getSurahSlug(surah)}`}
      className="group block animate-fade-in"
      style={{ animationDelay: `${Math.min(index * 30, 300)}ms` }}
    >
      <div className="flex items-center gap-4 p-4 rounded-lg border border-border bg-card hover:bg-surah-hover transition-colors duration-200">
        {/* Surah Number */}
        <div className="flex-shrink-0 w-12 h-12 flex items-center justify-center rounded-lg bg-primary/10 text-primary font-arabic text-lg font-bold">
          {toArabicNumerals(surah.number)}
        </div>

        {/* Surah Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <div>
              <h3 className="font-medium text-foreground group-hover:text-primary transition-colors">
                {surah.englishName}
              </h3>
              <p className="text-sm text-muted-foreground">
                {surah.englishNameTranslation}
              </p>
            </div>
            <div className="text-right">
              <p className="font-arabic text-xl text-foreground surah-name">
                {surah.name}
              </p>
              <p className="text-xs text-muted-foreground">
                {surah.numberOfAyahs} آيات • {surah.revelationType === "Meccan" ? "مكية" : "مدنية"}
              </p>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
