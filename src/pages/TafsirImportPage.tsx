import { useState, useEffect } from "react";
import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import { ChevronRight, Download, RefreshCw, CheckCircle, AlertCircle, Clock } from "lucide-react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { toArabicNumerals, TafsirSource } from "@/lib/quran-api";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

// Surah names for reference
const SURAH_NAMES = [
  "الفاتحة","البقرة","آل عمران","النساء","المائدة","الأنعام","الأعراف","الأنفال","التوبة","يونس",
  "هود","يوسف","الرعد","إبراهيم","الحجر","النحل","الإسراء","الكهف","مريم","طه",
  "الأنبياء","الحج","المؤمنون","النور","الفرقان","الشعراء","النمل","القصص","العنكبوت","الروم",
  "لقمان","السجدة","الأحزاب","سبأ","فاطر","يس","الصافات","ص","الزمر","غافر",
  "فصلت","الشورى","الزخرف","الدخان","الجاثية","الأحقاف","محمد","الفتح","الحجرات","ق",
  "الذاريات","الطور","النجم","القمر","الرحمن","الواقعة","الحديد","المجادلة","الحشر","الممتحنة",
  "الصف","الجمعة","المنافقون","التغابن","الطلاق","التحريم","الملك","القلم","الحاقة","المعارج",
  "نوح","الجن","المزمل","المدثر","القيامة","الإنسان","المرسلات","النبأ","النازعات","عبس",
  "التكوير","الانفطار","المطففين","الانشقاق","البروج","الطارق","الأعلى","الغاشية","الفجر","البلد",
  "الشمس","الليل","الضحى","الشرح","التين","العلق","القدر","البينة","الزلزلة","العاديات",
  "القارعة","التكاثر","العصر","الهمزة","الفيل","قريش","الماعون","الكوثر","الكافرون","النصر",
  "المسد","الإخلاص","الفلق","الناس"
];

interface TafsirStats {
  tafsir_key: string;
  tafsir_name_ar: string;
  author_ar: string;
  count: number;
}

