import { AlertCircle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ErrorMessageProps {
  message?: string;
  onRetry?: () => void;
}

export function ErrorMessage({
  message = "حدث خطأ",
  onRetry,
}: ErrorMessageProps) {
  return (
    <div className="flex flex-col items-center justify-center py-20 gap-4">
      <AlertCircle className="h-8 w-8 text-destructive/60" />
      <p className="text-muted-foreground font-arabic text-sm">{message}</p>
      {onRetry && (
        <Button onClick={onRetry} variant="outline" size="sm" className="gap-2 font-arabic">
          <RefreshCw className="h-3 w-3" />
          إعادة المحاولة
        </Button>
      )}
    </div>
  );
}
