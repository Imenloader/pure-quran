import { useState, useMemo, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { SearchBar } from "@/components/SearchBar";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { ErrorMessage } from "@/components/ErrorMessage";
import { useAllSurahs } from "@/hooks/useQuranData";
import { searchSurahs, toArabicNumerals, Surah } from "@/lib/quran-api";
import { cn } from "@/lib/utils";

const Index = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const { data: surahs, isLoading, error, refetch } = useAllSurahs();
  const location = useLocation();
  
  // Get the last visited surah from localStorage
  const [lastVisitedSurah, setLastVisitedSurah] = useState<number | null>(null);
  
  useEffect(() => {
    const saved = localStorage.getItem('lastVisitedSurah');
    if (saved) {
      setLastVisitedSurah(parseInt(saved, 10));
    }
  }, []);

  const filteredSurahs = useMemo(() => {
    if (!surahs) return [];
    return searchSurahs(surahs, searchQuery);
  }, [surahs, searchQuery]);

  return (
    <>
      <Helmet>
        <title>القرآن الكريم - فهرس السور مع التفسير</title>
        <meta
          name="description"
          content="اقرأ القرآن الكريم كاملاً مع تفسير ابن كثير والسعدي والطبري والقرطبي والتفسير الميسر"
        />
        <link rel="canonical" href="/" />
      </Helmet>

      <div className="min-h-screen flex flex-col bg-background">
        <Header />

        <main className="flex-1">
          {/* Hero Section - Compact */}
          <div className="py-6 md:py-8 border-b border-border bg-gradient-to-b from-primary/5 to-transparent">
            <div className="container">
              <div className="max-w-2xl mx-auto text-center">
                <h1 className="font-amiri text-2xl md:text-3xl font-bold text-foreground mb-3">
                  فهرس سور القرآن الكريم
                </h1>
                <p className="text-muted-foreground mb-4 font-arabic text-sm md:text-base">
                  اختر سورة للقراءة والتدبر مع التفسير
                </p>
                
                {/* Search */}
                <div className="max-w-md mx-auto">
                  <SearchBar
                    value={searchQuery}
                    onChange={setSearchQuery}
                    placeholder="ابحث عن سورة..."
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Surah Grid */}
          <div className="container py-6 md:py-8">
            {isLoading ? (
              <LoadingSpinner message="جاري تحميل السور..." />
            ) : error ? (
              <ErrorMessage
                message="فشل تحميل السور"
                onRetry={() => refetch()}
              />
            ) : filteredSurahs.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground font-arabic">لم يتم العثور على نتائج</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 md:gap-3 max-w-4xl mx-auto">
                {filteredSurahs.map((surah) => (
                  <SurahGridItem 
                    key={surah.number} 
                    surah={surah} 
                    isActive={surah.number === lastVisitedSurah}
                  />
                ))}
              </div>
            )}
            
            {/* Stats */}
            {searchQuery && filteredSurahs.length > 0 && (
              <div className="text-center mt-6 text-sm text-muted-foreground font-arabic">
                عدد النتائج: {toArabicNumerals(filteredSurahs.length)} سورة
              </div>
            )}
          </div>
        </main>

        <Footer />
      </div>
    </>
  );
};

// Surah Grid Item Component
interface SurahGridItemProps {
  surah: Surah;
  isActive?: boolean;
}

function SurahGridItem({ surah, isActive }: SurahGridItemProps) {
  const handleClick = () => {
    localStorage.setItem('lastVisitedSurah', surah.number.toString());
  };

  return (
    <Link
      to={`/surah/${surah.number}`}
      onClick={handleClick}
      className={cn(
        "block text-center py-3 px-2 rounded-lg",
        "bg-card border-2",
        "transition-all duration-200",
        "font-arabic text-sm md:text-base",
        "focus:outline-none focus:ring-2 focus:ring-primary/20",
        isActive 
          ? "border-amber-500 bg-amber-50 dark:bg-amber-950/20 text-amber-700 dark:text-amber-400 font-semibold shadow-md" 
          : "border-border hover:border-primary hover:bg-primary/5"
      )}
    >
      {surah.name}
    </Link>
  );
}

export default Index;
