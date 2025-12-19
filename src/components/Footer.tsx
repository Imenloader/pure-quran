import { Link } from "react-router-dom";
import { BookOpen, Star, Moon } from "lucide-react";

export function Footer() {
  return (
    <footer className="mt-auto border-t border-border bg-gradient-to-b from-secondary/30 to-secondary/60">
      <div className="container py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          {/* About */}
          <div className="md:col-span-1">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <BookOpen className="h-5 w-5 text-primary" />
              </div>
              <h3 className="font-amiri font-bold text-foreground text-xl">القرآن الكريم</h3>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              موقع للقراءة والتدبر في كتاب الله الكريم مع تفاسير العلماء الأجلاء. صُمم بعناية لتوفير تجربة قراءة مريحة وسهلة.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-amiri font-bold text-foreground mb-4 text-lg flex items-center gap-2">
              <Star className="h-4 w-4 text-gold" />
              روابط سريعة
            </h3>
            <ul className="space-y-3 text-sm">
              <li>
                <Link to="/" className="text-muted-foreground hover:text-primary transition-colors flex items-center gap-2 group">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary/30 group-hover:bg-primary transition-colors" />
                  فهرس السور
                </Link>
              </li>
              <li>
                <Link to="/surah/1-al-fatiha" className="text-muted-foreground hover:text-primary transition-colors flex items-center gap-2 group">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary/30 group-hover:bg-primary transition-colors" />
                  سورة الفاتحة
                </Link>
              </li>
              <li>
                <Link to="/surah/36-ya-sin" className="text-muted-foreground hover:text-primary transition-colors flex items-center gap-2 group">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary/30 group-hover:bg-primary transition-colors" />
                  سورة يس
                </Link>
              </li>
              <li>
                <Link to="/surah/67-al-mulk" className="text-muted-foreground hover:text-primary transition-colors flex items-center gap-2 group">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary/30 group-hover:bg-primary transition-colors" />
                  سورة الملك
                </Link>
              </li>
              <li>
                <Link to="/search" className="text-muted-foreground hover:text-primary transition-colors flex items-center gap-2 group">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary/30 group-hover:bg-primary transition-colors" />
                  البحث في القرآن
                </Link>
              </li>
            </ul>
          </div>

          {/* Tafsir */}
          <div>
            <h3 className="font-amiri font-bold text-foreground mb-4 text-lg flex items-center gap-2">
              <Moon className="h-4 w-4 text-gold" />
              التفاسير المتوفرة
            </h3>
            <ul className="space-y-3 text-sm">
              <li>
                <Link to="/surah/1?tafsir=ar-tafsir-ibn-kathir" className="text-muted-foreground hover:text-primary transition-colors flex items-center gap-2 group">
                  <span className="w-1.5 h-1.5 rounded-full bg-gold/50 group-hover:bg-gold transition-colors" />
                  تفسير ابن كثير
                </Link>
              </li>
              <li>
                <Link to="/surah/1?tafsir=ar-tafsir-al-sa3di" className="text-muted-foreground hover:text-primary transition-colors flex items-center gap-2 group">
                  <span className="w-1.5 h-1.5 rounded-full bg-gold/50 group-hover:bg-gold transition-colors" />
                  تفسير السعدي
                </Link>
              </li>
              <li>
                <Link to="/surah/1?tafsir=ar-tafseer-al-tabari" className="text-muted-foreground hover:text-primary transition-colors flex items-center gap-2 group">
                  <span className="w-1.5 h-1.5 rounded-full bg-gold/50 group-hover:bg-gold transition-colors" />
                  تفسير الطبري
                </Link>
              </li>
              <li>
                <Link to="/surah/1?tafsir=ar-tafseer-al-qurtubi" className="text-muted-foreground hover:text-primary transition-colors flex items-center gap-2 group">
                  <span className="w-1.5 h-1.5 rounded-full bg-gold/50 group-hover:bg-gold transition-colors" />
                  تفسير القرطبي
                </Link>
              </li>
              <li>
                <Link to="/surah/1?tafsir=ar-tafsir-al-muyassar" className="text-muted-foreground hover:text-primary transition-colors flex items-center gap-2 group">
                  <span className="w-1.5 h-1.5 rounded-full bg-gold/50 group-hover:bg-gold transition-colors" />
                  التفسير الميسر
                </Link>
              </li>
            </ul>
          </div>

          {/* Stats */}
          <div>
            <h3 className="font-amiri font-bold text-foreground mb-4 text-lg">إحصائيات القرآن</h3>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-card/80 rounded-lg p-3 text-center border border-border/50">
                <p className="font-arabic text-xl font-bold text-primary">١١٤</p>
                <p className="text-xs text-muted-foreground">سورة</p>
              </div>
              <div className="bg-card/80 rounded-lg p-3 text-center border border-border/50">
                <p className="font-arabic text-xl font-bold text-primary">٦٢٣٦</p>
                <p className="text-xs text-muted-foreground">آية</p>
              </div>
              <div className="bg-card/80 rounded-lg p-3 text-center border border-border/50">
                <p className="font-arabic text-xl font-bold text-primary">٣٠</p>
                <p className="text-xs text-muted-foreground">جزء</p>
              </div>
              <div className="bg-card/80 rounded-lg p-3 text-center border border-border/50">
                <p className="font-arabic text-xl font-bold text-primary">٦٠</p>
                <p className="text-xs text-muted-foreground">حزب</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-border/50 py-5 bg-header/5">
        <div className="container">
          <div className="flex flex-col md:flex-row items-center justify-between gap-3 text-xs text-muted-foreground">
            <p className="font-arabic flex items-center gap-2">
              <BookOpen className="h-3.5 w-3.5" />
              القرآن الكريم - القراءة والتدبر والتفسير
            </p>
            <p className="opacity-60">مصدر البيانات: AlQuran.cloud · Quran.com</p>
          </div>
        </div>
      </div>
    </footer>
  );
}