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
      className="block py-4 px-4 table-row-hover transition-colors cursor-pointer"
    >
      <p className="quran-text">
        {ayah.text}
        <span className="verse-number">{toArabicNumerals(ayah.numberInSurah)}</span>
      </p>
    </Link>
  );
}