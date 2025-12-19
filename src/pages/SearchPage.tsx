import { useState, useMemo, useEffect } from "react";
import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { Search, BookOpen, ArrowLeft, FileText } from "lucide-react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAllSurahs, useSurah } from "@/hooks/useQuranData";
import { toArabicNumerals, getSurahSlug, Surah } from "@/lib/quran-api";

interface SearchResult {
  surahNumber: number;
  surahName: string;
  ayahNumber: number;
  text: string;
  highlightedText: string;
}

const SearchPage = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSurah, setSelectedSurah] = useState<string>("");
  const [hasSearched, setHasSearched] = useState(false);
  const [results, setResults] = useState<SearchResult[]>([]);

  const { data: surahs, isLoading: surahsLoading } = useAllSurahs();
  const surahNumber = selectedSurah ? parseInt(selectedSurah) : null;
  const { data: surahData, isLoading: surahLoading } = useSurah(surahNumber || 1);

  // Highlight matching text in results
  const highlightText = (text: string, query: string): string => {
    if (!query) return text;
    const regex = new RegExp(`(${query})`, 'gi');
    return text.replace(regex, '<mark class="bg-primary/20 text-primary px-0.5 rounded">$1</mark>');
  };

  // Perform search when query or surah changes
  const handleSearch = () => {
    if (!searchQuery.trim()) {
      setResults([]);
      setHasSearched(false);
      return;
    }

    setHasSearched(true);

    if (surahData && surahNumber) {
      const normalizedQuery = searchQuery.trim();
      
      const matchingAyahs = surahData.ayahs.filter(ayah => 
        ayah.text.includes(normalizedQuery)
      );
      
      setResults(matchingAyahs.map(ayah => ({
        surahNumber: surahData.number,
        surahName: surahData.name,
        ayahNumber: ayah.numberInSurah,
        text: ayah.text,
        highlightedText: highlightText(ayah.text, normalizedQuery),
      })));
    } else {
      setResults([]);
    }
  };

  // Reset results when surah changes
  useEffect(() => {
    if (hasSearched && searchQuery.trim()) {
      handleSearch();
    }
  }, [surahData]);

  const selectedSurahData = useMemo(() => {
    if (!surahs || !selectedSurah) return null;
    return surahs.find(s => s.number === parseInt(selectedSurah));
  }, [surahs, selectedSurah]);

  return (
    <>
      <Helmet>
        <title>البحث في القرآن الكريم | تفسير</title>
        <meta name="description" content="ابحث في آيات القرآن الكريم داخل أي سورة" />
      </Helmet>

      <div className="min-h-screen flex flex-col bg-background">
        <Header />

        <main className="flex-1">
          {/* Search Header */}
          <div className="py-12 border-b border-border bg-gradient-to-b from-primary/5 to-transparent">
            <div className="container">
              <div className="max-w-2xl mx-auto text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-6">
                  <Search className="h-8 w-8 text-primary" />
                </div>
                <h1 className="font-amiri text-3xl md:text-4xl font-bold mb-3 text-foreground">
                  البحث في القرآن الكريم
                </h1>
                <p className="text-muted-foreground font-arabic mb-8">
                  اختر سورة ثم ابحث في آياتها
                </p>
                
                {/* Surah Selection */}
                <div className="mb-6">
                  <label className="block text-sm font-arabic text-muted-foreground mb-2 text-right">
                    اختر السورة للبحث فيها
                  </label>
                  <Select
                    value={selectedSurah}
                    onValueChange={(value) => {
                      setSelectedSurah(value);
                      setResults([]);
                      setHasSearched(false);
                    }}
                  >
                    <SelectTrigger className="w-full h-12 font-arabic text-base bg-card border-border">
                      <SelectValue placeholder="اختر سورة..." />
                    </SelectTrigger>
                    <SelectContent className="max-h-80 bg-card border-border">
                      {surahs?.map(s => (
                        <SelectItem 
                          key={s.number} 
                          value={s.number.toString()}
                          className="font-arabic text-base py-3"
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
                <div className="flex gap-3">
                  <div className="relative flex-1">
                    <Search className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground pointer-events-none" />
                    <Input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                      placeholder={selectedSurah ? `ابحث في ${selectedSurahData?.name || 'السورة'}...` : "اختر سورة أولاً..."}
                      className="pr-12 h-12 font-arabic text-base bg-card border-border focus:border-primary focus:ring-2 focus:ring-primary/20"
                      dir="rtl"
                      disabled={!selectedSurah}
                    />
                  </div>
                  <Button 
                    onClick={handleSearch} 
                    className="h-12 px-8 font-arabic text-base"
                    disabled={!selectedSurah || !searchQuery.trim() || surahLoading}
                  >
                    {surahLoading ? (
                      <span className="flex items-center gap-2">
                        <span className="animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full"></span>
                        جاري...
                      </span>
                    ) : (
                      "بحث"
                    )}
                  </Button>
                </div>

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
              </div>
            </div>
          </div>

          {/* Results Section */}
          <div className="container py-8">
            <div className="max-w-3xl mx-auto">
              {surahLoading && selectedSurah ? (
                <LoadingSpinner message="جاري تحميل السورة..." />
              ) : (
                <>
                  {/* Results */}
                  {hasSearched && results.length > 0 && (
                    <div>
                      <div className="flex items-center justify-between mb-6">
                        <h2 className="font-amiri font-bold text-xl text-foreground">
                          نتائج البحث
                        </h2>
                        <span className="bg-primary/10 text-primary px-4 py-1.5 rounded-full text-sm font-arabic">
                          {toArabicNumerals(results.length)} آية
                        </span>
                      </div>
                      
                      <div className="space-y-4">
                        {results.map((result, index) => (
                          <div 
                            key={`${result.surahNumber}-${result.ayahNumber}`}
                            className="group border border-border rounded-xl bg-card overflow-hidden hover:border-primary/30 hover:shadow-lg transition-all duration-300"
                          >
                            {/* Result Header */}
                            <div className="flex items-center justify-between px-5 py-3 bg-secondary/30 border-b border-border">
                              <div className="flex items-center gap-3">
                                <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary/10 text-primary font-arabic font-bold">
                                  {toArabicNumerals(result.ayahNumber)}
                                </div>
                                <div>
                                  <span className="font-amiri font-semibold text-foreground">{result.surahName}</span>
                                  <span className="text-muted-foreground text-sm font-arabic mx-2">·</span>
                                  <span className="text-muted-foreground text-sm font-arabic">الآية {toArabicNumerals(result.ayahNumber)}</span>
                                </div>
                              </div>
                            </div>
                            
                            {/* Ayah Text */}
                            <div className="p-5">
                              <p 
                                className="font-quran text-xl leading-loose text-foreground"
                                dangerouslySetInnerHTML={{ __html: result.highlightedText }}
                              />
                            </div>
                            
                            {/* Action Buttons */}
                            <div className="flex items-center gap-3 px-5 py-3 bg-secondary/20 border-t border-border">
                              <Link
                                to={`/surah/${result.surahNumber}/ayah/${result.ayahNumber}`}
                                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors font-arabic text-sm"
                              >
                                <FileText className="h-4 w-4" />
                                <span>صفحة الآية والتفسير</span>
                              </Link>
                              <Link
                                to={`/surah/${result.surahNumber}#ayah-${result.ayahNumber}`}
                                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-secondary text-foreground hover:bg-secondary/80 transition-colors font-arabic text-sm"
                              >
                                <BookOpen className="h-4 w-4" />
                                <span>موضعها في السورة</span>
                                <ArrowLeft className="h-3 w-3" />
                              </Link>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* No Results Message */}
                  {hasSearched && results.length === 0 && selectedSurah && (
                    <div className="text-center py-16">
                      <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-secondary mb-6">
                        <Search className="h-10 w-10 text-muted-foreground" />
                      </div>
                      <h3 className="font-amiri text-xl font-bold text-foreground mb-2">
                        لا توجد نتائج
                      </h3>
                      <p className="text-muted-foreground font-arabic max-w-md mx-auto">
                        لا توجد آيات مطابقة لـ "<span className="text-primary">{searchQuery}</span>" داخل {selectedSurahData?.name}
                      </p>
                      <p className="text-muted-foreground font-arabic text-sm mt-2">
                        جرب كلمة أخرى أو جزء من الآية
                      </p>
                    </div>
                  )}

                  {/* Initial State - No Surah Selected */}
                  {!selectedSurah && !hasSearched && (
                    <div className="text-center py-16">
                      <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary/10 mb-6">
                        <BookOpen className="h-10 w-10 text-primary" />
                      </div>
                      <h3 className="font-amiri text-xl font-bold text-foreground mb-2">
                        اختر سورة للبحث
                      </h3>
                      <p className="text-muted-foreground font-arabic max-w-md mx-auto">
                        اختر السورة التي تريد البحث فيها من القائمة أعلاه، ثم اكتب النص الذي تبحث عنه
                      </p>
                    </div>
                  )}

                  {/* Surah Selected but No Search Yet */}
                  {selectedSurah && !hasSearched && (
                    <div className="text-center py-16">
                      <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary/10 mb-6">
                        <Search className="h-10 w-10 text-primary" />
                      </div>
                      <h3 className="font-amiri text-xl font-bold text-foreground mb-2">
                        ابحث في {selectedSurahData?.name}
                      </h3>
                      <p className="text-muted-foreground font-arabic max-w-md mx-auto">
                        اكتب كلمة أو جزء من آية للبحث داخل السورة
                      </p>
                    </div>
                  )}
                </>
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
