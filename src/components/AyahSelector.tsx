import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronDown, Hash } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toArabicNumerals } from "@/lib/quran-api";
import { cn } from "@/lib/utils";

interface AyahSelectorProps {
  surahNumber: number;
  currentAyahNumber: number;
  totalAyahs: number;
}

export function AyahSelector({ surahNumber, currentAyahNumber, totalAyahs }: AyahSelectorProps) {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [error, setError] = useState("");

  // Generate array of ayah numbers
  const ayahNumbers = Array.from({ length: totalAyahs }, (_, i) => i + 1);

  const handleInputChange = (value: string) => {
    setInputValue(value);
    setError("");
  };

  const handleGoToAyah = () => {
    const ayahNum = parseInt(inputValue, 10);
    
    if (isNaN(ayahNum) || ayahNum < 1 || ayahNum > totalAyahs) {
      setError("رقم الآية غير صحيح.");
      return;
    }
    
    setOpen(false);
    setInputValue("");
    setError("");
    navigate(`/surah/${surahNumber}/ayah/${ayahNum}`);
  };

  const handleSelectAyah = (ayahNum: number) => {
    setOpen(false);
    setInputValue("");
    setError("");
    navigate(`/surah/${surahNumber}/ayah/${ayahNum}`);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleGoToAyah();
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button 
          variant="outline" 
          className="gap-2 font-arabic text-sm h-9 px-3 bg-card border-border hover:bg-primary/5 hover:border-primary"
        >
          <Hash className="h-3.5 w-3.5 text-primary" />
          <span>الآية {toArabicNumerals(currentAyahNumber)}</span>
          <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
        </Button>
      </PopoverTrigger>
      <PopoverContent 
        className="w-64 p-0 bg-card border-border shadow-lg z-50" 
        align="center"
        sideOffset={8}
      >
        {/* Quick Input */}
        <div className="p-3 border-b border-border">
          <p className="text-xs text-muted-foreground font-arabic mb-2">
            انتقل إلى آية محددة (١ - {toArabicNumerals(totalAyahs)})
          </p>
          <div className="flex gap-2">
            <Input
              type="number"
              min={1}
              max={totalAyahs}
              placeholder="رقم الآية"
              value={inputValue}
              onChange={(e) => handleInputChange(e.target.value)}
              onKeyDown={handleKeyDown}
              className="h-9 font-arabic text-sm bg-background flex-1"
              dir="rtl"
            />
            <Button 
              size="sm" 
              onClick={handleGoToAyah}
              className="h-9 px-4 font-arabic"
            >
              انتقال
            </Button>
          </div>
          {error && (
            <p className="text-xs text-destructive font-arabic mt-2">{error}</p>
          )}
        </div>
        
        {/* Ayah List */}
        <ScrollArea className="h-60">
          <div className="p-2 grid grid-cols-5 gap-1">
            {ayahNumbers.map((num) => (
              <button
                key={num}
                onClick={() => handleSelectAyah(num)}
                className={cn(
                  "w-full aspect-square flex items-center justify-center rounded-lg text-sm font-arabic",
                  "transition-colors duration-150",
                  "hover:bg-primary/10",
                  num === currentAyahNumber 
                    ? "bg-primary text-primary-foreground font-bold" 
                    : "bg-secondary/50 text-foreground hover:bg-secondary"
                )}
              >
                {toArabicNumerals(num)}
              </button>
            ))}
          </div>
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
}
