import { SurahDetails, toArabicNumerals } from "@/lib/quran-api";

interface SurahHeaderProps {
  surah: SurahDetails;
}

export function SurahHeader({ surah }: SurahHeaderProps) {
  return (
    <div className="text-center py-8 border-b border-border">
      {/* Decorative top element */}
      <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary/10 mb-4">
        <span className="font-arabic text-2xl font-bold text-primary">
          {toArabicNumerals(surah.number)}
        </span>
      </div>

      {/* Arabic name */}
      <h1 className="font-arabic text-4xl md:text-5xl font-bold text-foreground surah-name mb-2">
        سورة {surah.name.replace("سُورَةُ ", "").replace("سورة ", "")}
      </h1>

      {/* English name */}
      <p className="text-lg text-muted-foreground mb-4">
        {surah.englishName} — {surah.englishNameTranslation}
      </p>

      {/* Meta info */}
      <div className="flex items-center justify-center gap-4 text-sm text-muted-foreground font-arabic">
        <span>{surah.numberOfAyahs} آيات</span>
        <span>•</span>
        <span>{surah.revelationType === "Meccan" ? "مكية" : "مدنية"}</span>
      </div>
    </div>
  );
}
