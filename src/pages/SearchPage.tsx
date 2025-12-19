import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { Search, BookOpen, ArrowLeft, FileText, X, Loader2, Sparkles, ChevronDown } from "lucide-react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useQuranSearch } from "@/hooks/useQuranSearch";
import { toArabicNumerals } from "@/lib/quran-api";
import { cn } from "@/lib/utils";

const SearchPage = () => {
  const [selectedSurah, setSelectedSurah] = useState<string>("all");
  const inputRef = useRef<HTMLInputElement>(null);
  
  const {
    query,
    search,
    clearSearch,
    results,
    suggestions,
    isSearching,
    isLoadingQuran,
    surahList,
    totalResults,
    hasSearched,
    dataReady,
  } = useQuranSearch({
    surahNumber: selectedSurah !== "all" ? parseInt(selectedSurah) : undefined,
    limit: 200,
  });

  // Focus input on mount
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const selectedSurahData = selectedSurah !== "all" && surahList
    ? surahList.find(s => s.number === parseInt(selectedSurah))
    : null;

  const handleSuggestionClick = (suggestion: string) => {
    search(suggestion);
  };

  return (
    <>
      <Helmet>
        <title>البحث الذكي في القرآن الكريم | تفسير</title>
        <meta name="description" content="ابحث في آيات القرآن الكريم بذكاء - يدعم البحث بدون تشكيل وتصحيح الأخطاء" />
      </Helmet>

      <div className="min-h-screen flex flex-col bg-background">
        <Header />

        <main className="flex-1">
          {/* Search Header */}
          <div className="py-10 md:py-12 border-b border-border bg-gradient-to-b from-primary/5 to-transparent">
            <div className="container">
              <div className="max-w-2xl mx-auto text-center">
                <div className="inline-flex items-center justify-center w-14 h-14 md:w-16 md:h-16 rounded-full bg-primary/10 mb-4 md:mb-6">
                  <Search className="h-7 w-7 md:h-8 md:w-8 text-primary" />
                </div>
                <h1 className="font-amiri text-2xl md:text-4xl font-bold mb-2 md:mb-3 text-foreground">
                  البحث الذكي في القرآن الكريم
                </h1>
                <p className="text-muted-foreground font-arabic text-sm md:text-base mb-6 md:mb-8">
                  ابحث في جميع آيات القرآن أو في سورة محددة
                </p>
                
                {/* Surah Filter */}
                <div className="mb-4">
                  <Select
                    value={selectedSurah}
                    onValueChange={(value) => {
                      setSelectedSurah(value);
                    }}
                  >
                    <SelectTrigger className="w-full h-11 md:h-12 font-arabic text-sm md:text-base bg-card border-border">
                      <SelectValue placeholder="البحث في جميع السور" />
                    </SelectTrigger>
                    <SelectContent className="max-h-80 bg-card border-border">
                      <SelectItem 
                        value="all"
                        className="font-arabic text-sm md:text-base py-3"
                      >
                        <span className="flex items-center gap-3">
                          <Sparkles className="h-4 w-4 text-primary" />
                          <span>البحث في جميع السور (١١٤ سورة)</span>
                        </span>
                      </SelectItem>
                      {surahList?.map(s => (
                        <SelectItem 
                          key={s.number} 
                          value={s.number.toString()}
                          className="font-arabic text-sm md:text-base py-3"
                        >
                          <span className="flex items-center gap-3">
                            <span className="text-primary font-semibold w-8">{toArabicNumerals(s.number)}</span>
                            <span>{s.name}</span>
                          </span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Search Input */}
                <div className="relative">
                  <div className="relative">
                    <Search className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground pointer-events-none" />
                    <Input
                      ref={inputRef}
                      type="text"
                      value={query}
                      onChange={(e) => search(e.target.value)}
                      placeholder={selectedSurahData ? `ابحث في ${selectedSurahData.name}...` : "ابحث في القرآن الكريم..."}
                      className="pr-12 pl-12 h-12 md:h-14 font-arabic text-base md:text-lg bg-card border-border focus:border-primary focus:ring-2 focus:ring-primary/20"
                      dir="rtl"
                    />
                    {query && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={clearSearch}
                        className="absolute left-2 top-1/2 -translate-y-1/2 h-8 w-8 text-muted-foreground hover:text-foreground"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>

                  {/* Loading indicator */}
                  {(isSearching || isLoadingQuran) && (
                    <div className="absolute left-14 top-1/2 -translate-y-1/2">
                      <Loader2 className="h-5 w-5 animate-spin text-primary" />
                    </div>
                  )}
                </div>

                {/* Suggestions */}
                {suggestions.length > 0 && (
                  <div className="mt-3 flex items-center justify-center gap-2 flex-wrap">
                    <span className="text-sm text-muted-foreground font-arabic">هل تقصد:</span>
                    {suggestions.map((suggestion, index) => (
                      <button
                        key={index}
                        onClick={() => handleSuggestionClick(suggestion)}
                        className="px-3 py-1 rounded-full bg-secondary text-sm font-arabic hover:bg-primary hover:text-primary-foreground transition-colors"
                      >
                        {suggestion}
                      </button>
                    ))}
                  </div>
                )}

                {/* Selected Surah Info */}
                {selectedSurahData && (
                  <div className="mt-4 p-3 rounded-lg bg-card border border-border">
                    <p className="text-sm text-muted-foreground font-arabic">
                      البحث في: <span className="text-primary font-semibold">{selectedSurahData.name}</span>
                      <span className="mx-2">·</span>
                      عدد الآيات: <span className="text-foreground">{toArabicNumerals(selectedSurahData.numberOfAyahs)}</span>
                    </p>
                  </div>
                )}

                {/* Loading Quran Data */}
                {isLoadingQuran && (
                  <div className="mt-4 p-3 rounded-lg bg-primary/5 border border-primary/20">
                    <p className="text-sm text-primary font-arabic flex items-center justify-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      جاري تحميل بيانات القرآن الكريم...
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Results Section */}
          <div className="container py-6 md:py-8">
            <div className="max-w-3xl mx-auto">
              {/* Results */}
              {hasSearched && results.length > 0 && (
                <div>
                  <div className="flex items-center justify-between mb-4 md:mb-6">
                    <h2 className="font-amiri font-bold text-lg md:text-xl text-foreground">
                      نتائج البحث
                    </h2>
                    <span className="bg-primary/10 text-primary px-3 md:px-4 py-1 md:py-1.5 rounded-full text-sm font-arabic">
                      {toArabicNumerals(totalResults)} نتيجة
                    </span>
                  </div>
                  
                  <div className="space-y-3 md:space-y-4">
                    {results.map((result) => (
                      <div 
                        key={`${result.surahNumber}-${result.ayahNumber}`}
                        className="group border border-border rounded-xl bg-card overflow-hidden hover:border-primary/30 hover:shadow-lg transition-all duration-300"
                      >
                        {/* Result Header */}
                        <div className="flex items-center justify-between px-4 md:px-5 py-2.5 md:py-3 bg-secondary/30 border-b border-border">
                          <div className="flex items-center gap-2 md:gap-3">
                            <div className="flex items-center justify-center w-8 h-8 md:w-10 md:h-10 rounded-lg bg-primary/10 text-primary font-arabic font-bold text-sm md:text-base">
                              {toArabicNumerals(result.ayahNumber)}
                            </div>
                            <div className="flex flex-col md:flex-row md:items-center md:gap-2">
                              <span className="font-amiri font-semibold text-foreground text-sm md:text-base">{result.surahName}</span>
                              <span className="text-muted-foreground text-xs md:text-sm font-arabic">
                                <span className="hidden md:inline mx-1">·</span>
                                الآية {toArabicNumerals(result.ayahNumber)}
                              </span>
                            </div>
                          </div>
                          {/* Match type badge */}
                          <span className={cn(
                            "px-2 py-0.5 rounded text-xs font-arabic hidden md:inline-block",
                            result.matchType === 'exact' && "bg-green-500/10 text-green-600",
                            result.matchType === 'phrase' && "bg-blue-500/10 text-blue-600",
                            result.matchType === 'word' && "bg-yellow-500/10 text-yellow-600",
                            result.matchType === 'partial' && "bg-orange-500/10 text-orange-600",
                            result.matchType === 'fuzzy' && "bg-purple-500/10 text-purple-600",
                          )}>
                            {result.matchType === 'exact' && 'تطابق تام'}
                            {result.matchType === 'phrase' && 'تطابق عبارة'}
                            {result.matchType === 'word' && 'تطابق كلمة'}
                            {result.matchType === 'partial' && 'تطابق جزئي'}
                            {result.matchType === 'fuzzy' && 'تطابق تقريبي'}
                          </span>
                        </div>
                        
                        {/* Ayah Text */}
                        <div className="p-4 md:p-5">
                          <p 
                            className="font-quran text-lg md:text-xl leading-loose text-foreground"
                            dangerouslySetInnerHTML={{ __html: result.highlightedText }}
                          />
                        </div>
                        
                        {/* Action Buttons */}
                        <div className="flex items-center gap-2 md:gap-3 px-4 md:px-5 py-2.5 md:py-3 bg-secondary/20 border-t border-border">
                          <Link
                            to={`/surah/${result.surahNumber}/ayah/${result.ayahNumber}`}
                            className="flex items-center gap-1.5 md:gap-2 px-3 md:px-4 py-1.5 md:py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors font-arabic text-xs md:text-sm"
                          >
                            <FileText className="h-3.5 w-3.5 md:h-4 md:w-4" />
                            <span>صفحة الآية والتفسير</span>
                          </Link>
                          <Link
                            to={`/surah/${result.surahNumber}#ayah-${result.ayahNumber}`}
                            className="flex items-center gap-1.5 md:gap-2 px-3 md:px-4 py-1.5 md:py-2 rounded-lg bg-secondary text-foreground hover:bg-secondary/80 transition-colors font-arabic text-xs md:text-sm"
                          >
                            <BookOpen className="h-3.5 w-3.5 md:h-4 md:w-4" />
                            <span>موضعها في السورة</span>
                            <ArrowLeft className="h-2.5 w-2.5 md:h-3 md:w-3" />
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* No Results Message */}
              {hasSearched && results.length === 0 && !isSearching && (
                <div className="text-center py-12 md:py-16">
                  <div className="inline-flex items-center justify-center w-16 h-16 md:w-20 md:h-20 rounded-full bg-secondary mb-4 md:mb-6">
                    <Search className="h-8 w-8 md:h-10 md:w-10 text-muted-foreground" />
                  </div>
                  <h3 className="font-amiri text-lg md:text-xl font-bold text-foreground mb-2">
                    لا توجد نتائج
                  </h3>
                  <p className="text-muted-foreground font-arabic text-sm md:text-base max-w-md mx-auto">
                    لا توجد آيات مطابقة لـ "<span className="text-primary">{query}</span>"
                    {selectedSurahData && (
                      <> داخل {selectedSurahData.name}</>
                    )}
                  </p>
                  <div className="mt-4 text-sm text-muted-foreground font-arabic space-y-1">
                    <p>جرب:</p>
                    <ul className="list-disc list-inside text-right max-w-xs mx-auto">
                      <li>استخدام كلمات أقل</li>
                      <li>البحث بدون التشكيل</li>
                      <li>البحث في جميع السور</li>
                    </ul>
                  </div>
                </div>
              )}

              {/* Initial State */}
              {!hasSearched && !isLoadingQuran && (
                <div className="text-center py-12 md:py-16">
                  <div className="inline-flex items-center justify-center w-16 h-16 md:w-20 md:h-20 rounded-full bg-primary/10 mb-4 md:mb-6">
                    <Sparkles className="h-8 w-8 md:h-10 md:w-10 text-primary" />
                  </div>
                  <h3 className="font-amiri text-lg md:text-xl font-bold text-foreground mb-2">
                    البحث الذكي في القرآن
                  </h3>
                  <div className="text-muted-foreground font-arabic text-sm md:text-base max-w-md mx-auto space-y-3">
                    <p>اكتب كلمة أو جزء من آية للبحث</p>
                    <div className="text-right bg-card border border-border rounded-lg p-4 mt-4">
                      <p className="font-semibold mb-2 text-foreground">مميزات البحث:</p>
                      <ul className="space-y-1.5 text-sm">
                        <li className="flex items-center gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-primary"></span>
                          يدعم البحث بدون تشكيل
                        </li>
                        <li className="flex items-center gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-primary"></span>
                          يتعرف على حروف الألف المختلفة (أ، إ، آ، ا)
                        </li>
                        <li className="flex items-center gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-primary"></span>
                          يدعم البحث بـ "ال" أو بدونها
                        </li>
                        <li className="flex items-center gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-primary"></span>
                          يعرض اقتراحات تصحيحية
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </main>

        <Footer />
      </div>
    </>
  );
};

export default SearchPage;
