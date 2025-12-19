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
import { Separator } from "@/components/ui/separator";
import { useSettings, FontSize, LineSpacing, Theme } from "@/contexts/SettingsContext";
import { cn } from "@/lib/utils";

export function SettingsSheet() {
  const { fontSize, lineSpacing, theme, setFontSize, setLineSpacing, setTheme } = useSettings();

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground">
          <Settings className="h-4 w-4" />
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-80 bg-background" dir="rtl">
        <SheetHeader>
          <SheetTitle className="font-arabic text-right text-lg">الإعدادات</SheetTitle>
        </SheetHeader>

        <div className="mt-8 space-y-8">
          {/* Theme */}
          <div className="space-y-4">
            <Label className="font-arabic text-sm font-medium text-foreground">المظهر</Label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { value: "light" as Theme, label: "فاتح", icon: Sun },
                { value: "dark" as Theme, label: "داكن", icon: Moon },
                { value: "system" as Theme, label: "تلقائي", icon: Monitor },
              ].map((option) => (
                <button
                  key={option.value}
                  onClick={() => setTheme(option.value)}
                  className={cn(
                    "flex flex-col items-center gap-2 p-3 rounded-lg border transition-all",
                    theme === option.value
                      ? "border-primary bg-primary/5"
                      : "border-border hover:border-primary/50"
                  )}
                >
                  <option.icon className="h-5 w-5" />
                  <span className="text-xs font-arabic">{option.label}</span>
                </button>
              ))}
            </div>
          </div>

          <Separator />

          {/* Font Size */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Type className="h-4 w-4 text-muted-foreground" />
              <Label className="font-arabic text-sm font-medium text-foreground">حجم الخط</Label>
            </div>
            <div className="grid grid-cols-4 gap-2">
              {[
                { value: "small" as FontSize, label: "صغير" },
                { value: "medium" as FontSize, label: "متوسط" },
                { value: "large" as FontSize, label: "كبير" },
                { value: "xlarge" as FontSize, label: "أكبر" },
              ].map((option) => (
                <button
                  key={option.value}
                  onClick={() => setFontSize(option.value)}
                  className={cn(
                    "py-2 px-3 rounded-md text-xs font-arabic transition-all",
                    fontSize === option.value
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground hover:bg-muted/80"
                  )}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          <Separator />

          {/* Line Spacing */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <AlignJustify className="h-4 w-4 text-muted-foreground" />
              <Label className="font-arabic text-sm font-medium text-foreground">تباعد الأسطر</Label>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {[
                { value: "normal" as LineSpacing, label: "عادي" },
                { value: "relaxed" as LineSpacing, label: "مريح" },
                { value: "loose" as LineSpacing, label: "واسع" },
              ].map((option) => (
                <button
                  key={option.value}
                  onClick={() => setLineSpacing(option.value)}
                  className={cn(
                    "py-2 px-3 rounded-md text-xs font-arabic transition-all",
                    lineSpacing === option.value
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground hover:bg-muted/80"
                  )}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
