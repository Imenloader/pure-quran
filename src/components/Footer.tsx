import { Link } from "react-router-dom";

export function Footer() {
  return (
    <footer className="mt-auto">
      {/* Main footer */}
      <div className="bg-neutral-100 border-t border-neutral-200 py-8">
        <div className="container">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* About */}
            <div>
              <h3 className="font-arabic font-bold text-foreground mb-3">عن الموقع</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                موقع القرآن الكريم للقراءة والتفسير، يحتوي على جميع سور القرآن الكريم مع تفسير العلماء.
              </p>
            </div>

            {/* Quick Links */}
            <div>
              <h3 className="font-arabic font-bold text-foreground mb-3">روابط سريعة</h3>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link to="/" className="text-link hover:underline">فهرس السور</Link>
                </li>
                <li>
                  <Link to="/surah/1-al-fatiha" className="text-link hover:underline">سورة الفاتحة</Link>
                </li>
                <li>
                  <Link to="/surah/2-al-baqara" className="text-link hover:underline">سورة البقرة</Link>
                </li>
                <li>
                  <Link to="/surah/36-ya-sin" className="text-link hover:underline">سورة يس</Link>
                </li>
              </ul>
            </div>

            {/* Tafsir */}
            <div>
              <h3 className="font-arabic font-bold text-foreground mb-3">التفاسير المتوفرة</h3>
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
              <h3 className="font-arabic font-bold text-foreground mb-3">معلومات</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>١١٤ سورة</li>
                <li>٦٢٣٦ آية</li>
                <li>٣٠ جزء</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="bg-neutral-800 text-neutral-400 py-4">
        <div className="container">
          <div className="flex flex-col md:flex-row items-center justify-between gap-2 text-xs">
            <p>القرآن الكريم - القراءة والتفسير</p>
            <p>مصدر البيانات: AlQuran.cloud · Quran.com</p>
          </div>
        </div>
      </div>
    </footer>
  );
}