import { Link } from "react-router-dom";
import { Ayah, toArabicNumerals } from "@/lib/quran-api";

interface AyahDisplayProps {
  ayah: Ayah;
  surahNumber: number;
  showBismillah?: boolean;
}

export function AyahDisplay({ ayah, surahNumber, showBismillah = false }: AyahDisplayProps) {
  return (
    <div className="animate-fade-in" style={{ animationDelay: `${Math.min(ayah.numberInSurah * 15, 400)}ms` }}>
      {showBismillah && ayah.numberInSurah === 1 && (
        <div className="bismillah font-arabic arabic-text">
          بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
        </div>
      )}
      
      <Link
        to={`/surah/${surahNumber}/ayah/${ayah.numberInSurah}`}
        className="block py-5 px-4 -mx-4 border-b border-verse-separator last:border-b-0 hover:bg-surah-hover rounded-lg transition-all duration-200 cursor-pointer group"
      >
        <p className="font-arabic arabic-text ayah-text leading-loose text-foreground group-hover:text-foreground/90 transition-colors">
          {ayah.text}
          <span className="ayah-number group-hover:scale-110 transition-transform inline-flex">
            {toArabicNumerals(ayah.numberInSurah)}
          </span>
        </p>
      </Link>
    </div>
  );
}
