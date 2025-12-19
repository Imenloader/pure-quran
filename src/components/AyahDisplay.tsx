import { Link } from "react-router-dom";
import { Heart } from "lucide-react";
import { Ayah, toArabicNumerals } from "@/lib/quran-api";
import { useFavorites } from "@/contexts/FavoritesContext";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface AyahDisplayProps {
  ayah: Ayah;
  surahNumber: number;
  surahName: string;
}

export function AyahDisplay({ ayah, surahNumber, surahName }: AyahDisplayProps) {
  const { isFavorite, addFavorite, removeFavorite } = useFavorites();
  const isFav = isFavorite(surahNumber, ayah.numberInSurah);

  const handleFavorite = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (isFav) {
      removeFavorite(surahNumber, ayah.numberInSurah);
      toast.success("تم إزالة الآية من المفضلة");
    } else {
      addFavorite({
        surahNumber,
        surahName,
        ayahNumber: ayah.numberInSurah,
        text: ayah.text,
      });
      toast.success("تم إضافة الآية إلى المفضلة");
    }
  };

  return (
    <div className="group relative">
      <Link
        to={`/surah/${surahNumber}/ayah/${ayah.numberInSurah}`}
        className="block py-4 px-4 pr-12 table-row-hover transition-colors cursor-pointer"
      >
        <p className="quran-text">
          {ayah.text}
          <span className="verse-number">{toArabicNumerals(ayah.numberInSurah)}</span>
        </p>
      </Link>
      
      {/* Favorite Button */}
      <Button
        variant="ghost"
        size="icon"
        onClick={handleFavorite}
        className={`absolute top-3 right-2 h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity ${
          isFav ? "opacity-100 text-red-500 hover:text-red-600" : "text-muted-foreground hover:text-red-500"
        }`}
      >
        <Heart className={`h-4 w-4 ${isFav ? "fill-current" : ""}`} />
      </Button>
    </div>
  );
}