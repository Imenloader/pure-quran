import { useParams, Navigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { SurahHeader } from "@/components/SurahHeader";
import { AyahDisplay } from "@/components/AyahDisplay";
import { SurahNavigation } from "@/components/SurahNavigation";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { ErrorMessage } from "@/components/ErrorMessage";
import { useAllSurahs, useSurah } from "@/hooks/useQuranData";
import { parseSurahSlug } from "@/lib/quran-api";

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

        <main className="flex-1 container py-6">
          {isLoading ? (
            <LoadingSpinner message="جاري تحميل السورة..." />
          ) : error ? (
            <ErrorMessage message="فشل تحميل السورة" onRetry={() => refetch()} />
          ) : surah ? (
            <article className="max-w-3xl mx-auto">
              <SurahHeader surah={surah} />

              {/* Bismillah */}
              {showBismillah && (
                <div className="bismillah fade-enter" style={{ animationDelay: "0.15s" }}>
                  بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
                </div>
              )}

              {/* Reading hint */}
              <p className="text-center text-sm text-muted-foreground mb-8 fade-enter" style={{ animationDelay: "0.2s" }}>
                اضغط على أي آية لقراءة التفسير
              </p>

              {/* Verses */}
              <div className="border-t border-border/60 fade-enter" style={{ animationDelay: "0.25s" }}>
                {surah.ayahs.map((ayah) => (
                  <div key={ayah.number} className="border-b border-border/40 last:border-b-0">
                    <AyahDisplay ayah={ayah} surahNumber={surahNumber} />
                  </div>
                ))}
              </div>

              {/* Navigation */}
              {allSurahs && (
                <SurahNavigation currentSurah={surahNumber} allSurahs={allSurahs} />
              )}
            </article>
          ) : null}
        </main>

        <Footer />
      </div>
    </>
  );
};

export default SurahPage;
