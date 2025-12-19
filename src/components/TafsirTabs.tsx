import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertCircle, BookOpen } from "lucide-react";
import { getTafsirForAyah, ARABIC_TAFSIRS } from "@/lib/quran-api";

interface TafsirTabsProps {
  surahNumber: number;
  ayahNumber: number;
}

export function TafsirTabs({ surahNumber, ayahNumber }: TafsirTabsProps) {
  const [activeTab, setActiveTab] = useState<string>(String(ARABIC_TAFSIRS[0].id));

  return (
    <div className="bg-card rounded-2xl border border-border overflow-hidden shadow-sm">
      <div className="bg-gradient-to-l from-primary/10 to-transparent p-4 border-b border-border">
        <div className="flex items-center gap-2 justify-end">
          <h3 className="font-arabic font-bold text-lg">التفسير</h3>
          <BookOpen className="h-5 w-5 text-primary" />
        </div>
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full" dir="rtl">
        <div className="border-b border-border bg-muted/30">
          <TabsList className="w-full justify-start gap-0 h-auto bg-transparent p-0 rounded-none">
            {ARABIC_TAFSIRS.map((tafsir) => (
              <TabsTrigger
                key={tafsir.id}
                value={String(tafsir.id)}
                className="font-arabic text-sm py-3 px-4 rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-background data-[state=active]:text-primary transition-all"
              >
                {tafsir.author}
              </TabsTrigger>
            ))}
          </TabsList>
        </div>

        {ARABIC_TAFSIRS.map((tafsir) => (
          <TabsContent key={tafsir.id} value={String(tafsir.id)} className="mt-0 p-0">
            <TafsirContent
              surahNumber={surahNumber}
              ayahNumber={ayahNumber}
              tafsirId={tafsir.id}
              tafsirName={tafsir.name}
            />
          </TabsContent>
        ))}
      </Tabs>
    </div>
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
      <div className="p-6 space-y-4">
        <Skeleton className="h-5 w-full" />
        <Skeleton className="h-5 w-[95%]" />
        <Skeleton className="h-5 w-[90%]" />
        <Skeleton className="h-5 w-[85%]" />
        <Skeleton className="h-5 w-[92%]" />
      </div>
    );
  }

  if (error || !tafsir) {
    return (
      <div className="flex items-center gap-3 text-muted-foreground p-8 justify-center">
        <span className="font-arabic text-sm">لا يتوفر {tafsirName} لهذه الآية حالياً</span>
        <AlertCircle className="h-5 w-5" />
      </div>
    );
  }

  // Clean up the text - remove HTML tags for cleaner display
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
    <div className="p-6 md:p-8">
      <div className="tafsir-text text-foreground/90 leading-relaxed">
        {cleanText}
      </div>
    </div>
  );
}
