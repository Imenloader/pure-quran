import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronDown, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useAllSurahs } from "@/hooks/useQuranData";
import { toArabicNumerals, Surah } from "@/lib/quran-api";
import { cn } from "@/lib/utils";

interface SurahSelectorProps {
  currentSurahNumber: number;
  currentSurahName?: string;
}

export function SurahSelector({ currentSurahNumber, currentSurahName }: SurahSelectorProps) {
  const navigate = useNavigate();
  const { data: surahs } = useAllSurahs();
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const filteredSurahs = surahs?.filter((surah) => {
    if (!searchQuery.trim()) return true;
    const query = searchQuery.trim();
    // Search by number or name
    if (!isNaN(parseInt(query))) {
      return surah.number === parseInt(query);
    }
    return surah.name.includes(query);
  }) || [];

  const handleSelectSurah = (surah: Surah) => {
    setOpen(false);
    setSearchQuery("");
    navigate(`/surah/${surah.number}`);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button 
          variant="outline" 
          className="gap-2 font-arabic text-sm md:text-base h-10 px-4 bg-card border-border hover:bg-primary/5 hover:border-primary"
        >
          <BookOpen className="h-4 w-4 text-primary" />
          <span>{currentSurahName || `سورة ${toArabicNumerals(currentSurahNumber)}`}</span>
          <ChevronDown className="h-4 w-4 text-muted-foreground" />
        </Button>
      </PopoverTrigger>
      <PopoverContent 
        className="w-72 p-0 bg-card border-border shadow-lg z-50" 
        align="start"
        sideOffset={8}
      >
        {/* Search */}
        <div className="p-3 border-b border-border">
          <Input
            placeholder="ابحث عن سورة..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-9 font-arabic text-sm bg-background"
            dir="rtl"
          />
        </div>
        
        {/* Surah List */}
        <ScrollArea className="h-80">
          <div className="p-2">
            {filteredSurahs.length === 0 ? (
              <p className="text-center text-muted-foreground font-arabic py-4 text-sm">
                لا توجد نتائج
              </p>
            ) : (
              filteredSurahs.map((surah) => (
                <button
                  key={surah.number}
                  onClick={() => handleSelectSurah(surah)}
                  className={cn(
                    "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-right",
                    "transition-colors duration-150",
                    "hover:bg-primary/10",
                    surah.number === currentSurahNumber 
                      ? "bg-primary/15 text-primary font-semibold" 
                      : "text-foreground"
                  )}
                >
                  <span className="w-8 h-8 flex items-center justify-center rounded-lg bg-secondary text-sm font-arabic">
                    {toArabicNumerals(surah.number)}
                  </span>
                  <span className="flex-1 font-arabic text-sm">{surah.name}</span>
                  <span className="text-xs text-muted-foreground font-arabic">
                    {toArabicNumerals(surah.numberOfAyahs)} آية
                  </span>
                </button>
              ))
            )}
          </div>
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
}
