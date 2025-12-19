import { Link } from "react-router-dom";
import { Surah, getSurahSlug, toArabicNumerals, getRevelationTypeArabic } from "@/lib/quran-api";

interface SurahCardProps {
  surah: Surah;
  index: number;
}

export function SurahCard({ surah, index }: SurahCardProps) {
  return (
    <Link
      to={`/surah/${getSurahSlug(surah)}`}
      className="group block fade-enter"
      style={{ animationDelay: `${Math.min(index * 25, 250)}ms` }}
    >
      <div className="flex items-center gap-5 py-4 px-5 rounded-lg bg-card border border-border/50 soft-hover hover:border-border">
        {/* Surah Number */}
        <div className="flex-shrink-0 w-11 h-11 flex items-center justify-center rounded-full bg-primary/10 text-primary font-arabic text-lg font-bold">
          {toArabicNumerals(surah.number)}
        </div>

        {/* Surah Info */}
        <div className="flex-1 min-w-0">
          <h3 className="font-arabic text-xl font-bold text-foreground surah-title group-hover:text-primary transition-colors">
            {surah.name}
          </h3>
          <p className="text-sm text-muted-foreground mt-0.5">
            {toArabicNumerals(surah.numberOfAyahs)} آية · {getRevelationTypeArabic(surah.revelationType)}
          </p>
        </div>

        {/* English name - subtle */}
        <div className="text-left hidden sm:block">
          <p className="text-sm text-muted-foreground/70">{surah.englishName}</p>
        </div>
      </div>
    </Link>
  );
}
