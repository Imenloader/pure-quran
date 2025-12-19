import { Ayah, toArabicNumerals } from "@/lib/quran-api";

interface AyahDisplayProps {
  ayah: Ayah;
  showBismillah?: boolean;
}

export function AyahDisplay({ ayah, showBismillah = false }: AyahDisplayProps) {
  // The Bismillah is included in the first ayah of each surah (except Al-Fatiha and At-Tawbah)
  // We'll handle this by checking if we need to show it separately
  
  return (
    <div className="animate-fade-in" style={{ animationDelay: `${Math.min(ayah.numberInSurah * 20, 500)}ms` }}>
      {showBismillah && ayah.numberInSurah === 1 && (
        <div className="bismillah font-arabic arabic-text">
          بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
        </div>
      )}
      
      <div className="py-4 border-b border-verse-separator last:border-b-0">
        <p className="font-arabic arabic-text ayah-text leading-loose">
          {ayah.text}
          <span className="ayah-number mx-2">
            {toArabicNumerals(ayah.numberInSurah)}
          </span>
        </p>
      </div>
    </div>
  );
}
