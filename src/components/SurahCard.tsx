import { Link } from "react-router-dom";
import { Surah, getSurahSlug, toArabicNumerals, getRevelationTypeArabic } from "@/lib/quran-api";
import { ChevronLeft, MapPin, BookOpen } from "lucide-react";

interface SurahCardProps {
  surah: Surah;
  index: number;
}

export function SurahCard({ surah, index }: SurahCardProps) {
  const isMeccan = surah.revelationType === "Meccan";
  
  return (
    <Link
      to={`/surah/${getSurahSlug(surah)}`}
      className="group table-row-hover block border-b border-border/50 last:border-b-0"
      style={{ animationDelay: `${index * 0.02}s` }}
    >
      <div className="flex items-center gap-4 py-4 px-5">
        {/* Surah Number - Decorative */}
        <div className="flex-shrink-0 w-12 flex justify-center">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary/15 to-primary/5 border border-primary/20 flex items-center justify-center group-hover:from-primary/25 group-hover:to-primary/10 transition-all duration-300">
            <span className="font-arabic text-sm text-primary font-bold">
              {toArabicNumerals(surah.number)}
            </span>
          </div>
        </div>

        {/* Arabic Name */}
        <div className="flex-1 min-w-0">
          <h3 className="font-amiri text-lg md:text-xl font-bold text-foreground group-hover:text-primary transition-colors">
            {surah.name}
          </h3>
          <p className="text-xs text-muted-foreground/70 font-arabic mt-0.5 hidden sm:block">
            {surah.englishNameTranslation}
          </p>
        </div>

        {/* Ayah Count */}
        <div className="w-20 text-center">
          <div className="inline-flex items-center gap-1.5 text-sm text-muted-foreground font-arabic">
            <BookOpen className="h-3.5 w-3.5 opacity-50" />
            <span>{toArabicNumerals(surah.numberOfAyahs)}</span>
          </div>
        </div>

        {/* Revelation Type */}
        <div className="hidden sm:flex w-16 justify-center">
          <span className={`inline-flex items-center gap-1 text-xs font-arabic px-2 py-1 rounded-full ${
            isMeccan 
              ? "bg-gold/10 text-gold" 
              : "bg-primary/10 text-primary"
          }`}>
            <MapPin className="h-3 w-3" />
            {getRevelationTypeArabic(surah.revelationType)}
          </span>
        </div>

        {/* Arrow */}
        <ChevronLeft className="h-5 w-5 text-muted-foreground/30 group-hover:text-primary group-hover:-translate-x-1 transition-all duration-300" />
      </div>
    </Link>
  );
}