import { Link } from "react-router-dom";
import { Ayah, toArabicNumerals } from "@/lib/quran-api";

interface AyahDisplayProps {
  ayah: Ayah;
  surahNumber: number;
  showBismillah?: boolean;
}

export function AyahDisplay({ ayah, surahNumber, showBismillah = false }: AyahDisplayProps) {
  return (
    <div className="animate-fade-in" style={{ animationDelay: `${Math.min(ayah.numberInSurah * 20, 500)}ms` }}>
      {showBismillah && ayah.numberInSurah === 1 && (
        <div className="bismillah font-arabic arabic-text">
          بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
        </div>
      )}
      
      <Link
        to={`/surah/${surahNumber}/ayah/${ayah.numberInSurah}`}
        className="block py-4 border-b border-verse-separator last:border-b-0 hover:bg-surah-hover rounded-lg px-3 -mx-3 transition-colors cursor-pointer group"
      >
        <p className="font-arabic arabic-text ayah-text leading-loose group-hover:text-primary/90 transition-colors">
          {ayah.text}
          <span className="ayah-number mx-2 group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
            {toArabicNumerals(ayah.numberInSurah)}
          </span>
        </p>
      </Link>
    </div>
  );
}
