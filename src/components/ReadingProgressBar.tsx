import { BookOpen } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { toArabicNumerals } from "@/lib/quran-api";
import { cn } from "@/lib/utils";

interface ReadingProgressBarProps {
  percentage: number;
  totalRead: number;
  totalAyahs: number;
  compact?: boolean;
  className?: string;
}

export function ReadingProgressBar({
  percentage,
  totalRead,
  totalAyahs,
  compact = false,
  className,
}: ReadingProgressBarProps) {
  if (compact) {
    return (
      <div className={cn("flex items-center gap-2", className)}>
        <BookOpen className="h-4 w-4 text-primary" />
        <div className="flex-1 min-w-[80px]">
          <Progress value={percentage} className="h-2" />
        </div>
        <span className="text-xs font-arabic text-muted-foreground whitespace-nowrap">
          {toArabicNumerals(percentage)}٪
        </span>
      </div>
    );
  }

  return (
    <div className={cn("bg-card border border-border rounded-xl p-4", className)}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
            <BookOpen className="h-4 w-4 text-primary" />
          </div>
          <span className="font-arabic font-semibold text-foreground">تقدم القراءة</span>
        </div>
        <div className="text-left">
          <span className="text-2xl font-bold text-primary font-arabic">
            {toArabicNumerals(percentage)}٪
          </span>
        </div>
      </div>
      
      <Progress value={percentage} className="h-3 mb-2" />
      
      <div className="flex justify-between text-xs text-muted-foreground font-arabic">
        <span>
          تم قراءة {toArabicNumerals(totalRead)} آية
        </span>
        <span>
          من أصل {toArabicNumerals(totalAyahs)} آية
        </span>
      </div>
    </div>
  );
}
