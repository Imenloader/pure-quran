export function Footer() {
  return (
    <footer className="border-t border-border bg-card/50 mt-auto">
      <div className="container py-8">
        <div className="text-center space-y-3">
          <p className="font-arabic text-lg text-foreground">القرآن الكريم</p>
          <p className="text-sm text-muted-foreground font-arabic">اقرأ القرآن الكريم مع التفسير</p>
          <div className="gold-line max-w-32 mx-auto my-4" />
          <p className="text-xs text-muted-foreground">البيانات من AlQuran.cloud و Quran.com</p>
        </div>
      </div>
    </footer>
  );
}
