import { Link } from "react-router-dom";
import { Ayah, toArabicNumerals } from "@/lib/quran-api";

interface AyahDisplayProps {
  ayah: Ayah;
  surahNumber: number;
}

export function AyahDisplay({ ayah, surahNumber }: AyahDisplayProps) {
  return (
    <Link
      to={`/surah/${surahNumber}/ayah/${ayah.numberInSurah}`}
      className="block py-6 soft-hover rounded-md -mx-4 px-4 cursor-pointer group"
    >
      <p className="quran-text text-foreground group-hover:text-foreground/85 transition-colors duration-200">
        {ayah.text}
        <span className="verse-end-mark">
          {toArabicNumerals(ayah.numberInSurah)}
        </span>
      </p>
    </Link>
  );
}
