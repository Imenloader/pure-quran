import { useState, useRef, useEffect } from "react";
import { Play, Pause, Volume2, VolumeX, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { toArabicNumerals } from "@/lib/quran-api";

interface AudioPlayerProps {
  surahNumber: number;
  ayahNumber: number;
  totalAyahs?: number;
  onNext?: () => void;
  onPrevious?: () => void;
}

// Quran audio CDN - Abdul Basit recitation
const getAudioUrl = (surahNumber: number, ayahNumber: number): string => {
  const surah = surahNumber.toString().padStart(3, "0");
  const ayah = ayahNumber.toString().padStart(3, "0");
  return `https://cdn.islamic.network/quran/audio/128/ar.alafasy/${surahNumber}${ayah.slice(-3)}.mp3`;
};

// Alternative: Quran.com audio
const getQuranComAudioUrl = (surahNumber: number, ayahNumber: number): string => {
  const verseKey = `${surahNumber}${ayahNumber.toString().padStart(3, "0")}`;
  return `https://verses.quran.com/Alafasy/mp3/${verseKey}.mp3`;
};

export function AudioPlayer({ surahNumber, ayahNumber, totalAyahs, onNext, onPrevious }: AudioPlayerProps) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [error, setError] = useState(false);

  // Construct audio URL
  const audioUrl = `https://cdn.islamic.network/quran/audio/128/ar.alafasy/${surahNumber.toString().padStart(3, "0")}${ayahNumber.toString().padStart(3, "0")}.mp3`;

  useEffect(() => {
    // Reset state when ayah changes
    setIsPlaying(false);
    setProgress(0);
    setError(false);
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
  }, [surahNumber, ayahNumber]);

  const handlePlayPause = async () => {
    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      setIsLoading(true);
      try {
        await audioRef.current.play();
        setIsPlaying(true);
        setError(false);
      } catch (err) {
        console.error("Audio playback failed:", err);
        setError(true);
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
    }
  };

  const handleEnded = () => {
    setIsPlaying(false);
    setProgress(0);
  };

  const handleSeek = (value: number[]) => {
    if (audioRef.current) {
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
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  return (
    <div className="bg-secondary/50 rounded-lg p-4 border border-border">
      <audio
        ref={audioRef}
        src={audioUrl}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={handleEnded}
        onError={() => setError(true)}
        preload="metadata"
      />

      <div className="flex items-center gap-4">
        {/* Play/Pause Button */}
        <Button
          variant="outline"
          size="icon"
          onClick={handlePlayPause}
          disabled={isLoading || error}
          className="h-10 w-10 rounded-full"
        >
          {isLoading ? (
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          ) : isPlaying ? (
            <Pause className="h-4 w-4" />
          ) : (
            <Play className="h-4 w-4 mr-[-2px]" />
          )}
        </Button>

        {/* Progress */}
        <div className="flex-1 flex items-center gap-3">
          <span className="text-xs text-muted-foreground w-10 text-left font-mono">
            {formatTime(progress)}
          </span>
          <Slider
            value={[progress]}
            max={duration || 100}
            step={0.1}
            onValueChange={handleSeek}
            className="flex-1"
            disabled={!duration}
          />
          <span className="text-xs text-muted-foreground w-10 text-right font-mono">
            {formatTime(duration)}
          </span>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={handleRestart}
            className="h-8 w-8"
            disabled={!duration}
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
          تعذر تحميل التلاوة
        </p>
      )}

      {/* Reciter Info */}
      <p className="text-xs text-muted-foreground mt-3 text-center font-arabic">
        بصوت القارئ مشاري العفاسي
      </p>
    </div>
  );
}
