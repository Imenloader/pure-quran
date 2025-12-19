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
        <title>القرآن الكريم | The Noble Quran</title>
        <meta
          name="description"
          content="Read the Holy Quran online in Arabic Uthmani script. Browse all 114 Surahs with clean, distraction-free reading experience."
        />
        <meta name="keywords" content="Quran, القرآن, Islam, Arabic, Surah, Ayah, Muslim" />
        <link rel="canonical" href="/" />
      </Helmet>

      <div className="min-h-screen flex flex-col islamic-pattern">
        <Header />

        <main className="flex-1 container py-8">
          {/* Hero Section */}
          <div className="text-center mb-10 animate-fade-in-up">
            <h2 className="font-arabic text-3xl md:text-4xl font-bold text-foreground surah-name mb-3">
              فهرس السور
            </h2>
            <p className="text-muted-foreground max-w-md mx-auto">
              Browse all 114 Surahs of the Holy Quran in beautiful Arabic Uthmani script
            </p>
          </div>

          {/* Search Bar */}
          <div className="max-w-md mx-auto mb-8 animate-fade-in" style={{ animationDelay: "100ms" }}>
            <SearchBar
              value={searchQuery}
              onChange={setSearchQuery}
              placeholder="ابحث بالاسم أو الرقم..."
            />
          </div>

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
                لم يتم العثور على نتائج لـ "{searchQuery}"
              </p>
            </div>
          ) : (
            <div className="grid gap-3 md:gap-4">
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
