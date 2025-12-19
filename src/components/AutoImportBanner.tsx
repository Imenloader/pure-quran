import { Progress } from "@/components/ui/progress";
import { Download, Loader2 } from "lucide-react";
import { toArabicNumerals } from "@/lib/quran-api";

interface AutoImportBannerProps {
  isImporting: boolean;
  currentTafsir: string | null;
  currentSurah: number;
  totalProgress: number;
}

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

export const AutoImportBanner = ({
  isImporting,
  currentTafsir,
  currentSurah,
  totalProgress,
}: AutoImportBannerProps) => {
  if (!isImporting) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-96 bg-card border border-border rounded-lg shadow-lg p-4 z-50">
      <div className="flex items-center gap-3 mb-3">
        <div className="bg-primary/10 p-2 rounded-full">
          <Loader2 className="h-5 w-5 text-primary animate-spin" />
        </div>
        <div>
          <h4 className="font-amiri font-bold text-sm">جاري استيراد التفاسير</h4>
          <p className="text-xs text-muted-foreground font-arabic">
            {currentTafsir}
          </p>
        </div>
      </div>

      <Progress value={totalProgress} className="h-2 mb-2" />

      <div className="flex justify-between text-xs text-muted-foreground font-arabic">
        <span>
          سورة {currentSurah > 0 ? SURAH_NAMES[currentSurah - 1] : "..."} ({toArabicNumerals(currentSurah)}/١١٤)
        </span>
        <span>{totalProgress}%</span>
      </div>
    </div>
  );
};
