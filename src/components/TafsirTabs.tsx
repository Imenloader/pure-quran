import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertCircle } from "lucide-react";
import { getTafsirForAyah, POPULAR_TAFSIRS } from "@/lib/quran-api";
import { useSettings } from "@/contexts/SettingsContext";

interface TafsirTabsProps {
  surahNumber: number;
  ayahNumber: number;
}

export function TafsirTabs({ surahNumber, ayahNumber }: TafsirTabsProps) {
  const { defaultTafsirIds } = useSettings();
  const [activeTab, setActiveTab] = useState<string>(String(defaultTafsirIds[0] || POPULAR_TAFSIRS[0].id));

  // Get tafsirs to display
  const tafsirsToShow = POPULAR_TAFSIRS.filter(
    (t) => defaultTafsirIds.includes(t.id) || POPULAR_TAFSIRS.slice(0, 3).some((p) => p.id === t.id)
  ).slice(0, 4);

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full" dir="rtl">
      <TabsList className="w-full justify-start gap-1 h-auto flex-wrap bg-muted/50 p-1">
        {tafsirsToShow.map((tafsir) => (
          <TabsTrigger
            key={tafsir.id}
            value={String(tafsir.id)}
            className="font-arabic text-sm data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
          >
            {tafsir.name}
          </TabsTrigger>
        ))}
      </TabsList>

      {tafsirsToShow.map((tafsir) => (
        <TabsContent key={tafsir.id} value={String(tafsir.id)} className="mt-4">
          <TafsirContent
            surahNumber={surahNumber}
            ayahNumber={ayahNumber}
            tafsirId={tafsir.id}
            tafsirName={tafsir.name}
          />
        </TabsContent>
      ))}
    </Tabs>
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
    queryKey: ["tafsir", surahNumber, ayahNumber, tafsirId],
    queryFn: () => getTafsirForAyah(surahNumber, ayahNumber, tafsirId),
    staleTime: 1000 * 60 * 60, // 1 hour
    gcTime: 1000 * 60 * 60 * 24, // 24 hours
  });

  if (isLoading) {
    return (
      <div className="space-y-3">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-[90%]" />
        <Skeleton className="h-4 w-[80%]" />
        <Skeleton className="h-4 w-[85%]" />
      </div>
    );
  }

  if (error || !tafsir) {
    return (
      <div className="flex items-center gap-2 text-muted-foreground p-4 bg-muted/30 rounded-lg">
        <AlertCircle className="h-5 w-5" />
        <span className="font-arabic text-sm">لا يتوفر تفسير {tafsirName} لهذه الآية حالياً</span>
      </div>
    );
  }

  // Strip HTML and clean up the text
  const cleanText = tafsir.text
    .replace(/<[^>]*>/g, "") // Remove HTML tags
    .replace(/&nbsp;/g, " ")
    .replace(/&quot;/g, '"')
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">");

  return (
    <div className="bg-card rounded-lg p-4 md:p-6 border border-border">
      <div
        className="font-arabic text-right leading-relaxed text-foreground/90"
        style={{ lineHeight: "2" }}
      >
        {cleanText}
      </div>
    </div>
  );
}
