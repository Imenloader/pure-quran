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
      <div className="bg-primary text-primary-foreground py-3 px-4 rounded-t-lg">
        <h2 className="font-arabic text-lg font-bold">التفسير</h2>
      </div>

      {/* Tab Buttons */}
      <div className="flex flex-wrap border-x border-border bg-secondary">
        {ARABIC_TAFSIRS.map((tafsir) => (
          <button
            key={tafsir.id}
            onClick={() => setActiveTab(tafsir.id)}
            className={cn(
              "px-4 py-2.5 text-sm font-arabic transition-colors border-b-2",
              activeTab === tafsir.id
                ? "border-primary text-primary bg-background"
                : "border-transparent text-muted-foreground hover:text-foreground hover:bg-background/50"
            )}
          >
            {tafsir.author}
          </button>
        ))}
      </div>

      {/* Tafsir Content */}
      <div className="bg-card rounded-b-lg border border-t-0 border-border">
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
      <div className="p-6 space-y-3" dir="rtl">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-[95%]" />
        <Skeleton className="h-4 w-[90%]" />
        <Skeleton className="h-4 w-[92%]" />
        <Skeleton className="h-4 w-[88%]" />
      </div>
    );
  }

  if (error || !tafsir) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 text-muted-foreground p-10" dir="rtl">
        <AlertCircle className="h-6 w-6 text-amber-500" />
        <p className="font-arabic text-sm text-center">
          هذا التفسير غير متوفر لهذه الآية.
        </p>
        <p className="font-arabic text-xs text-center opacity-70">
          يرجى اختيار تفسير آخر من القائمة أعلاه.
        </p>
      </div>
    );
  }

  // Clean up HTML
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
    <div className="p-6" dir="rtl">
      <div className="tafsir-content">
        {cleanText}
      </div>
    </div>
  );
}