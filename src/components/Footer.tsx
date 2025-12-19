export function Footer() {
  return (
    <footer className="border-t border-border/60 mt-auto py-10">
      <div className="container">
        <div className="text-center space-y-4">
          <p className="font-arabic text-base text-foreground/80">
            القرآن الكريم
          </p>
          <div className="divider-ornament">
            <span>✦</span>
          </div>
          <p className="text-xs text-muted-foreground">
            مصدر البيانات: AlQuran.cloud · Quran.com
          </p>
        </div>
      </div>
    </footer>
  );
}
