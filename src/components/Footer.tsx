import { Heart } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-border bg-card/50 mt-auto">
      <div className="container py-8">
        <div className="flex flex-col items-center gap-4 text-center">
          <p className="font-arabic text-lg text-foreground">
            إِنَّا نَحْنُ نَزَّلْنَا الذِّكْرَ وَإِنَّا لَهُ لَحَافِظُونَ
          </p>
          <p className="text-sm text-muted-foreground">
            "Indeed, it is We who sent down the Quran and indeed, We will be its guardian."
          </p>
          <p className="text-xs text-muted-foreground">— سورة الحجر، الآية ٩</p>
          
          <div className="flex items-center gap-1 text-xs text-muted-foreground mt-4">
            <span>Made with</span>
            <Heart className="h-3 w-3 text-primary fill-primary" />
            <span>for the Ummah</span>
          </div>
          
          <p className="text-xs text-muted-foreground">
            Data source: <a href="https://alquran.cloud" target="_blank" rel="noopener noreferrer" className="underline hover:text-primary">AlQuran.cloud API</a>
          </p>
        </div>
      </div>
    </footer>
  );
}
