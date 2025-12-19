import { useState, useEffect, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AlertCircle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TafsirSource, TafsirText } from "@/lib/quran-api";
import { supabase } from "@/integrations/supabase/client";

interface TafsirTabsProps {
  surahNumber: number;
  ayahNumber: number;
}

// Fetch enabled tafsir sources from database
async function getTafsirSources(): Promise<TafsirSource[]> {
  const { data, error } = await supabase
    .from('tafsir_sources')
    .select('*')
    .eq('enabled', true)
    .order('display_order');

  if (error) {
    console.error('Error fetching tafsir sources:', error);
    return [];
  }

  return data || [];
}

// Fetch tafsir text from local database
async function getLocalTafsir(
  surahNumber: number,
  ayahNumber: number,
  tafsirKey: string
): Promise<TafsirText | null> {
  const { data, error } = await supabase
    .from('tafsir_texts')
    .select('*')
    .eq('surah_number', surahNumber)
    .eq('ayah_number', ayahNumber)
    .eq('tafsir_key', tafsirKey)
    .maybeSingle();

  if (error) {
    console.error('Error fetching local tafsir:', error);
    return null;
  }

  return data;
}

export function TafsirTabs({ surahNumber, ayahNumber }: TafsirTabsProps) {
  const [activeTab, setActiveTab] = useState<string>('');

  // Fetch tafsir sources
  const { data: sources = [], isLoading: sourcesLoading } = useQuery({
    queryKey: ['tafsir-sources'],
    queryFn: getTafsirSources,
    staleTime: 1000 * 60 * 60, // 1 hour
  });

  // Set default tab when sources load
  useEffect(() => {
    if (sources.length > 0 && !activeTab) {
      setActiveTab(sources[0].tafsir_key);
    }
  }, [sources, activeTab]);

  if (sourcesLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-48 w-full" />
      </div>
    );
  }

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
              key={source.tafsir_key}
              value={source.tafsir_key}
              className="font-arabic text-sm px-4 py-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-md transition-all"
            >
              {source.tafsir_name_ar}
            </TabsTrigger>
          ))}
        </TabsList>

        {sources.map((source) => (
          <TabsContent key={source.tafsir_key} value={source.tafsir_key} className="mt-0">
            <TafsirContent
              surahNumber={surahNumber}
              ayahNumber={ayahNumber}
              tafsirKey={source.tafsir_key}
              tafsirName={source.tafsir_name_ar}
              tafsirAuthor={source.author_ar}
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
  const [isImporting, setIsImporting] = useState(false);

  const {
    data: tafsir,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["local-tafsir", surahNumber, ayahNumber, tafsirKey],
    queryFn: () => getLocalTafsir(surahNumber, ayahNumber, tafsirKey),
    staleTime: 1000 * 60 * 60 * 24, // 24 hours - local data
    gcTime: 1000 * 60 * 60 * 24 * 7, // 7 days
  });

  const handleImport = useCallback(async () => {
    setIsImporting(true);
    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/import-tafsir`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            action: 'import',
            tafsirKey,
            surahNumber,
          }),
        }
      );

      if (response.ok) {
        // Refetch after import
        setTimeout(() => refetch(), 1000);
      }
    } catch (err) {
      console.error('Import error:', err);
    } finally {
      setIsImporting(false);
    }
  }, [tafsirKey, surahNumber, refetch]);

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

  if (error || !tafsir) {
    return (
      <div className="bg-card border border-border rounded-lg p-8 text-center">
        <AlertCircle className="h-8 w-8 text-muted-foreground/50 mx-auto mb-4" />
        <p className="font-arabic text-muted-foreground mb-4">هذا التفسير غير متوفر لهذه الآية.</p>
        <Button
          variant="outline"
          size="sm"
          onClick={handleImport}
          disabled={isImporting}
          className="gap-2 font-arabic"
        >
          <RefreshCw className={`h-4 w-4 ${isImporting ? 'animate-spin' : ''}`} />
          {isImporting ? 'جاري التحميل...' : 'تحميل التفسير'}
        </Button>
      </div>
    );
  }

  // Split into paragraphs for better readability
  const paragraphs = tafsir.text_ar.split(/[.،](?=\s)/).filter(p => p.trim().length > 50);

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
            <p>{tafsir.text_ar}</p>
          )}
        </div>
      </div>
    </div>
  );
}
