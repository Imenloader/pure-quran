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
import { BookOpen, Star } from "lucide-react";

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
          content="اقرأ القرآن الكريم كاملاً مع تفسير ابن كثير والسعدي والطبري والقرطبي والتفسير الميسر"
        />
        <link rel="canonical" href="/" />
      </Helmet>

      <div className="min-h-screen flex flex-col bg-background">
        <Header />

        <main className="flex-1">
          {/* Hero Section - Enhanced */}
          <div className="relative py-12 md:py-20 border-b border-border overflow-hidden">
            {/* Decorative background */}
            <div className="absolute inset-0 pattern-bg opacity-50" />
            <div className="absolute inset-0 bg-gradient-to-b from-emerald-light/50 via-transparent to-transparent" />
            
            <div className="container relative z-10">
              <div className="max-w-3xl mx-auto text-center slide-up">
                {/* Decorative icon */}
                <div className="inline-flex items-center justify-center w-16 h-16 md:w-20 md:h-20 rounded-2xl bg-gradient-to-br from-primary/20 to-gold/10 mb-6 shadow-soft">
                  <BookOpen className="h-8 w-8 md:h-10 md:w-10 text-primary" />
                </div>
                
                <h2 className="font-amiri text-3xl md:text-5xl font-bold text-foreground mb-4">
                  فهرس سور القرآن الكريم
                </h2>
                <p className="text-muted-foreground mb-8 md:mb-10 font-arabic text-lg">
                  اختر سورة للقراءة والتدبر مع التفسير
                </p>
                
                {/* Search */}
                <div className="max-w-lg mx-auto">
                  <SearchBar
                    value={searchQuery}
                    onChange={setSearchQuery}
                    placeholder="ابحث عن سورة بالاسم أو الرقم..."
                  />
                </div>

                {/* Quick stats */}
                <div className="flex items-center justify-center gap-6 md:gap-10 mt-8 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <Star className="h-4 w-4 text-gold" />
                    <span className="font-arabic">١١٤ سورة</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Star className="h-4 w-4 text-gold" />
                    <span className="font-arabic">٦٢٣٦ آية</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Star className="h-4 w-4 text-gold" />
                    <span className="font-arabic">٥ تفاسير</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="container py-8 md:py-12">
            {isLoading ? (
              <LoadingSpinner message="جاري تحميل السور..." />
            ) : error ? (
              <ErrorMessage
                message="فشل تحميل السور"
                onRetry={() => refetch()}
              />
            ) : filteredSurahs.length === 0 ? (
              <div className="text-center py-16">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
                  <BookOpen className="h-8 w-8 text-muted-foreground" />
                </div>
                <p className="text-muted-foreground font-arabic text-lg">لم يتم العثور على نتائج</p>
                <p className="text-muted-foreground/60 font-arabic text-sm mt-2">جرب البحث باسم آخر</p>
              </div>
            ) : (
              <div className="max-w-4xl mx-auto fade-enter">
                {/* Table Header */}
                <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent border border-border rounded-t-xl overflow-hidden">
                  <div className="flex items-center gap-4 py-4 px-5 text-xs font-arabic font-bold text-foreground/80">
                    <div className="w-12 text-center">الرقم</div>
                    <div className="flex-1">اسم السورة</div>
                    <div className="w-20 text-center">عدد الآيات</div>
                    <div className="hidden sm:block w-16 text-center">النزول</div>
                  </div>
                </div>

                {/* Surah List */}
                <div className="border-x border-b border-border rounded-b-xl bg-card shadow-soft overflow-hidden">
                  {filteredSurahs.map((surah, index) => (
                    <SurahCard key={surah.number} surah={surah} index={index} />
                  ))}
                </div>

                {/* Stats */}
                {searchQuery && (
                  <div className="text-center mt-8 text-sm text-muted-foreground font-arabic">
                    <span className="bg-primary/10 px-4 py-2 rounded-full">
                      عدد النتائج: {toArabicNumerals(filteredSurahs.length)} سورة
                    </span>
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