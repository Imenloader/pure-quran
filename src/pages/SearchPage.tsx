import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { Search, ChevronRight } from "lucide-react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useAllSurahs, useSurah } from "@/hooks/useQuranData";
import { toArabicNumerals, getSurahSlug, Surah } from "@/lib/quran-api";

interface SearchResult {
  surahNumber: number;
  surahName: string;
  ayahNumber: number;
  text: string;
}

const SearchPage = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSurah, setSelectedSurah] = useState<number | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [results, setResults] = useState<SearchResult[]>([]);

  const { data: surahs } = useAllSurahs();
  const { data: surahData } = useSurah(selectedSurah || 1);

  // Search within loaded surah
  const handleSearch = () => {
    if (!searchQuery.trim()) {
      setResults([]);
      return;
    }

    setIsSearching(true);
    
    // Search in current surah if selected
    if (surahData && selectedSurah) {
      const matchingAyahs = surahData.ayahs.filter(ayah => 
        ayah.text.includes(searchQuery)
      );
      
      setResults(matchingAyahs.map(ayah => ({
        surahNumber: surahData.number,
        surahName: surahData.name,
        ayahNumber: ayah.numberInSurah,
        text: ayah.text,
      })));
    }
    
    setIsSearching(false);
  };

  // Search in surah names
  const surahResults = useMemo(() => {
    if (!surahs || !searchQuery.trim()) return [];
    
    return surahs.filter(s => 
      s.name.includes(searchQuery) || 
      s.englishName.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [surahs, searchQuery]);

  return (
    <>
      <Helmet>
        <title>البحث في القرآن الكريم</title>
        <meta name="description" content="ابحث في آيات القرآن الكريم" />
      </Helmet>

      <div className="min-h-screen flex flex-col bg-background">
        <Header />

        <main className="flex-1">
          {/* Header */}
          <div className="bg-secondary border-b border-border py-6">
            <div className="container">
              <div className="max-w-2xl mx-auto text-center">
                <h1 className="font-arabic text-2xl font-bold mb-4">البحث في القرآن الكريم</h1>
                
                {/* Search Input */}
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                      placeholder="ابحث في الآيات..."
                      className="pr-10 h-11"
                      dir="rtl"
                    />
                  </div>
                  <Button onClick={handleSearch} className="h-11 px-6">
                    بحث
                  </Button>
                </div>

                {/* Surah Selector */}
                <div className="mt-4">
                  <select
                    value={selectedSurah || ""}
                    onChange={(e) => setSelectedSurah(e.target.value ? parseInt(e.target.value) : null)}
                    className="w-full max-w-xs p-2 border border-border rounded-md bg-background text-foreground"
                    dir="rtl"
                  >
                    <option value="">اختر سورة للبحث فيها</option>
                    {surahs?.map(s => (
                      <option key={s.number} value={s.number}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Results */}
          <div className="container py-6">
            <div className="max-w-3xl mx-auto">
              {isSearching ? (
                <LoadingSpinner message="جاري البحث..." />
              ) : (
                <>
                  {/* Surah Results */}
                  {surahResults.length > 0 && (
                    <div className="mb-8">
                      <h2 className="font-arabic font-bold text-lg mb-4">
                        نتائج البحث في السور ({toArabicNumerals(surahResults.length)})
                      </h2>
                      <div className="border border-border rounded-lg bg-card overflow-hidden">
                        {surahResults.map((surah: Surah) => (
                          <Link
                            key={surah.number}
                            to={`/surah/${getSurahSlug(surah)}`}
                            className="flex items-center gap-4 py-3 px-4 border-b border-border/50 last:border-b-0 hover:bg-secondary transition-colors"
                          >
                            <span className="text-primary font-semibold">
                              {toArabicNumerals(surah.number)}
                            </span>
                            <span className="font-arabic font-semibold">{surah.name}</span>
                            <ChevronRight className="h-4 w-4 mr-auto rotate-180 text-muted-foreground" />
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Ayah Results */}
                  {results.length > 0 && (
                    <div>
                      <h2 className="font-arabic font-bold text-lg mb-4">
                        نتائج البحث في الآيات ({toArabicNumerals(results.length)})
                      </h2>
                      <div className="space-y-3">
                        {results.map((result, index) => (
                          <Link
                            key={index}
                            to={`/surah/${result.surahNumber}/ayah/${result.ayahNumber}`}
                            className="block border border-border rounded-lg bg-card p-4 hover:bg-secondary/50 transition-colors"
                          >
                            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                              <span className="text-primary font-semibold">{result.surahName}</span>
                              <span>·</span>
                              <span>الآية {toArabicNumerals(result.ayahNumber)}</span>
                            </div>
                            <p className="font-quran text-lg leading-relaxed line-clamp-2">
                              {result.text}
                            </p>
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* No Results */}
                  {searchQuery && results.length === 0 && surahResults.length === 0 && !isSearching && (
                    <div className="text-center py-12 text-muted-foreground">
                      <p className="font-arabic">لم يتم العثور على نتائج</p>
                      <p className="text-sm mt-2">جرب كلمات بحث مختلفة أو اختر سورة معينة</p>
                    </div>
                  )}

                  {/* Initial State */}
                  {!searchQuery && (
                    <div className="text-center py-12 text-muted-foreground">
                      <Search className="h-12 w-12 mx-auto mb-4 opacity-30" />
                      <p className="font-arabic">اكتب كلمة للبحث في القرآن الكريم</p>
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