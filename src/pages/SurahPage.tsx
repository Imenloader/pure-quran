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
  // Al-Fatiha (1) already includes it as part of the text
  // At-Tawbah (9) doesn't have Bismillah
  const showBismillah = surahNumber !== 1 && surahNumber !== 9;

  return (
    <>
      <Helmet>
        <title>
          {surah
            ? `سورة ${surah.name} | ${surah.englishName} - القرآن الكريم`
            : "القرآن الكريم"}
        </title>
        <meta
          name="description"
          content={
            surah
              ? `Read Surah ${surah.englishName} (${surah.name}) - ${surah.englishNameTranslation}. ${surah.numberOfAyahs} verses, ${surah.revelationType} surah.`
              : "Read the Holy Quran online"
          }
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

              {/* Bismillah for surahs other than Al-Fatiha and At-Tawbah */}
              {showBismillah && (
                <div className="bismillah font-arabic arabic-text mt-8">
                  بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
                </div>
              )}

              {/* Ayahs */}
              <div className="mt-6">
                {surah.ayahs.map((ayah) => (
                  <AyahDisplay
                    key={ayah.number}
                    ayah={ayah}
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
