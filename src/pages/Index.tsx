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
        <link rel="canonical" href="/" />
      </Helmet>

      <div className="min-h-screen flex flex-col bg-background">
        <Header />

        <main className="flex-1 container py-8">
          {/* Hero */}
          <div className="text-center mb-12 fade-enter">
            <h2 className="font-arabic text-3xl md:text-4xl font-bold text-foreground surah-title mb-3">
              فهرس السور
            </h2>
            <p className="text-muted-foreground">
              ١١٤ سورة · اضغط على أي سورة للقراءة
            </p>
            <div className="divider-ornament mt-6">
              <span>✦</span>
            </div>
          </div>

          {/* Search */}
          <div className="max-w-md mx-auto mb-10 fade-enter" style={{ animationDelay: "0.1s" }}>
            <SearchBar
              value={searchQuery}
              onChange={setSearchQuery}
              placeholder="ابحث عن سورة..."
            />
          </div>

          {/* Content */}
          {isLoading ? (
            <LoadingSpinner message="جاري تحميل السور..." />
          ) : error ? (
            <ErrorMessage
              message="فشل تحميل السور"
              onRetry={() => refetch()}
            />
          ) : filteredSurahs.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-muted-foreground font-arabic text-lg">
                لم يتم العثور على نتائج
              </p>
            </div>
          ) : (
            <div className="grid gap-2 max-w-2xl mx-auto stagger-children">
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
