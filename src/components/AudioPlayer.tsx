import { useState, useRef, useEffect } from "react";
import { Play, Pause, Volume2, VolumeX, RotateCcw, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";

interface AudioPlayerProps {
  surahNumber: number;
  ayahNumber: number;
  totalAyahs?: number;
  onNext?: () => void;
  onPrevious?: () => void;
}

// Correct audio URL format for Alafasy recitation
// The verse key is calculated as: surahNumber * 1000 + ayahNumber for some APIs
// Or we use the sequential ayah number across the entire Quran
function getAudioUrl(surahNumber: number, ayahNumber: number): string {
  // Format: surah padded to 3 digits + ayah padded to 3 digits
  const surahPadded = surahNumber.toString().padStart(3, "0");
  const ayahPadded = ayahNumber.toString().padStart(3, "0");
  
  // EveryAyah.com format - most reliable
  return `https://everyayah.com/data/Alafasy_128kbps/${surahPadded}${ayahPadded}.mp3`;
}

// Fallback URL
function getFallbackAudioUrl(surahNumber: number, ayahNumber: number): string {
  const surahPadded = surahNumber.toString().padStart(3, "0");
  const ayahPadded = ayahNumber.toString().padStart(3, "0");
  return `https://cdn.islamic.network/quran/audio/128/ar.alafasy/${surahPadded}${ayahPadded}.mp3`;
}

export function AudioPlayer({ surahNumber, ayahNumber, totalAyahs, onNext, onPrevious }: AudioPlayerProps) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [error, setError] = useState(false);
  const [currentUrl, setCurrentUrl] = useState("");

  // Get audio URL
  const primaryUrl = getAudioUrl(surahNumber, ayahNumber);
  const fallbackUrl = getFallbackAudioUrl(surahNumber, ayahNumber);

  useEffect(() => {
    // Reset state when ayah changes
    setIsPlaying(false);
    setProgress(0);
    setDuration(0);
    setError(false);
    setIsLoading(false);
    setCurrentUrl(primaryUrl);
    
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      audioRef.current.src = primaryUrl;
      audioRef.current.load();
    }
  }, [surahNumber, ayahNumber, primaryUrl]);

  const handlePlayPause = async () => {
    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      setIsLoading(true);
      setError(false);
      
      try {
        await audioRef.current.play();
        setIsPlaying(true);
      } catch (err) {
        console.error("Audio playback failed:", err);
        
        // Try fallback URL
        if (currentUrl === primaryUrl) {
          console.log("Trying fallback URL...");
          setCurrentUrl(fallbackUrl);
          audioRef.current.src = fallbackUrl;
          audioRef.current.load();
          
          try {
            await audioRef.current.play();
            setIsPlaying(true);
          } catch (fallbackErr) {
            console.error("Fallback also failed:", fallbackErr);
            setError(true);
          }
        } else {
          setError(true);
        }
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setProgress(audioRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration);
      setIsLoading(false);
    }
  };

  const handleCanPlay = () => {
    setIsLoading(false);
    setError(false);
  };

  const handleEnded = () => {
    setIsPlaying(false);
    setProgress(0);
  };

  const handleError = () => {
    // Only show error if we've tried both URLs
    if (currentUrl === fallbackUrl) {
      setError(true);
      setIsLoading(false);
    } else if (currentUrl === primaryUrl) {
      // Try fallback
      setCurrentUrl(fallbackUrl);
      if (audioRef.current) {
        audioRef.current.src = fallbackUrl;
        audioRef.current.load();
      }
    }
  };

  const handleSeek = (value: number[]) => {
    if (audioRef.current && duration > 0) {
      audioRef.current.currentTime = value[0];
      setProgress(value[0]);
    }
  };

  const toggleMute = () => {
    if (audioRef.current) {
      audioRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const handleRestart = () => {
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
      setProgress(0);
    }
  };

  const formatTime = (time: number): string => {
    if (!time || !isFinite(time)) return "0:00";
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  return (
    <div className="bg-secondary/50 rounded-lg p-4 border border-border">
      <audio
        ref={audioRef}
        src={currentUrl}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onCanPlay={handleCanPlay}
        onEnded={handleEnded}
        onError={handleError}
        onWaiting={() => setIsLoading(true)}
        onPlaying={() => setIsLoading(false)}
        preload="metadata"
      />

      <div className="flex items-center gap-3 md:gap-4">
        {/* Play/Pause Button */}
        <Button
          variant="outline"
          size="icon"
          onClick={handlePlayPause}
          disabled={error}
          className="h-10 w-10 rounded-full shrink-0"
        >
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : isPlaying ? (
            <Pause className="h-4 w-4" />
          ) : (
            <Play className="h-4 w-4 mr-[-2px]" />
          )}
        </Button>

        {/* Progress */}
        <div className="flex-1 flex items-center gap-2 md:gap-3 min-w-0">
          <span className="text-xs text-muted-foreground w-8 md:w-10 text-left font-mono shrink-0">
            {formatTime(progress)}
          </span>
          <Slider
            value={[progress]}
            max={duration || 1}
            step={0.1}
            onValueChange={handleSeek}
            className="flex-1"
            disabled={!duration || error}
          />
          <span className="text-xs text-muted-foreground w-8 md:w-10 text-right font-mono shrink-0">
            {formatTime(duration)}
          </span>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-1 shrink-0">
          <Button
            variant="ghost"
            size="icon"
            onClick={handleRestart}
            className="h-8 w-8"
            disabled={!duration || error}
          >
            <RotateCcw className="h-3.5 w-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleMute}
            className="h-8 w-8"
          >
            {isMuted ? (
              <VolumeX className="h-3.5 w-3.5" />
            ) : (
              <Volume2 className="h-3.5 w-3.5" />
            )}
          </Button>
        </div>
      </div>

      {/* Error State */}
      {error && (
        <p className="text-xs text-destructive mt-2 text-center font-arabic">
          تعذر تحميل التلاوة - جرب مرة أخرى
        </p>
      )}

      {/* Reciter Info */}
      <p className="text-xs text-muted-foreground mt-3 text-center font-arabic">
        بصوت القارئ مشاري العفاسي
      </p>
    </div>
  );
}
