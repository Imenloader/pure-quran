import { useState, useEffect, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AlertCircle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ARABIC_TAFSIRS, LocalTafsirContent } from "@/lib/quran-api";
import { supabase } from "@/integrations/supabase/client";

interface TafsirTabsProps {
  surahNumber: number;
  ayahNumber: number;
}

// Fetch tafsir from local database
async function getLocalTafsir(
  surahNumber: number,
  ayahNumber: number,
  tafsirId: number
): Promise<LocalTafsirContent | null> {
  const { data, error } = await supabase
    .from('tafsir_content')
    .select('*')
    .eq('surah_number', surahNumber)
    .eq('ayah_number', ayahNumber)
    .eq('tafsir_id', tafsirId)
    .maybeSingle();

  if (error) {
    console.error('Error fetching local tafsir:', error);
    return null;
  }

  return data;
}

// Check if tafsir data exists locally
async function checkTafsirExists(tafsirId: number): Promise<number> {
  const { count, error } = await supabase
    .from('tafsir_content')
    .select('*', { count: 'exact', head: true })
    .eq('tafsir_id', tafsirId);

  if (error) return 0;
  return count || 0;
}

export function TafsirTabs({ surahNumber, ayahNumber }: TafsirTabsProps) {
  const [activeTab, setActiveTab] = useState(ARABIC_TAFSIRS[0].id.toString());

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
          {ARABIC_TAFSIRS.map((tafsir) => (
            <TabsTrigger
              key={tafsir.id}
              value={tafsir.id.toString()}
              className="font-arabic text-sm px-4 py-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-md transition-all"
            >
              {tafsir.name}
            </TabsTrigger>
          ))}
        </TabsList>

        {ARABIC_TAFSIRS.map((tafsir) => (
          <TabsContent key={tafsir.id} value={tafsir.id.toString()} className="mt-0">
            <TafsirContent
              surahNumber={surahNumber}
              ayahNumber={ayahNumber}
              tafsirId={tafsir.id}
              tafsirName={tafsir.name}
              tafsirAuthor={tafsir.author}
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
  tafsirId: number;
  tafsirName: string;
  tafsirAuthor: string;
}

function TafsirContent({ surahNumber, ayahNumber, tafsirId, tafsirName, tafsirAuthor }: TafsirContentProps) {
  const [isImporting, setIsImporting] = useState(false);

  const {
    data: tafsir,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["local-tafsir", surahNumber, ayahNumber, tafsirId],
    queryFn: () => getLocalTafsir(surahNumber, ayahNumber, tafsirId),
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
            'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: JSON.stringify({
            action: 'import',
            tafsirId,
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
  }, [tafsirId, surahNumber, refetch]);

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
  const paragraphs = tafsir.text.split(/[.،](?=\s)/).filter(p => p.trim().length > 50);

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
            <p>{tafsir.text}</p>
          )}
        </div>
      </div>
    </div>
  );
}
