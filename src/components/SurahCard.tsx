import { Link } from "react-router-dom";
import { Surah, getSurahSlug, toArabicNumerals, getRevelationTypeArabic } from "@/lib/quran-api";
import { ChevronLeft } from "lucide-react";

interface SurahCardProps {
  surah: Surah;
  index: number;
}

export function SurahCard({ surah, index }: SurahCardProps) {
  return (
    <Link
      to={`/surah/${getSurahSlug(surah)}`}
      className="group block"
      style={{ animationDelay: `${Math.min(index * 30, 300)}ms` }}
    >
      <div className="flex items-center gap-4 p-4 rounded-xl bg-card border border-border card-hover hover:border-primary/30 animate-fade-in">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center text-primary-foreground font-arabic font-bold text-lg shadow-md shadow-primary/20">
          {toArabicNumerals(surah.number)}
        </div>
        <div className="flex-1 min-w-0 text-right">
          <h3 className="font-arabic text-xl font-bold text-foreground surah-name group-hover:text-primary transition-colors">
            {surah.name}
          </h3>
          <div className="flex items-center gap-2 mt-1 justify-end">
            <span className="text-sm text-muted-foreground">{toArabicNumerals(surah.numberOfAyahs)} آية</span>
            <span className="text-muted-foreground/50">•</span>
            <span className="text-sm text-muted-foreground">{getRevelationTypeArabic(surah.revelationType)}</span>
          </div>
        </div>
        <ChevronLeft className="h-5 w-5 text-muted-foreground group-hover:text-primary group-hover:-translate-x-1 transition-all" />
      </div>
    </Link>
  );
}
