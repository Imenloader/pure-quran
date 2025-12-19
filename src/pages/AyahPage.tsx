import { useParams, Navigate, Link } from "react-router-dom";
import { useEffect } from "react";
import { Helmet } from "react-helmet-async";
import { ChevronLeft, ChevronRight, BookOpen, Volume2 } from "lucide-react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { ErrorMessage } from "@/components/ErrorMessage";
import { TafsirTabs } from "@/components/TafsirTabs";
import { AudioPlayer } from "@/components/AudioPlayer";
import { SurahSelector } from "@/components/SurahSelector";
import { AyahSelector } from "@/components/AyahSelector";
import { ReadingProgressBar } from "@/components/ReadingProgressBar";
import { Button } from "@/components/ui/button";
import { useSurah } from "@/hooks/useQuranData";
import { useReadingProgress } from "@/hooks/useReadingProgress";
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
  const { markAsRead, percentage, totalRead, totalAyahs } = useReadingProgress();

  const ayah = surah?.ayahs.find((a) => a.numberInSurah === ayahNumber);
  const isValidAyah = surah && ayahNumber >= 1 && ayahNumber <= surah.numberOfAyahs;

  // Save reading position and mark as read when viewing an ayah
  useEffect(() => {
    if (surah && ayah && isValidAyah) {
      const position = {
        surahNumber,
        surahName: surah.name,
        ayahNumber,
        timestamp: Date.now()
      };
      localStorage.setItem('lastReadPosition', JSON.stringify(position));
      localStorage.setItem('lastVisitedSurah', surahNumber.toString());
      
      // Mark ayah as read for progress tracking
      markAsRead(surahNumber, ayahNumber);
    }
  }, [surah, ayah, surahNumber, ayahNumber, isValidAyah, markAsRead]);

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
          content={surah && ayah ? `تفسير الآية ${ayahNumber} من ${surah.name} - ابن كثير، السعدي، الطبري، القرطبي` : "القرآن الكريم مع التفسير"}
        />
        <link rel="canonical" href={`/surah/${surahNumber}/ayah/${ayahNumber}`} />
      </Helmet>

      <div className="min-h-screen flex flex-col bg-background">
        <Header />

        <main className="flex-1">
          {/* Breadcrumb with Navigation Selectors */}
          <div className="border-b border-border py-3 bg-gradient-to-r from-secondary/50 to-transparent">
            <div className="container">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                {/* Breadcrumb */}
                <nav className="flex items-center gap-2 text-sm text-muted-foreground font-arabic">
                  <Link to="/" className="hover:text-primary transition-colors flex items-center gap-1.5">
                    <BookOpen className="h-3.5 w-3.5" />
                    الرئيسية
                  </Link>
                  <ChevronRight className="h-4 w-4 rotate-180 opacity-40" />
                  {surah && (
                    <>
                      <Link to={`/surah/${getSurahSlug(surah)}`} className="hover:text-primary transition-colors">
                        {surah.name}
                      </Link>
                      <ChevronRight className="h-4 w-4 rotate-180 opacity-40" />
                    </>
                  )}
                  <span className="text-foreground font-semibold">الآية {toArabicNumerals(ayahNumber)}</span>
                </nav>
                
                {/* Navigation Selectors + Reading Progress */}
                {surah && (
                  <div className="flex items-center gap-3">
                    <ReadingProgressBar 
                      percentage={percentage}
                      totalRead={totalRead}
                      totalAyahs={totalAyahs}
                      compact
                      className="hidden sm:flex"
                    />
                    <SurahSelector 
                      currentSurahNumber={surahNumber} 
                      currentSurahName={surah.name}
                    />
                    <AyahSelector 
                      surahNumber={surahNumber}
                      currentAyahNumber={ayahNumber}
                      totalAyahs={surah.numberOfAyahs}
                    />
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="container py-8 md:py-14">
            {isLoading ? (
              <LoadingSpinner message="جاري تحميل الآية..." />
            ) : error ? (
              <ErrorMessage message="فشل تحميل الآية" onRetry={() => refetch()} />
            ) : !isValidAyah || !ayah || !surah ? (
              <Navigate to={`/surah/${surahNumber}`} replace />
            ) : (
              <article className="max-w-4xl mx-auto">
                {/* Page Header */}
                <header className="text-center mb-10 slide-up">
                  <div className="inline-flex items-center gap-3 bg-primary/5 border border-primary/20 rounded-full px-5 py-2 mb-4">
                    <span className="font-amiri text-primary font-bold">{surah.name}</span>
                    <span className="w-1 h-1 rounded-full bg-primary/30" />
                    <span className="text-muted-foreground font-arabic text-sm">
                      الآية {toArabicNumerals(ayahNumber)} من {toArabicNumerals(surah.numberOfAyahs)}
                    </span>
                  </div>
                </header>

                {/* Ayah Display - Premium Card */}
                <div 
                  className="relative bg-gradient-to-br from-card via-card to-emerald-light/20 rounded-2xl border border-border shadow-elevated p-8 md:p-14 mb-8 slide-up overflow-hidden"
                  style={{ animationDelay: "0.1s" }}
                >
                  {/* Decorative corners */}
                  <div className="absolute top-4 right-4 w-8 h-8 border-t-2 border-r-2 border-primary/20 rounded-tr-lg" />
                  <div className="absolute top-4 left-4 w-8 h-8 border-t-2 border-l-2 border-primary/20 rounded-tl-lg" />
                  <div className="absolute bottom-4 right-4 w-8 h-8 border-b-2 border-r-2 border-primary/20 rounded-br-lg" />
                  <div className="absolute bottom-4 left-4 w-8 h-8 border-b-2 border-l-2 border-primary/20 rounded-bl-lg" />
                  
                  <p className="quran-text-large mb-8 relative z-10">
                    {ayah.text}
                  </p>
                  
                  <div className="flex justify-center">
                    <span className="verse-number-circle text-lg">
                      {toArabicNumerals(ayahNumber)}
                    </span>
                  </div>
                </div>

                {/* Audio Player - Enhanced */}
                <div 
                  className="mb-10 slide-up bg-card rounded-xl border border-border shadow-soft overflow-hidden"
                  style={{ animationDelay: "0.15s" }}
                >
                  <div className="flex items-center gap-2 px-4 py-2 bg-secondary/50 border-b border-border">
                    <Volume2 className="h-4 w-4 text-primary" />
                    <span className="text-sm font-arabic text-muted-foreground">الاستماع للآية</span>
                  </div>
                  <div className="p-4">
                    <AudioPlayer 
                      surahNumber={surahNumber} 
                      ayahNumber={ayahNumber}
                      totalAyahs={surah.numberOfAyahs}
                    />
                  </div>
                </div>

                {/* Divider */}
                <div className="divider-ornament max-w-xs mx-auto slide-up" style={{ animationDelay: "0.2s" }}>
                  <span className="text-xl">❖</span>
                </div>

                {/* Navigation */}
                <nav 
                  className="flex items-center justify-between mb-12 slide-up"
                  style={{ animationDelay: "0.25s" }}
                >
                  {getNextLink() ? (
                    <Link to={getNextLink()!}>
                      <Button variant="outline" size="lg" className="gap-2 font-arabic rounded-xl shadow-soft hover:shadow-elevated transition-all">
                        <span>الآية التالية</span>
                        <ChevronLeft className="h-4 w-4" />
                      </Button>
                    </Link>
                  ) : <div />}

                  <Link to={`/surah/${getSurahSlug(surah)}`}>
                    <Button variant="ghost" size="lg" className="text-primary hover:text-primary/80 font-arabic gap-2">
                      <BookOpen className="h-4 w-4" />
                      العودة للسورة
                    </Button>
                  </Link>

                  {getPrevLink() ? (
                    <Link to={getPrevLink()!}>
                      <Button variant="outline" size="lg" className="gap-2 font-arabic rounded-xl shadow-soft hover:shadow-elevated transition-all">
                        <ChevronRight className="h-4 w-4" />
                        <span>الآية السابقة</span>
                      </Button>
                    </Link>
                  ) : <div />}
                </nav>

                {/* Tafsir Section */}
                <section className="slide-up" style={{ animationDelay: "0.3s" }}>
                  <div className="text-center mb-8">
                    <h2 className="font-amiri text-2xl md:text-3xl font-bold text-foreground mb-2">التفسير</h2>
                    <p className="text-muted-foreground font-arabic text-sm">اختر التفسير المناسب لك</p>
                  </div>
                  <TafsirTabs surahNumber={surahNumber} ayahNumber={ayahNumber} />
                </section>
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
