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
          <div className="bg-secondary py-6 border-b border-border">
            <div className="container">
              <div className="max-w-3xl mx-auto">
                <h2 className="font-arabic text-2xl font-bold text-foreground text-center mb-2">
                  فهرس سور القرآن الكريم
                </h2>
                <p className="text-center text-muted-foreground text-sm mb-4">
                  اختر سورة للقراءة والتفسير
                </p>
                
                {/* Search */}
                <div className="max-w-md mx-auto">
                  <SearchBar
                    value={searchQuery}
                    onChange={setSearchQuery}
                    placeholder="ابحث عن سورة بالاسم أو الرقم..."
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="container py-6">
            {isLoading ? (
              <LoadingSpinner message="جاري تحميل السور..." />
            ) : error ? (
              <ErrorMessage
                message="فشل تحميل السور"
                onRetry={() => refetch()}
              />
            ) : filteredSurahs.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground">لم يتم العثور على نتائج</p>
              </div>
            ) : (
              <div className="max-w-4xl mx-auto">
                {/* Table Header */}
                <div className="bg-table-header border border-table-border rounded-t-md">
                  <div className="flex items-center gap-4 py-2.5 px-4 text-sm font-semibold text-muted-foreground">
                    <div className="w-8 text-center">#</div>
                    <div className="flex-1">اسم السورة</div>
                    <div>عدد الآيات</div>
                    <div className="hidden sm:block w-12">النوع</div>
                  </div>
                </div>

                {/* Surah List */}
                <div className="border-x border-b border-table-border rounded-b-md bg-card">
                  {filteredSurahs.map((surah, index) => (
                    <SurahCard key={surah.number} surah={surah} index={index} />
                  ))}
                </div>

                {/* Stats */}
                <div className="text-center mt-6 text-sm text-muted-foreground">
                  إجمالي السور: {toArabicNumerals(filteredSurahs.length)} من ١١٤
                </div>
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