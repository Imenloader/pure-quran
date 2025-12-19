import { useParams, Navigate, Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { ChevronRight, Download } from "lucide-react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { SurahHeader } from "@/components/SurahHeader";
import { AyahDisplay } from "@/components/AyahDisplay";
import { SurahNavigation } from "@/components/SurahNavigation";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { ErrorMessage } from "@/components/ErrorMessage";
import { Button } from "@/components/ui/button";
import { useAllSurahs, useSurah } from "@/hooks/useQuranData";
import { parseSurahSlug } from "@/lib/quran-api";
import { generateSurahPDF } from "@/lib/pdf-generator";
import { toast } from "sonner";

const SurahPage = () => {
  const { slug } = useParams<{ slug: string }>();
  
  let surahNumber: number;
  try {
    surahNumber = parseSurahSlug(slug || "");
  } catch {
    return <Navigate to="/" replace />;
  }

  const { data: allSurahs } = useAllSurahs();
  const { data: surah, isLoading, error, refetch } = useSurah(surahNumber);

  const showBismillah = surahNumber !== 1 && surahNumber !== 9;

  const handleDownloadPDF = async () => {
    if (!surah) return;
    try {
      await generateSurahPDF(surah);
      toast.success("تم تحميل الملف بنجاح");
    } catch {
      toast.error("فشل تحميل الملف");
    }
  };

  return (
    <>
      <Helmet>
        <title>{surah ? `${surah.name} - القرآن الكريم` : "القرآن الكريم"}</title>
        <meta
          name="description"
          content={surah ? `اقرأ ${surah.name} كاملة مع التفسير` : "اقرأ القرآن الكريم"}
        />
        <link rel="canonical" href={`/surah/${slug}`} />
      </Helmet>

      <div className="min-h-screen flex flex-col bg-background">
        <Header />

        <main className="flex-1">
          {/* Breadcrumb */}
          <div className="border-b border-border py-3 bg-secondary/30">
            <div className="container">
              <div className="flex items-center justify-between">
                <nav className="flex items-center gap-2 text-sm text-muted-foreground font-arabic">
                  <Link to="/" className="hover:text-primary transition-colors">الرئيسية</Link>
                  <ChevronRight className="h-4 w-4 rotate-180" />
                  <span>فهرس السور</span>
                  {surah && (
                    <>
                      <ChevronRight className="h-4 w-4 rotate-180" />
                      <span className="text-foreground">{surah.name}</span>
                    </>
                  )}
                </nav>
                
                {surah && (
                  <Button variant="outline" size="sm" onClick={handleDownloadPDF} className="gap-2 text-muted-foreground hover:text-foreground">
                    <Download className="h-4 w-4" />
                    <span className="hidden sm:inline font-arabic">تحميل</span>
                  </Button>
                )}
              </div>
            </div>
          </div>

          <div className="container py-8">
            {isLoading ? (
              <LoadingSpinner message="جاري تحميل السورة..." />
            ) : error ? (
              <ErrorMessage message="فشل تحميل السورة" onRetry={() => refetch()} />
            ) : surah ? (
              <article className="max-w-3xl mx-auto">
                <SurahHeader surah={surah} />

                {/* Bismillah */}
                {showBismillah && (
                  <div className="bismillah fade-enter border-b border-divider" style={{ animationDelay: "0.1s" }}>
                    بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
                  </div>
                )}

                {/* Reading hint */}
                <p className="text-center text-xs text-muted-foreground/70 py-5 font-arabic fade-enter" style={{ animationDelay: "0.15s" }}>
                  اضغط على الآية لقراءة تفسيرها
                </p>

                {/* Verses - Mushaf-style flowing */}
                <div className="border border-border rounded-lg bg-card overflow-hidden fade-enter" style={{ animationDelay: "0.2s" }}>
                  {surah.ayahs.map((ayah) => (
                    <div key={ayah.number} className="border-b border-border/40 last:border-b-0">
                      <AyahDisplay ayah={ayah} surahNumber={surahNumber} surahName={surah.name} />
                    </div>
                  ))}
                </div>

                {/* Navigation */}
                {allSurahs && (
                  <SurahNavigation currentSurah={surahNumber} allSurahs={allSurahs} />
                )}
              </article>
            ) : null}
          </div>
        </main>

        <Footer />
      </div>
    </>
  );
};

export default SurahPage;
