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
        <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground">
          <Settings className="h-5 w-5" />
          <span className="sr-only">الإعدادات</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-80">
        <SheetHeader>
          <SheetTitle className="font-arabic text-right">الإعدادات</SheetTitle>
        </SheetHeader>

        <div className="mt-6 space-y-6">
          {/* Theme */}
          <div className="space-y-3">
            <Label className="font-arabic text-sm font-medium flex items-center gap-2">
              <Sun className="h-4 w-4" />
              المظهر
            </Label>
            <RadioGroup
              value={theme}
              onValueChange={(v) => setTheme(v as Theme)}
              className="grid grid-cols-3 gap-2"
            >
              <Label
                htmlFor="light"
                className={`flex flex-col items-center gap-2 p-3 rounded-lg border-2 cursor-pointer transition-colors ${
                  theme === "light" ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"
                }`}
              >
                <RadioGroupItem value="light" id="light" className="sr-only" />
                <Sun className="h-5 w-5" />
                <span className="text-xs">فاتح</span>
              </Label>
              <Label
                htmlFor="dark"
                className={`flex flex-col items-center gap-2 p-3 rounded-lg border-2 cursor-pointer transition-colors ${
                  theme === "dark" ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"
                }`}
              >
                <RadioGroupItem value="dark" id="dark" className="sr-only" />
                <Moon className="h-5 w-5" />
                <span className="text-xs">داكن</span>
              </Label>
              <Label
                htmlFor="system"
                className={`flex flex-col items-center gap-2 p-3 rounded-lg border-2 cursor-pointer transition-colors ${
                  theme === "system" ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"
                }`}
              >
                <RadioGroupItem value="system" id="system" className="sr-only" />
                <Monitor className="h-5 w-5" />
                <span className="text-xs">تلقائي</span>
              </Label>
            </RadioGroup>
          </div>

          <Separator />

          {/* Font Size */}
          <div className="space-y-3">
            <Label className="font-arabic text-sm font-medium flex items-center gap-2">
              <Type className="h-4 w-4" />
              حجم الخط
            </Label>
            <RadioGroup
              value={fontSize}
              onValueChange={(v) => setFontSize(v as FontSize)}
              className="grid grid-cols-4 gap-2"
            >
              {[
                { value: "small", label: "صغير", preview: "أ" },
                { value: "medium", label: "متوسط", preview: "أ" },
                { value: "large", label: "كبير", preview: "أ" },
                { value: "xlarge", label: "أكبر", preview: "أ" },
              ].map((option) => (
                <Label
                  key={option.value}
                  htmlFor={`font-${option.value}`}
                  className={`flex flex-col items-center gap-1 p-2 rounded-lg border-2 cursor-pointer transition-colors ${
                    fontSize === option.value
                      ? "border-primary bg-primary/5"
                      : "border-border hover:border-primary/50"
                  }`}
                >
                  <RadioGroupItem value={option.value} id={`font-${option.value}`} className="sr-only" />
                  <span
                    className="font-arabic"
                    style={{
                      fontSize: option.value === "small" ? "1rem" : option.value === "medium" ? "1.25rem" : option.value === "large" ? "1.5rem" : "1.75rem",
                    }}
                  >
                    {option.preview}
                  </span>
                  <span className="text-[10px] text-muted-foreground">{option.label}</span>
                </Label>
              ))}
            </RadioGroup>
          </div>

          <Separator />

          {/* Line Spacing */}
          <div className="space-y-3">
            <Label className="font-arabic text-sm font-medium flex items-center gap-2">
              <AlignJustify className="h-4 w-4" />
              المسافة بين الأسطر
            </Label>
            <RadioGroup
              value={lineSpacing}
              onValueChange={(v) => setLineSpacing(v as LineSpacing)}
              className="grid grid-cols-3 gap-2"
            >
              {[
                { value: "normal", label: "عادي" },
                { value: "relaxed", label: "مريح" },
                { value: "loose", label: "واسع" },
              ].map((option) => (
                <Label
                  key={option.value}
                  htmlFor={`spacing-${option.value}`}
                  className={`flex flex-col items-center gap-1 p-3 rounded-lg border-2 cursor-pointer transition-colors ${
                    lineSpacing === option.value
                      ? "border-primary bg-primary/5"
                      : "border-border hover:border-primary/50"
                  }`}
                >
                  <RadioGroupItem value={option.value} id={`spacing-${option.value}`} className="sr-only" />
                  <div className="flex flex-col gap-0.5">
                    <div
                      className="w-8 h-0.5 bg-current rounded"
                      style={{ marginBottom: option.value === "normal" ? "2px" : option.value === "relaxed" ? "4px" : "6px" }}
                    />
                    <div className="w-8 h-0.5 bg-current rounded" />
                  </div>
                  <span className="text-[10px] text-muted-foreground mt-1">{option.label}</span>
                </Label>
              ))}
            </RadioGroup>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
