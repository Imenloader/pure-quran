import { useState, useMemo } from "react";
import { Helmet } from "react-helmet-async";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { SurahCard } from "@/components/SurahCard";
import { SearchBar } from "@/components/SearchBar";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { ErrorMessage } from "@/components/ErrorMessage";
import { useAllSurahs } from "@/hooks/useQuranData";
import { searchSurahs, toArabicNumerals } from "@/lib/quran-api";

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
        <title>القرآن الكريم - فهرس السور مع التفسير</title>
        <meta
          name="description"
          content="اقرأ القرآن الكريم كاملاً مع تفسير ابن كثير والسعدي والطبري والقرطبي والجلالين"
        />
        <link rel="canonical" href="/" />
      </Helmet>

      <div className="min-h-screen flex flex-col bg-background">
        <Header />

        <main className="flex-1">
          {/* Hero Section */}
          <div className="py-10 md:py-14 border-b border-border">
            <div className="container">
              <div className="max-w-3xl mx-auto text-center">
                <h2 className="font-amiri text-3xl md:text-4xl font-bold text-foreground mb-3">
                  فهرس سور القرآن الكريم
                </h2>
                <p className="text-muted-foreground mb-8 font-arabic">
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

          {/* Content */}
          <div className="container py-8">
            {isLoading ? (
              <LoadingSpinner message="جاري تحميل السور..." />
            ) : error ? (
              <ErrorMessage
                message="فشل تحميل السور"
                onRetry={() => refetch()}
              />
            ) : filteredSurahs.length === 0 ? (
              <div className="text-center py-16">
                <p className="text-muted-foreground font-arabic">لم يتم العثور على نتائج</p>
              </div>
            ) : (
              <div className="max-w-3xl mx-auto">
                {/* Table Header */}
                <div className="bg-secondary border border-border rounded-t-lg">
                  <div className="flex items-center gap-4 py-3 px-4 text-xs font-arabic font-semibold text-muted-foreground">
                    <div className="w-10 text-center">الرقم</div>
                    <div className="flex-1">السورة</div>
                    <div>الآيات</div>
                    <div className="hidden sm:block w-12 text-center">النوع</div>
                  </div>
                </div>

                {/* Surah List */}
                <div className="border-x border-b border-border rounded-b-lg bg-card">
                  {filteredSurahs.map((surah, index) => (
                    <SurahCard key={surah.number} surah={surah} index={index} />
                  ))}
                </div>

                {/* Stats */}
                {searchQuery && (
                  <div className="text-center mt-6 text-sm text-muted-foreground font-arabic">
                    عدد النتائج: {toArabicNumerals(filteredSurahs.length)}
                  </div>
                )}
              </div>
            )}
          </div>
        </main>

        <Footer />
      </div>
    </>
  );
};

export default Index;
