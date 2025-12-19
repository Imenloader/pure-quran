import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertCircle } from "lucide-react";
import { getArabicTafsirForAyah, ARABIC_TAFSIRS } from "@/lib/quran-api";
import { cn } from "@/lib/utils";

interface TafsirTabsProps {
  surahNumber: number;
  ayahNumber: number;
}

export function TafsirTabs({ surahNumber, ayahNumber }: TafsirTabsProps) {
  const [activeTab, setActiveTab] = useState<number>(ARABIC_TAFSIRS[0].id);

  return (
    <section className="fade-enter" style={{ animationDelay: "0.2s" }}>
      {/* Section Header */}
      <div className="flex items-center gap-3 mb-6">
        <h2 className="font-arabic text-xl font-bold text-foreground">التفسير</h2>
        <div className="flex-1 h-px bg-border" />
      </div>

      {/* Tab Buttons - Segmented Control Style */}
      <div className="flex flex-wrap gap-2 mb-6 p-1 bg-muted/50 rounded-lg w-fit">
        {ARABIC_TAFSIRS.map((tafsir) => (
          <button
            key={tafsir.id}
            onClick={() => setActiveTab(tafsir.id)}
            className={cn(
              "px-4 py-2 rounded-md text-sm font-arabic transition-all duration-200",
              activeTab === tafsir.id
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            {tafsir.author}
          </button>
        ))}
      </div>

      {/* Tafsir Content */}
      <div className="bg-card rounded-lg border border-border/60 overflow-hidden">
        <TafsirContent
          surahNumber={surahNumber}
          ayahNumber={ayahNumber}
          tafsirId={activeTab}
          tafsirName={ARABIC_TAFSIRS.find(t => t.id === activeTab)?.name || ""}
        />
      </div>
    </section>
  );
}

interface TafsirContentProps {
  surahNumber: number;
  ayahNumber: number;
  tafsirId: number;
  tafsirName: string;
}

function TafsirContent({ surahNumber, ayahNumber, tafsirId, tafsirName }: TafsirContentProps) {
  const {
    data: tafsir,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["arabic-tafsir", surahNumber, ayahNumber, tafsirId],
    queryFn: () => getArabicTafsirForAyah(surahNumber, ayahNumber, tafsirId),
    staleTime: 1000 * 60 * 60,
    gcTime: 1000 * 60 * 60 * 24,
  });

  if (isLoading) {
    return (
      <div className="p-8 space-y-4" dir="rtl">
        <Skeleton className="h-5 w-full" />
        <Skeleton className="h-5 w-[92%]" />
        <Skeleton className="h-5 w-[88%]" />
        <Skeleton className="h-5 w-[95%]" />
        <Skeleton className="h-5 w-[85%]" />
      </div>
    );
  }

  // Arabic-only error message - NO fallback to other languages
  if (error || !tafsir) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 text-muted-foreground p-12" dir="rtl">
        <AlertCircle className="h-8 w-8 text-amber-600" />
        <p className="font-arabic text-base text-center">
          هذا التفسير غير متوفر لهذه الآية.
        </p>
        <p className="font-arabic text-sm text-center opacity-75">
          يرجى اختيار تفسير آخر من القائمة أعلاه.
        </p>
      </div>
    );
  }

  // Clean up HTML and format - Arabic content only
  const cleanText = tafsir.text
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&quot;/g, '"')
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/\s+/g, " ")
    .trim();

  return (
    <div className="p-6 md:p-8" dir="rtl">
      <div className="tafsir-content font-arabic text-right leading-loose">
        {cleanText}
      </div>
    </div>
  );
}
