import { SurahDetails, toArabicNumerals, getRevelationTypeArabic } from "@/lib/quran-api";

interface SurahHeaderProps {
  surah: SurahDetails;
}

export function SurahHeader({ surah }: SurahHeaderProps) {
  return (
    <header className="text-center py-10 fade-enter">
      {/* Surah Name */}
      <h1 className="font-arabic text-4xl md:text-5xl font-bold text-foreground surah-title mb-5">
        {surah.name}
      </h1>

      {/* Metadata */}
      <div className="flex items-center justify-center gap-3 text-muted-foreground text-sm">
        <span>{toArabicNumerals(surah.numberOfAyahs)} آية</span>
        <span className="text-gold">·</span>
        <span>{getRevelationTypeArabic(surah.revelationType)}</span>
        <span className="text-gold">·</span>
        <span>السورة {toArabicNumerals(surah.number)}</span>
      </div>

      {/* Decorative divider */}
      <div className="divider-ornament mt-8">
        <span>❖</span>
      </div>
    </header>
  );
}
