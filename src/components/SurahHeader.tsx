import { SurahDetails, toArabicNumerals, getRevelationTypeArabic } from "@/lib/quran-api";

interface SurahHeaderProps {
  surah: SurahDetails;
}

export function SurahHeader({ surah }: SurahHeaderProps) {
  return (
    <header className="text-center mb-8 fade-enter">
      {/* Surah Name - Dignified */}
      <div className="py-8">
        <h1 className="font-amiri text-4xl md:text-5xl font-bold text-foreground mb-4">
          {surah.name}
        </h1>
        
        {/* Elegant divider */}
        <div className="divider-ornament max-w-xs mx-auto mb-4">
          <span className="text-primary text-lg">❖</span>
        </div>
        
        {/* Metadata */}
        <p className="text-muted-foreground font-arabic text-sm">
          {toArabicNumerals(surah.numberOfAyahs)} آية · {getRevelationTypeArabic(surah.revelationType)}
        </p>
      </div>
    </header>
  );
}
