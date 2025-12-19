import { SurahDetails, toArabicNumerals, getRevelationTypeArabic } from "@/lib/quran-api";

interface SurahHeaderProps {
  surah: SurahDetails;
}

export function SurahHeader({ surah }: SurahHeaderProps) {
  return (
    <header className="text-center mb-6 fade-enter">
      <div className="bg-primary text-primary-foreground py-6 px-4 rounded-lg mb-4">
        <h1 className="font-arabic text-2xl md:text-3xl font-bold mb-2">
          {surah.name}
        </h1>
        <p className="text-sm text-white/80">
          {toArabicNumerals(surah.numberOfAyahs)} آية · {getRevelationTypeArabic(surah.revelationType)}
        </p>
      </div>
    </header>
  );
}