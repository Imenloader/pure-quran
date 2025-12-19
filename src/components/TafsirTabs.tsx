import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertCircle } from "lucide-react";
import { getArabicTafsirForAyah, ARABIC_TAFSIRS } from "@/lib/quran-api";

interface TafsirTabsProps {
  surahNumber: number;
  ayahNumber: number;
}

export function TafsirTabs({ surahNumber, ayahNumber }: TafsirTabsProps) {
  return (
    <section className="space-y-6 fade-enter" style={{ animationDelay: "0.2s" }}>
      {/* Section Header */}
      <div className="bg-primary text-primary-foreground py-3 px-4 rounded-lg text-center">
        <h2 className="font-arabic text-lg font-bold">التفسير</h2>
      </div>

      {/* All Tafsirs - Vertical Layout */}
      {ARABIC_TAFSIRS.map((tafsir) => (
        <TafsirSection
          key={tafsir.id}
          surahNumber={surahNumber}
          ayahNumber={ayahNumber}
          tafsirId={tafsir.id}
          tafsirName={tafsir.name}
          tafsirAuthor={tafsir.author}
        />
      ))}
    </section>
  );
}

interface TafsirSectionProps {
  surahNumber: number;
  ayahNumber: number;
  tafsirId: number;
  tafsirName: string;
  tafsirAuthor: string;
}

function TafsirSection({ surahNumber, ayahNumber, tafsirId, tafsirName, tafsirAuthor }: TafsirSectionProps) {
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
      <div className="bg-card border border-border rounded-lg overflow-hidden">
        <div className="bg-secondary py-2 px-4 border-b border-border">
          <h3 className="font-arabic font-bold text-foreground">{tafsirName}</h3>
        </div>
        <div className="p-4 space-y-3" dir="rtl">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-[95%]" />
          <Skeleton className="h-4 w-[90%]" />
        </div>
      </div>
    );
  }

  if (error || !tafsir) {
    return (
      <div className="bg-card border border-border rounded-lg overflow-hidden">
        <div className="bg-secondary py-2 px-4 border-b border-border">
          <h3 className="font-arabic font-bold text-foreground">{tafsirName}</h3>
        </div>
        <div className="flex items-center justify-center gap-2 text-muted-foreground p-6" dir="rtl">
          <AlertCircle className="h-4 w-4 text-amber-500" />
          <p className="font-arabic text-sm">هذا التفسير غير متوفر لهذه الآية.</p>
        </div>
      </div>
    );
  }

  // Clean up HTML and ensure Arabic-only content
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
    <div className="bg-card border border-border rounded-lg overflow-hidden">
      {/* Tafsir Header */}
      <div className="bg-secondary py-2 px-4 border-b border-border flex items-center justify-between">
        <h3 className="font-arabic font-bold text-foreground">{tafsirName}</h3>
        <span className="text-xs text-muted-foreground">{tafsirAuthor}</span>
      </div>
      
      {/* Tafsir Content */}
      <div className="p-4 md:p-6" dir="rtl">
        <div className="tafsir-content leading-loose text-foreground/90">
          {cleanText}
        </div>
      </div>
    </div>
  );
}