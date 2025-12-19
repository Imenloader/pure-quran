import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { Heart, Trash2, Download, ChevronRight } from "lucide-react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { useFavorites } from "@/contexts/FavoritesContext";
import { toArabicNumerals } from "@/lib/quran-api";
import { generateFavoritesPDF } from "@/lib/pdf-generator";
import { toast } from "sonner";

const FavoritesPage = () => {
  const { favorites, removeFavorite, clearFavorites } = useFavorites();

  const handleDownloadPDF = async () => {
    if (favorites.length === 0) {
      toast.error("لا توجد آيات مفضلة لتحميلها");
      return;
    }
    try {
      await generateFavoritesPDF(favorites);
      toast.success("تم تحميل الملف بنجاح");
    } catch (error) {
      toast.error("فشل تحميل الملف");
    }
  };

  const handleClearAll = () => {
    if (window.confirm("هل أنت متأكد من حذف جميع المفضلة؟")) {
      clearFavorites();
      toast.success("تم حذف جميع المفضلة");
    }
  };

  return (
    <>
      <Helmet>
        <title>الآيات المفضلة - القرآن الكريم</title>
        <meta name="description" content="الآيات المفضلة المحفوظة" />
      </Helmet>

      <div className="min-h-screen flex flex-col bg-background">
        <Header />

        <main className="flex-1">
          {/* Breadcrumb */}
          <div className="bg-secondary border-b border-border py-3">
            <div className="container">
              <nav className="flex items-center gap-2 text-sm text-muted-foreground">
                <Link to="/" className="text-link hover:underline">الرئيسية</Link>
                <ChevronRight className="h-4 w-4 rotate-180" />
                <span className="text-foreground">المفضلة</span>
              </nav>
            </div>
          </div>

          <div className="container py-6">
            <div className="max-w-3xl mx-auto">
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <Heart className="h-6 w-6 text-primary fill-primary" />
                  <h1 className="font-arabic text-2xl font-bold">الآيات المفضلة</h1>
                  <span className="text-sm text-muted-foreground">
                    ({toArabicNumerals(favorites.length)})
                  </span>
                </div>
                
                {favorites.length > 0 && (
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={handleDownloadPDF} className="gap-2">
                      <Download className="h-4 w-4" />
                      <span className="hidden sm:inline">تحميل PDF</span>
                    </Button>
                    <Button variant="outline" size="sm" onClick={handleClearAll} className="gap-2 text-destructive hover:text-destructive">
                      <Trash2 className="h-4 w-4" />
                      <span className="hidden sm:inline">حذف الكل</span>
                    </Button>
                  </div>
                )}
              </div>

              {/* Favorites List */}
              {favorites.length === 0 ? (
                <div className="text-center py-16">
                  <Heart className="h-16 w-16 mx-auto mb-4 text-muted-foreground/30" />
                  <p className="text-muted-foreground font-arabic text-lg mb-2">
                    لا توجد آيات مفضلة
                  </p>
                  <p className="text-sm text-muted-foreground mb-4">
                    اضغط على أيقونة القلب في أي آية لإضافتها إلى المفضلة
                  </p>
                  <Link to="/">
                    <Button>تصفح السور</Button>
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {favorites
                    .sort((a, b) => b.savedAt - a.savedAt)
                    .map((fav) => (
                      <div
                        key={`${fav.surahNumber}-${fav.ayahNumber}`}
                        className="bg-card border border-border rounded-lg p-4 fade-enter"
                      >
                        {/* Header */}
                        <div className="flex items-center justify-between mb-3">
                          <Link
                            to={`/surah/${fav.surahNumber}/ayah/${fav.ayahNumber}`}
                            className="text-primary hover:underline font-arabic font-semibold"
                          >
                            {fav.surahName} - الآية {toArabicNumerals(fav.ayahNumber)}
                          </Link>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => removeFavorite(fav.surahNumber, fav.ayahNumber)}
                            className="h-8 w-8 text-muted-foreground hover:text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                        
                        {/* Ayah Text */}
                        <Link to={`/surah/${fav.surahNumber}/ayah/${fav.ayahNumber}`}>
                          <p className="font-quran text-xl leading-loose text-foreground/90 hover:text-foreground transition-colors">
                            {fav.text}
                            <span className="inline-flex items-center justify-center min-w-[1.5rem] h-6 mx-1 text-xs text-primary bg-primary/10 rounded-full px-1">
                              {toArabicNumerals(fav.ayahNumber)}
                            </span>
                          </p>
                        </Link>
                      </div>
                    ))}
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

export default FavoritesPage;