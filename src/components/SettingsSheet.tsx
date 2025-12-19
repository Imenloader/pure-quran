import { Settings, Moon, Sun, Monitor, Type, AlignJustify } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Separator } from "@/components/ui/separator";
import { useSettings, FontSize, LineSpacing, Theme } from "@/contexts/SettingsContext";

export function SettingsSheet() {
  const { fontSize, lineSpacing, theme, setFontSize, setLineSpacing, setTheme } = useSettings();

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-primary hover:bg-primary/10">
          <Settings className="h-5 w-5" />
          <span className="sr-only">الإعدادات</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-80" dir="rtl">
        <SheetHeader>
          <SheetTitle className="font-arabic text-right text-xl">الإعدادات</SheetTitle>
        </SheetHeader>

        <div className="mt-8 space-y-8">
          {/* Theme */}
          <div className="space-y-4">
            <Label className="font-arabic text-base font-semibold flex items-center gap-2">
              المظهر
            </Label>
            <RadioGroup
              value={theme}
              onValueChange={(v) => setTheme(v as Theme)}
              className="grid grid-cols-3 gap-3"
            >
              <Label
                htmlFor="light"
                className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                  theme === "light" ? "border-primary bg-primary/5 shadow-sm" : "border-border hover:border-primary/50"
                }`}
              >
                <RadioGroupItem value="light" id="light" className="sr-only" />
                <Sun className="h-6 w-6" />
                <span className="text-sm font-arabic">فاتح</span>
              </Label>
              <Label
                htmlFor="dark"
                className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                  theme === "dark" ? "border-primary bg-primary/5 shadow-sm" : "border-border hover:border-primary/50"
                }`}
              >
                <RadioGroupItem value="dark" id="dark" className="sr-only" />
                <Moon className="h-6 w-6" />
                <span className="text-sm font-arabic">داكن</span>
              </Label>
              <Label
                htmlFor="system"
                className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                  theme === "system" ? "border-primary bg-primary/5 shadow-sm" : "border-border hover:border-primary/50"
                }`}
              >
                <RadioGroupItem value="system" id="system" className="sr-only" />
                <Monitor className="h-6 w-6" />
                <span className="text-sm font-arabic">تلقائي</span>
              </Label>
            </RadioGroup>
          </div>

          <Separator />

          {/* Font Size */}
          <div className="space-y-4">
            <Label className="font-arabic text-base font-semibold flex items-center gap-2">
              <Type className="h-5 w-5" />
              حجم الخط
            </Label>
            <RadioGroup
              value={fontSize}
              onValueChange={(v) => setFontSize(v as FontSize)}
              className="grid grid-cols-4 gap-2"
            >
              {[
                { value: "small", label: "صغير", size: "1rem" },
                { value: "medium", label: "متوسط", size: "1.25rem" },
                { value: "large", label: "كبير", size: "1.5rem" },
                { value: "xlarge", label: "أكبر", size: "1.75rem" },
              ].map((option) => (
                <Label
                  key={option.value}
                  htmlFor={`font-${option.value}`}
                  className={`flex flex-col items-center gap-2 p-3 rounded-xl border-2 cursor-pointer transition-all ${
                    fontSize === option.value
                      ? "border-primary bg-primary/5 shadow-sm"
                      : "border-border hover:border-primary/50"
                  }`}
                >
                  <RadioGroupItem value={option.value} id={`font-${option.value}`} className="sr-only" />
                  <span className="font-arabic" style={{ fontSize: option.size }}>أ</span>
                  <span className="text-[10px] text-muted-foreground font-arabic">{option.label}</span>
                </Label>
              ))}
            </RadioGroup>
          </div>

          <Separator />

          {/* Line Spacing */}
          <div className="space-y-4">
            <Label className="font-arabic text-base font-semibold flex items-center gap-2">
              <AlignJustify className="h-5 w-5" />
              تباعد الأسطر
            </Label>
            <RadioGroup
              value={lineSpacing}
              onValueChange={(v) => setLineSpacing(v as LineSpacing)}
              className="grid grid-cols-3 gap-3"
            >
              {[
                { value: "normal", label: "عادي", gap: "2px" },
                { value: "relaxed", label: "مريح", gap: "4px" },
                { value: "loose", label: "واسع", gap: "6px" },
              ].map((option) => (
                <Label
                  key={option.value}
                  htmlFor={`spacing-${option.value}`}
                  className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                    lineSpacing === option.value
                      ? "border-primary bg-primary/5 shadow-sm"
                      : "border-border hover:border-primary/50"
                  }`}
                >
                  <RadioGroupItem value={option.value} id={`spacing-${option.value}`} className="sr-only" />
                  <div className="flex flex-col gap-0.5">
                    <div className="w-10 h-0.5 bg-current rounded" style={{ marginBottom: option.gap }} />
                    <div className="w-10 h-0.5 bg-current rounded" style={{ marginBottom: option.gap }} />
                    <div className="w-10 h-0.5 bg-current rounded" />
                  </div>
                  <span className="text-xs text-muted-foreground font-arabic mt-1">{option.label}</span>
                </Label>
              ))}
            </RadioGroup>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
