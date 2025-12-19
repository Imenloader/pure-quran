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
          {surah && ayah ? `تفسير الآية ${toArabicNumerals(ayahNumber)} - ${surah.name}` : "القرآن الكريم"}
        </title>
        <meta
          name="description"
          content={surah && ayah ? `تفسير الآية ${ayahNumber} من ${surah.name} - ابن كثير، السعدي، الطبري، القرطبي، الجلالين` : "القرآن الكريم مع التفسير"}
        />
        <link rel="canonical" href={`/surah/${surahNumber}/ayah/${ayahNumber}`} />
      </Helmet>

      <div className="min-h-screen flex flex-col bg-background">
        <Header />

        <main className="flex-1">
          {/* Breadcrumb */}
          <div className="bg-secondary border-b border-border py-3">
            <div className="container">
              <nav className="flex items-center gap-2 text-sm text-muted-foreground">
                <Link to="/" className="text-link hover:underline">الرئيسية</Link>
                <ChevronRight className="h-4 w-4 rotate-180" />
                {surah && (
                  <>
                    <Link to={`/surah/${getSurahSlug(surah)}`} className="text-link hover:underline">
                      {surah.name}
                    </Link>
                    <ChevronRight className="h-4 w-4 rotate-180" />
                  </>
                )}
                <span className="text-foreground">تفسير الآية {toArabicNumerals(ayahNumber)}</span>
              </nav>
            </div>
          </div>

          <div className="container py-6">
            {isLoading ? (
              <LoadingSpinner message="جاري تحميل الآية..." />
            ) : error ? (
              <ErrorMessage message="فشل تحميل الآية" onRetry={() => refetch()} />
            ) : !isValidAyah || !ayah || !surah ? (
              <Navigate to={`/surah/${getSurahSlug({ number: surahNumber, name: "", englishName: `surah-${surahNumber}`, englishNameTranslation: "", numberOfAyahs: 0, revelationType: "Meccan" })}`} replace />
            ) : (
              <article className="max-w-4xl mx-auto">
                {/* Page Title */}
                <header className="text-center mb-6 fade-enter">
                  <h1 className="font-arabic text-xl font-bold text-foreground mb-2">
                    تفسير {surah.name}
                  </h1>
                  <p className="text-muted-foreground text-sm">
                    الآية {toArabicNumerals(ayahNumber)} من {toArabicNumerals(surah.numberOfAyahs)}
                  </p>
                </header>

                {/* Ayah Display - Decorative Frame */}
                <div className="bg-card rounded-lg border-2 border-primary/30 p-6 md:p-8 mb-6 fade-enter relative" style={{ animationDelay: "0.1s" }}>
                  {/* Decorative corners */}
                  <div className="absolute top-2 right-2 w-4 h-4 border-t-2 border-r-2 border-primary/40" />
                  <div className="absolute top-2 left-2 w-4 h-4 border-t-2 border-l-2 border-primary/40" />
                  <div className="absolute bottom-2 right-2 w-4 h-4 border-b-2 border-r-2 border-primary/40" />
                  <div className="absolute bottom-2 left-2 w-4 h-4 border-b-2 border-l-2 border-primary/40" />
                  
                  <p className="quran-text text-center text-2xl md:text-3xl leading-loose">
                    {ayah.text}
                    <span className="verse-number">{toArabicNumerals(ayahNumber)}</span>
                  </p>
                </div>

                {/* Ayah Navigation */}
                <nav className="flex items-center justify-between mb-8 fade-enter" style={{ animationDelay: "0.15s" }}>
                  {getNextLink() ? (
                    <Link to={getNextLink()!}>
                      <Button variant="outline" size="sm" className="gap-2">
                        <span>الآية التالية</span>
                        <ChevronLeft className="h-4 w-4" />
                      </Button>
                    </Link>
                  ) : <div />}

                  <Link to={`/surah/${getSurahSlug(surah)}`}>
                    <Button variant="ghost" size="sm" className="text-link">
                      العودة للسورة
                    </Button>
                  </Link>

                  {getPrevLink() ? (
                    <Link to={getPrevLink()!}>
                      <Button variant="outline" size="sm" className="gap-2">
                        <ChevronRight className="h-4 w-4" />
                        <span>الآية السابقة</span>
                      </Button>
                    </Link>
                  ) : <div />}
                </nav>

                {/* Tafsir Section - All tafsirs displayed vertically */}
                <TafsirTabs surahNumber={surahNumber} ayahNumber={ayahNumber} />
              </article>
            )}
          </div>
        </main>

        <Footer />
      </div>
    </>
  );
};

export default AyahPage;