import { Link } from "react-router-dom";

export function Footer() {
  return (
    <footer className="mt-auto border-t border-border bg-secondary/50">
      <div className="container py-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* About */}
          <div>
            <h3 className="font-amiri font-bold text-foreground mb-3 text-lg">عن الموقع</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              موقع للقراءة والتدبر في كتاب الله الكريم مع تفاسير العلماء الأجلاء.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-amiri font-bold text-foreground mb-3 text-lg">روابط سريعة</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/" className="text-muted-foreground hover:text-primary transition-colors">فهرس السور</Link>
              </li>
              <li>
                <Link to="/surah/1-al-fatiha" className="text-muted-foreground hover:text-primary transition-colors">سورة الفاتحة</Link>
              </li>
              <li>
                <Link to="/surah/36-ya-sin" className="text-muted-foreground hover:text-primary transition-colors">سورة يس</Link>
              </li>
              <li>
                <Link to="/surah/67-al-mulk" className="text-muted-foreground hover:text-primary transition-colors">سورة الملك</Link>
              </li>
            </ul>
          </div>

          {/* Tafsir */}
          <div>
            <h3 className="font-amiri font-bold text-foreground mb-3 text-lg">التفاسير المتوفرة</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>تفسير ابن كثير</li>
              <li>تفسير السعدي</li>
              <li>تفسير الطبري</li>
              <li>تفسير القرطبي</li>
              <li>تفسير الجلالين</li>
            </ul>
          </div>

          {/* Info */}
          <div>
            <h3 className="font-amiri font-bold text-foreground mb-3 text-lg">إحصائيات</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>١١٤ سورة</li>
              <li>٦٢٣٦ آية</li>
              <li>٣٠ جزءًا</li>
              <li>٦٠ حزبًا</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-border py-4">
        <div className="container">
          <div className="flex flex-col md:flex-row items-center justify-between gap-2 text-xs text-muted-foreground">
            <p className="font-arabic">القرآن الكريم - القراءة والتفسير</p>
            <p>مصدر البيانات: AlQuran.cloud · Quran.com</p>
          </div>
        </div>
      </div>
    </footer>
  );
}
