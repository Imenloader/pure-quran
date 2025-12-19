import { useState, useMemo } from "react";
import { Helmet } from "react-helmet-async";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { SurahCard } from "@/components/SurahCard";
import { SearchBar } from "@/components/SearchBar";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { ErrorMessage } from "@/components/ErrorMessage";
import { useAllSurahs } from "@/hooks/useQuranData";
import { searchSurahs } from "@/lib/quran-api";
import { BookOpen } from "lucide-react";

const Index = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const { data: surahs, isLoading, error, refetch } = useAllSurahs();

  const filteredSurahs = useMemo(() => {
    if (!surahs) return [];
    return searchSurahs(surahs, searchQuery);
  }, [surahs, searchQuery]);

  return (
    <>
      <Helmet>
        <title>القرآن الكريم مع التفسير</title>
        <meta
          name="description"
          content="اقرأ القرآن الكريم كاملاً مع تفسير ابن كثير والسعدي والطبري والقرطبي والجلالين"
        />
        <meta name="keywords" content="القرآن الكريم, تفسير, ابن كثير, السعدي, الطبري, القرطبي, الجلالين" />
        <link rel="canonical" href="/" />
      </Helmet>

      <div className="min-h-screen flex flex-col islamic-pattern">
        <Header />

        <main className="flex-1 container py-8">
          {/* Hero Section */}
          <div className="text-center mb-10 animate-fade-in-up">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-primary to-primary/80 mb-6 shadow-xl shadow-primary/25">
              <BookOpen className="h-10 w-10 text-primary-foreground" />
            </div>
            
            <h2 className="font-arabic text-3xl md:text-4xl font-bold text-foreground surah-name mb-4">
              القرآن الكريم
            </h2>
            
            <p className="text-muted-foreground max-w-md mx-auto font-arabic text-lg">
              اقرأ وتدبر كتاب الله مع التفسير
            </p>

            <div className="flex items-center justify-center gap-3 mt-6">
              <div className="gold-line w-20" />
              <span className="text-accent">✦</span>
              <div className="gold-line w-20" />
            </div>
          </div>

          {/* Search Bar */}
          <div className="max-w-lg mx-auto mb-10 animate-fade-in" style={{ animationDelay: "100ms" }}>
            <SearchBar
              value={searchQuery}
              onChange={setSearchQuery}
              placeholder="ابحث عن سورة..."
            />
          </div>

          {/* Surah Count */}
          {surahs && !searchQuery && (
            <div className="text-center mb-6">
              <p className="text-sm text-muted-foreground font-arabic">
                ١١٤ سورة
              </p>
            </div>
          )}

          {/* Content */}
          {isLoading ? (
            <LoadingSpinner message="جاري تحميل السور..." />
          ) : error ? (
            <ErrorMessage
              message="فشل تحميل السور. يرجى المحاولة مرة أخرى."
              onRetry={() => refetch()}
            />
          ) : filteredSurahs.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground font-arabic text-lg">
                لم يتم العثور على نتائج
              </p>
            </div>
          ) : (
            <div className="grid gap-3 max-w-2xl mx-auto">
              {filteredSurahs.map((surah, index) => (
                <SurahCard key={surah.number} surah={surah} index={index} />
              ))}
            </div>
          )}
        </main>

        <Footer />
      </div>
    </>
  );
};

export default Index;
