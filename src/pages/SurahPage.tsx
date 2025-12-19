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

  // Determine if we should show Bismillah
  const showBismillah = surahNumber !== 1 && surahNumber !== 9;

  return (
    <>
      <Helmet>
        <title>
          {surah ? `${surah.name} - القرآن الكريم` : "القرآن الكريم"}
        </title>
        <meta
          name="description"
          content={surah ? `اقرأ ${surah.name} كاملة مع التفسير` : "اقرأ القرآن الكريم"}
        />
        <link rel="canonical" href={`/surah/${slug}`} />
      </Helmet>

      <div className="min-h-screen flex flex-col">
        <Header />

        <main className="flex-1 container py-6">
          {isLoading ? (
            <LoadingSpinner message="جاري تحميل السورة..." />
          ) : error ? (
            <ErrorMessage
              message="فشل تحميل السورة. يرجى المحاولة مرة أخرى."
              onRetry={() => refetch()}
            />
          ) : surah ? (
            <article className="max-w-3xl mx-auto">
              <SurahHeader surah={surah} />

              {/* Bismillah */}
              {showBismillah && (
                <div className="bismillah font-arabic arabic-text">
                  بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
                </div>
              )}

              {/* Hint */}
              <div className="text-center mb-6 mt-4">
                <p className="text-sm text-muted-foreground font-arabic bg-muted/50 inline-block px-4 py-2 rounded-full">
                  اضغط على أي آية لقراءة التفسير
                </p>
              </div>

              {/* Ayahs */}
              <div className="bg-card rounded-2xl border border-border p-4 md:p-6 shadow-sm">
                {surah.ayahs.map((ayah) => (
                  <AyahDisplay
                    key={ayah.number}
                    ayah={ayah}
                    surahNumber={surahNumber}
                    showBismillah={false}
                  />
                ))}
              </div>

              {/* Navigation */}
              {allSurahs && (
                <SurahNavigation
                  currentSurah={surahNumber}
                  allSurahs={allSurahs}
                />
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
