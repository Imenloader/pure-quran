import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { Heart, Trash2, ChevronRight } from "lucide-react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { useFavorites } from "@/contexts/FavoritesContext";
import { toArabicNumerals } from "@/lib/quran-api";
import { toast } from "sonner";

const FavoritesPage = () => {
  const { favorites, removeFavorite, clearFavorites } = useFavorites();

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
          <div className="border-b border-border py-3 bg-secondary/30">
            <div className="container">
              <nav className="flex items-center gap-2 text-sm text-muted-foreground font-arabic">
                <Link to="/" className="hover:text-primary transition-colors">الرئيسية</Link>
                <ChevronRight className="h-4 w-4 rotate-180" />
                <span className="text-foreground">المفضلة</span>
              </nav>
            </div>
          </div>

          <div className="container py-8">
            <div className="max-w-3xl mx-auto">
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                  <Heart className="h-6 w-6 text-primary" />
                  <h1 className="font-amiri text-2xl font-bold">الآيات المفضلة</h1>
                  <span className="text-sm text-muted-foreground font-arabic">({toArabicNumerals(favorites.length)})</span>
                </div>
                
                {favorites.length > 0 && (
                  <Button variant="outline" size="sm" onClick={handleClearAll} className="gap-2 text-destructive hover:text-destructive font-arabic">
                    <Trash2 className="h-4 w-4" />
                    <span className="hidden sm:inline">حذف الكل</span>
                  </Button>
                )}
              </div>

              {favorites.length === 0 ? (
                <div className="text-center py-20">
                  <Heart className="h-16 w-16 mx-auto mb-6 text-muted-foreground/20" />
                  <p className="text-muted-foreground font-arabic text-lg mb-2">لا توجد آيات مفضلة</p>
                  <p className="text-sm text-muted-foreground/70 mb-6 font-arabic">اضغط على أيقونة القلب في أي آية لإضافتها</p>
                  <Link to="/"><Button className="font-arabic">تصفح السور</Button></Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {favorites.sort((a, b) => b.savedAt - a.savedAt).map((fav) => (
                    <div key={`${fav.surahNumber}-${fav.ayahNumber}`} className="bg-card border border-border rounded-lg p-5 fade-enter">
                      <div className="flex items-center justify-between mb-3">
                        <Link to={`/surah/${fav.surahNumber}/ayah/${fav.ayahNumber}`} className="text-primary hover:underline font-amiri font-semibold">
                          {fav.surahName} - الآية {toArabicNumerals(fav.ayahNumber)}
                        </Link>
                        <Button variant="ghost" size="icon" onClick={() => removeFavorite(fav.surahNumber, fav.ayahNumber)} className="h-8 w-8 text-muted-foreground hover:text-destructive">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                      <Link to={`/surah/${fav.surahNumber}/ayah/${fav.ayahNumber}`}>
                        <p className="font-quran text-xl leading-loose text-foreground/90 hover:text-foreground transition-colors">
                          {fav.text}
                          <span className="verse-number-circle mx-1">{toArabicNumerals(fav.ayahNumber)}</span>
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
