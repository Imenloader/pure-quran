import { useParams, Navigate, Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { ChevronLeft, ChevronRight, ArrowRight } from "lucide-react";
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

  // Validate params
  if (isNaN(surahNumber) || surahNumber < 1 || surahNumber > 114) {
    return <Navigate to="/" replace />;
  }

  const { data: surah, isLoading, error, refetch } = useSurah(surahNumber);

  // Validate ayah number after we have surah data
  const ayah = surah?.ayahs.find((a) => a.numberInSurah === ayahNumber);
  const isValidAyah = surah && ayahNumber >= 1 && ayahNumber <= surah.numberOfAyahs;

  // Navigation
  const hasPrevAyah = ayahNumber > 1;
  const hasNextAyah = surah && ayahNumber < surah.numberOfAyahs;
  const hasPrevSurah = surahNumber > 1;
  const hasNextSurah = surahNumber < 114;

  const getPrevLink = () => {
    if (hasPrevAyah) {
      return `/surah/${surahNumber}/ayah/${ayahNumber - 1}`;
    }
    if (hasPrevSurah) {
      return `/surah/${surahNumber - 1}/ayah/last`;
    }
    return null;
  };

  const getNextLink = () => {
    if (hasNextAyah) {
      return `/surah/${surahNumber}/ayah/${ayahNumber + 1}`;
    }
    if (hasNextSurah) {
      return `/surah/${surahNumber + 1}/ayah/1`;
    }
    return null;
  };

  return (
    <>
      <Helmet>
        <title>
          {surah && ayah
            ? `الآية ${toArabicNumerals(ayahNumber)} - سورة ${surah.name} | القرآن الكريم`
            : "القرآن الكريم"}
        </title>
        <meta
          name="description"
          content={
            surah && ayah
              ? `قراءة وتفسير الآية ${ayahNumber} من سورة ${surah.englishName} (${surah.name})`
              : "Read the Holy Quran with Tafsir"
          }
        />
        <link rel="canonical" href={`/surah/${surahNumber}/ayah/${ayahNumber}`} />
      </Helmet>

      <div className="min-h-screen flex flex-col">
        <Header />

        <main className="flex-1 container py-6">
          {isLoading ? (
            <LoadingSpinner message="جاري تحميل الآية..." />
          ) : error ? (
            <ErrorMessage
              message="فشل تحميل الآية. يرجى المحاولة مرة أخرى."
              onRetry={() => refetch()}
            />
          ) : !isValidAyah || !ayah || !surah ? (
            <Navigate to={`/surah/${getSurahSlug({ number: surahNumber, name: "", englishName: `surah-${surahNumber}`, englishNameTranslation: "", numberOfAyahs: 0, revelationType: "Meccan" })}`} replace />
          ) : (
            <article className="max-w-4xl mx-auto">
              {/* Breadcrumb / Back Navigation */}
              <div className="mb-6">
                <Link
                  to={`/surah/${getSurahSlug(surah)}`}
                  className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  <ArrowRight className="h-4 w-4" />
                  <span className="font-arabic">العودة إلى سورة {surah.name}</span>
                </Link>
              </div>

              {/* Surah & Ayah Info */}
              <div className="text-center mb-6">
                <p className="text-sm text-muted-foreground mb-1">
                  {surah.englishName} • {surah.englishNameTranslation}
                </p>
                <h1 className="font-arabic text-2xl md:text-3xl font-bold text-primary surah-name">
                  سورة {surah.name}
                </h1>
                <p className="text-muted-foreground font-arabic mt-1">
                  الآية {toArabicNumerals(ayahNumber)} من {toArabicNumerals(surah.numberOfAyahs)}
                </p>
              </div>

              {/* Ayah Display - Large & Prominent */}
              <div className="bg-card rounded-xl p-6 md:p-10 mb-8 border border-border shadow-sm">
                <p className="font-arabic arabic-text ayah-text text-center leading-loose">
                  {ayah.text}
                  <span className="ayah-number mx-2 inline-flex items-center justify-center">
                    {toArabicNumerals(ayahNumber)}
                  </span>
                </p>
              </div>

              {/* Ayah Navigation */}
              <div className="flex items-center justify-between mb-8">
                {getPrevLink() ? (
                  <Link to={getPrevLink()!}>
                    <Button variant="outline" size="sm" className="gap-2">
                      <ChevronRight className="h-4 w-4" />
                      <span className="font-arabic">السابقة</span>
                    </Button>
                  </Link>
                ) : (
                  <div />
                )}

                {getNextLink() ? (
                  <Link to={getNextLink()!}>
                    <Button variant="outline" size="sm" className="gap-2">
                      <span className="font-arabic">التالية</span>
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                  </Link>
                ) : (
                  <div />
                )}
              </div>

              {/* Tafsir Section */}
              <section className="mt-8">
                <h2 className="font-arabic text-xl font-bold mb-4 text-right">التفسير</h2>
                <TafsirTabs surahNumber={surahNumber} ayahNumber={ayahNumber} />
              </section>
            </article>
          )}
        </main>

        <Footer />
      </div>
    </>
  );
};

export default AyahPage;