const TafsirImportPage = () => {
  const [sources, setSources] = useState<TafsirSource[]>([]);
  const [stats, setStats] = useState<TafsirStats[]>([]);
  const [importing, setImporting] = useState<string | null>(null);
  const [currentSurah, setCurrentSurah] = useState(1);
  const [loading, setLoading] = useState(true);

  // Fetch tafsir sources and stats
  const fetchStats = async () => {
    setLoading(true);
    try {
      // Fetch sources
      const { data: sourcesData } = await supabase
        .from('tafsir_sources')
        .select('*')
        .eq('enabled', true)
        .order('display_order');

      setSources(sourcesData || []);

      // Fetch counts for each source
      const results: TafsirStats[] = [];
      
      for (const source of sourcesData || []) {
        const { count } = await supabase
          .from('tafsir_texts')
          .select('*', { count: 'exact', head: true })
          .eq('tafsir_key', source.tafsir_key);
        
        results.push({
          tafsir_key: source.tafsir_key,
          tafsir_name_ar: source.tafsir_name_ar,
          author_ar: source.author_ar,
          count: count || 0,
        });
      }
      
      setStats(results);
    } catch (err) {
      console.error('Error fetching stats:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const handleImportSurah = async (tafsirKey: string, surahNum: number) => {
    setImporting(tafsirKey);
    setCurrentSurah(surahNum);
    
    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/import-tafsir`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            action: 'import',
            tafsirKey,
            surahNumber: surahNum,
          }),
        }
      );

      const data = await response.json();
      
      if (data.success) {
        toast.success(`تم استيراد ${toArabicNumerals(data.imported)} آية من ${SURAH_NAMES[surahNum - 1]}`);
        fetchStats();
        
        // Continue to next surah if not last
        if (surahNum < 114) {
          handleImportSurah(tafsirKey, surahNum + 1);
        } else {
          setImporting(null);
          toast.success('اكتمل استيراد التفسير');
        }
      } else {
        toast.error(data.error || 'فشل الاستيراد');
        setImporting(null);
      }
    } catch (err) {
      console.error('Import error:', err);
      toast.error('فشل الاتصال بالخادم');
      setImporting(null);
    }
  };

  const getProgress = (count: number) => {
    return Math.round((count / 6236) * 100);
  };

  const getStatusIcon = (count: number) => {
    if (count >= 6236) return <CheckCircle className="h-5 w-5 text-green-500" />;
    if (count > 0) return <Clock className="h-5 w-5 text-amber-500" />;
    return <AlertCircle className="h-5 w-5 text-muted-foreground" />;
  };

  return (
    <>
      <Helmet>
        <title>إدارة التفاسير - القرآن الكريم</title>
        <meta name="description" content="إدارة واستيراد التفاسير المحلية" />
      </Helmet>

      <div className="min-h-screen flex flex-col bg-background">
        <Header />

        <main className="flex-1">
          <div className="border-b border-border py-3 bg-secondary/30">
            <div className="container">
              <nav className="flex items-center gap-2 text-sm text-muted-foreground font-arabic">
                <Link to="/" className="hover:text-primary transition-colors">الرئيسية</Link>
                <ChevronRight className="h-4 w-4 rotate-180" />
                <span className="text-foreground">إدارة التفاسير</span>
              </nav>
            </div>
          </div>

          <div className="container py-8">
            <div className="max-w-3xl mx-auto">
              <div className="text-center mb-8">
                <h1 className="font-amiri text-3xl font-bold mb-2">إدارة التفاسير المحلية</h1>
                <p className="text-muted-foreground font-arabic">
                  استيراد التفاسير العربية لتخزينها محلياً
                </p>
              </div>

              {/* Refresh Stats */}
              <div className="flex justify-center mb-6">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={fetchStats}
                  disabled={loading}
                  className="gap-2 font-arabic"
                >
                  <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                  تحديث الإحصائيات
                </Button>
              </div>

              {/* Tafsir List */}
              <div className="space-y-4">
                {stats.map((stat) => {
                  const progress = getProgress(stat.count);
                  const isCurrentImporting = importing === stat.tafsir_key;

                  return (
                    <div
                      key={stat.tafsir_key}
                      className="bg-card border border-border rounded-lg p-5"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          {getStatusIcon(stat.count)}
                          <div>
                            <h3 className="font-amiri font-bold text-lg">{stat.tafsir_name_ar}</h3>
                            <p className="text-xs text-muted-foreground font-arabic">{stat.author_ar}</p>
                          </div>
                        </div>
                        <div className="text-left">
                          <p className="font-arabic text-sm">
                            {toArabicNumerals(stat.count)} / ٦٢٣٦ آية
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {progress}%
                          </p>
                        </div>
                      </div>

                      <Progress value={progress} className="h-2 mb-3" />

                      {isCurrentImporting && (
                        <p className="text-sm text-primary font-arabic mb-3 text-center">
                          جاري استيراد سورة {SURAH_NAMES[currentSurah - 1]} ({toArabicNumerals(currentSurah)}/١١٤)
                        </p>
                      )}

                      <div className="flex gap-2 justify-end">
                        {stat.count < 6236 && (
                          <Button
                            size="sm"
                            onClick={() => handleImportSurah(stat.tafsir_key, 1)}
                            disabled={importing !== null}
                            className="gap-2 font-arabic"
                          >
                            <Download className="h-4 w-4" />
                            {isCurrentImporting ? 'جاري الاستيراد...' : 'بدء الاستيراد'}
                          </Button>
                        )}
                        {stat.count >= 6236 && (
                          <span className="text-sm text-green-600 font-arabic">مكتمل ✓</span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Info */}
              <div className="mt-8 p-4 bg-secondary/50 rounded-lg text-center">
                <p className="text-sm text-muted-foreground font-arabic">
                  ملاحظة: عملية الاستيراد تستغرق وقتاً طويلاً. يمكنك إغلاق الصفحة والعودة لاحقاً.
                </p>
              </div>
            </div>
          </div>
        </main>

        <Footer />
      </div>
    </>
  );
};

export default TafsirImportPage;
