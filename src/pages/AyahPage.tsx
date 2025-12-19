import { useParams, Navigate, Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { ErrorMessage } from "@/components/ErrorMessage";
import { TafsirTabs } from "@/components/TafsirTabs";
import { Button } from "@/components/ui/button";
import { useSurah } from "@/hooks/useQuranData";
import { toArabicNumerals, getSurahSlug } from "@/lib/quran-api";

const AyahPage = () => {
  const { surahNumber: surahParam, ayahNumber: ayahParam } = useParams<{
    surahNumber: string;
    ayahNumber: string;
  }>();

  const surahNumber = parseInt(surahParam || "1", 10);
  const ayahNumber = parseInt(ayahParam || "1", 10);

  if (isNaN(surahNumber) || surahNumber < 1 || surahNumber > 114) {
    return <Navigate to="/" replace />;
  }

  const { data: surah, isLoading, error, refetch } = useSurah(surahNumber);

  const ayah = surah?.ayahs.find((a) => a.numberInSurah === ayahNumber);
  const isValidAyah = surah && ayahNumber >= 1 && ayahNumber <= surah.numberOfAyahs;

  // Navigation logic
  const hasPrevAyah = ayahNumber > 1;
  const hasNextAyah = surah && ayahNumber < surah.numberOfAyahs;
  const hasPrevSurah = surahNumber > 1;
  const hasNextSurah = surahNumber < 114;

  const getPrevLink = () => {
    if (hasPrevAyah) return `/surah/${surahNumber}/ayah/${ayahNumber - 1}`;
    if (hasPrevSurah) return `/surah/${surahNumber - 1}/ayah/last`;
    return null;
  };

  const getNextLink = () => {
    if (hasNextAyah) return `/surah/${surahNumber}/ayah/${ayahNumber + 1}`;
    if (hasNextSurah) return `/surah/${surahNumber + 1}/ayah/1`;
    return null;
  };

  return (
    <>
      <Helmet>
        <title>
          {surah && ayah ? `الآية ${toArabicNumerals(ayahNumber)} - ${surah.name}` : "القرآن الكريم"}
        </title>
        <meta
          name="description"
          content={surah && ayah ? `تفسير الآية ${ayahNumber} من ${surah.name}` : "القرآن الكريم مع التفسير"}
        />
        <link rel="canonical" href={`/surah/${surahNumber}/ayah/${ayahNumber}`} />
      </Helmet>

      <div className="min-h-screen flex flex-col bg-background">
        <Header />

        <main className="flex-1 container py-8">
          {isLoading ? (
            <LoadingSpinner message="جاري تحميل الآية..." />
          ) : error ? (
            <ErrorMessage message="فشل تحميل الآية" onRetry={() => refetch()} />
          ) : !isValidAyah || !ayah || !surah ? (
            <Navigate to={`/surah/${getSurahSlug({ number: surahNumber, name: "", englishName: `surah-${surahNumber}`, englishNameTranslation: "", numberOfAyahs: 0, revelationType: "Meccan" })}`} replace />
          ) : (
            <article className="max-w-3xl mx-auto">
              {/* Breadcrumb */}
              <Link
                to={`/surah/${getSurahSlug(surah)}`}
                className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8 fade-enter"
              >
                <ChevronRight className="h-4 w-4" />
                <span className="font-arabic">العودة إلى {surah.name}</span>
              </Link>

              {/* Surah & Ayah Info */}
              <header className="text-center mb-10 fade-enter" style={{ animationDelay: "0.1s" }}>
                <h1 className="font-arabic text-2xl md:text-3xl font-bold text-foreground surah-title mb-2">
                  {surah.name}
                </h1>
                <p className="text-muted-foreground">
                  الآية {toArabicNumerals(ayahNumber)} من {toArabicNumerals(surah.numberOfAyahs)}
                </p>
                <div className="divider-ornament mt-6">
                  <span>✦</span>
                </div>
              </header>

              {/* Ayah Display - Large and Prominent */}
              <div className="bg-card rounded-lg border border-border/60 p-8 md:p-12 mb-8 fade-enter" style={{ animationDelay: "0.15s" }}>
                <p className="quran-text text-center">
                  {ayah.text}
                  <span className="verse-end-mark">{toArabicNumerals(ayahNumber)}</span>
                </p>
              </div>

              {/* Ayah Navigation */}
              <nav className="flex items-center justify-between mb-12 fade-enter" style={{ animationDelay: "0.2s" }}>
                {getNextLink() ? (
                  <Link to={getNextLink()!}>
                    <Button variant="ghost" size="sm" className="gap-2 font-arabic text-muted-foreground hover:text-foreground">
                      <span>التالية</span>
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                  </Link>
                ) : <div />}

                {getPrevLink() ? (
                  <Link to={getPrevLink()!}>
                    <Button variant="ghost" size="sm" className="gap-2 font-arabic text-muted-foreground hover:text-foreground">
                      <ChevronRight className="h-4 w-4" />
                      <span>السابقة</span>
                    </Button>
                  </Link>
                ) : <div />}
              </nav>

              {/* Tafsir Section */}
              <TafsirTabs surahNumber={surahNumber} ayahNumber={ayahNumber} />
            </article>
          )}
        </main>

        <Footer />
      </div>
    </>
  );
};

export default AyahPage;
