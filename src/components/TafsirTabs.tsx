import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AlertCircle } from "lucide-react";
import { getTafsirSources, getLocalTafsirText, LocalTafsirSource } from "@/data/tafsir";

interface TafsirTabsProps {
  surahNumber: number;
  ayahNumber: number;
}

export function TafsirTabs({ surahNumber, ayahNumber }: TafsirTabsProps) {
  const [activeTab, setActiveTab] = useState<string>('');

  // Get local tafsir sources
  const sources = getTafsirSources();

  // Set default tab
  useEffect(() => {
    if (sources.length > 0 && !activeTab) {
      setActiveTab(sources[0].key);
    }
  }, [sources, activeTab]);

  if (sources.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground font-arabic">
        لا توجد تفاسير متاحة
      </div>
    );
  }

  return (
    <section className="fade-enter" style={{ animationDelay: "0.2s" }}>
      {/* Section Title */}
      <div className="text-center mb-6">
        <h2 className="font-amiri text-2xl font-bold text-foreground mb-2">التفسير</h2>
        <div className="divider-ornament max-w-xs mx-auto">
          <span className="text-primary">✦</span>
        </div>
      </div>

      {/* Tabs for Arabic Tafsirs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full" dir="rtl">
        <TabsList className="w-full flex flex-wrap justify-center gap-1 bg-secondary/50 p-2 rounded-lg mb-6 h-auto">
          {sources.map((source) => (
            <TabsTrigger
              key={source.key}
              value={source.key}
              className="font-arabic text-sm px-4 py-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-md transition-all"
            >
              {source.name}
            </TabsTrigger>
          ))}
        </TabsList>

        {sources.map((source) => (
          <TabsContent key={source.key} value={source.key} className="mt-0">
            <TafsirContent
              surahNumber={surahNumber}
              ayahNumber={ayahNumber}
              tafsirKey={source.key}
              tafsirName={source.name}
              tafsirAuthor={source.author}
            />
          </TabsContent>
        ))}
      </Tabs>
    </section>
  );
}

interface TafsirContentProps {
  surahNumber: number;
  ayahNumber: number;
  tafsirKey: string;
  tafsirName: string;
  tafsirAuthor: string;
}

function TafsirContent({ surahNumber, ayahNumber, tafsirKey, tafsirName, tafsirAuthor }: TafsirContentProps) {
  const {
    data: tafsirText,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["local-tafsir", surahNumber, ayahNumber, tafsirKey],
    queryFn: () => getLocalTafsirText(tafsirKey, surahNumber, ayahNumber),
    staleTime: Infinity, // Local data never gets stale
    gcTime: 1000 * 60 * 60 * 24 * 7, // 7 days cache
  });

  if (isLoading) {
    return (
      <div className="bg-card border border-border rounded-lg p-6 md:p-8">
        <div className="space-y-4">
          <Skeleton className="h-5 w-full" />
          <Skeleton className="h-5 w-[95%]" />
          <Skeleton className="h-5 w-[90%]" />
          <Skeleton className="h-5 w-[85%]" />
          <Skeleton className="h-5 w-[80%]" />
        </div>
      </div>
    );
  }

  if (error || !tafsirText) {
    return (
      <div className="bg-card border border-border rounded-lg p-8 text-center">
        <AlertCircle className="h-8 w-8 text-muted-foreground/50 mx-auto mb-4" />
        <p className="font-arabic text-muted-foreground">هذا التفسير غير متوفر لهذه الآية.</p>
      </div>
    );
  }

  // Split into paragraphs for better readability
  const paragraphs = tafsirText.split(/[.،](?=\s)/).filter(p => p.trim().length > 50);

  return (
    <div className="bg-card border border-border rounded-lg overflow-hidden">
      {/* Header */}
      <div className="bg-secondary/50 py-3 px-4 md:px-6 border-b border-border flex items-center justify-between">
        <h3 className="font-amiri font-bold text-foreground text-lg">{tafsirName}</h3>
        <span className="text-xs text-muted-foreground font-arabic">{tafsirAuthor}</span>
      </div>
      
      {/* Content */}
      <div className="p-6 md:p-8" dir="rtl">
        <div className="tafsir-content">
          {paragraphs.length > 1 ? (
            paragraphs.map((paragraph, index) => (
              <p key={index} className="mb-4 last:mb-0">
                {paragraph.trim()}{index < paragraphs.length - 1 ? '.' : ''}
              </p>
            ))
          ) : (
            <p>{tafsirText}</p>
          )}
        </div>
      </div>
    </div>
  );
}
