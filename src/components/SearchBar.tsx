import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export function SearchBar({ value, onChange, placeholder = "ابحث عن سورة..." }: SearchBarProps) {
  return (
    <div className="relative">
      <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
      <Input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="pr-10 pl-10 text-right font-arabic bg-card border-border focus:border-primary"
        dir="rtl"
      />
      {value && (
        <Button
          variant="ghost"
          size="sm"
          className="absolute left-1 top-1/2 -translate-y-1/2 h-7 w-7 p-0"
          onClick={() => onChange("")}
        >
          <X className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
}
