import { useState, useEffect, useCallback } from "react";

const TOTAL_AYAHS = 6236;
const STORAGE_KEY = "quran-reading-progress";

interface ReadingProgress {
  readAyahs: Set<string>;
  percentage: number;
  totalRead: number;
}

// Helper to convert Set to array for storage
const setToArray = (set: Set<string>): string[] => Array.from(set);
const arrayToSet = (arr: string[]): Set<string> => new Set(arr);

export function useReadingProgress() {
  const [progress, setProgress] = useState<ReadingProgress>({
    readAyahs: new Set(),
    percentage: 0,
    totalRead: 0,
  });

  // Load progress from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        const readAyahs = arrayToSet(parsed.readAyahs || []);
        const totalRead = readAyahs.size;
        const percentage = Math.round((totalRead / TOTAL_AYAHS) * 100 * 10) / 10;
        setProgress({ readAyahs, percentage, totalRead });
      }
    } catch (e) {
      console.error("Error loading reading progress:", e);
    }
  }, []);

  // Mark an ayah as read
  const markAsRead = useCallback((surahNumber: number, ayahNumber: number) => {
    const key = `${surahNumber}:${ayahNumber}`;
    
    setProgress((prev) => {
      if (prev.readAyahs.has(key)) return prev;
      
      const newReadAyahs = new Set(prev.readAyahs);
      newReadAyahs.add(key);
      
      const totalRead = newReadAyahs.size;
      const percentage = Math.round((totalRead / TOTAL_AYAHS) * 100 * 10) / 10;
      
      // Save to localStorage
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify({
          readAyahs: setToArray(newReadAyahs),
        }));
      } catch (e) {
        console.error("Error saving reading progress:", e);
      }
      
      return { readAyahs: newReadAyahs, percentage, totalRead };
    });
  }, []);

  // Check if an ayah is read
  const isRead = useCallback((surahNumber: number, ayahNumber: number): boolean => {
    return progress.readAyahs.has(`${surahNumber}:${ayahNumber}`);
  }, [progress.readAyahs]);

  // Reset progress
  const resetProgress = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    setProgress({ readAyahs: new Set(), percentage: 0, totalRead: 0 });
  }, []);

  return {
    percentage: progress.percentage,
    totalRead: progress.totalRead,
    totalAyahs: TOTAL_AYAHS,
    markAsRead,
    isRead,
    resetProgress,
  };
}
