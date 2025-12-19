import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { getAllSurahs, getSurah, SurahDetails } from '@/lib/quran-api';

// Global cache for Quran data
const quranCache: Map<number, SurahDetails> = new Map();
let isPreloading = false;
let preloadComplete = false;

/**
 * Preload all Quran surahs in the background
 */
async function preloadAllSurahs(
  onProgress?: (loaded: number, total: number) => void
): Promise<void> {
  if (isPreloading || preloadComplete) return;
  
  isPreloading = true;
  
  try {
    const surahs = await getAllSurahs();
    const total = surahs.length;
    let loaded = 0;
    
    // Preload in batches of 10 for better performance
    const batchSize = 10;
    
    for (let i = 0; i < surahs.length; i += batchSize) {
      const batch = surahs.slice(i, i + batchSize);
      
      await Promise.all(
        batch.map(async (surah) => {
          if (!quranCache.has(surah.number)) {
            try {
              const data = await getSurah(surah.number);
              quranCache.set(surah.number, data);
            } catch (e) {
              console.error(`Failed to preload surah ${surah.number}:`, e);
            }
          }
          loaded++;
          onProgress?.(loaded, total);
        })
      );
      
      // Small delay between batches to avoid rate limiting
      if (i + batchSize < surahs.length) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    }
    
    preloadComplete = true;
  } finally {
    isPreloading = false;
  }
}

/**
 * Get cached surah data
 */
export function getCachedSurah(surahNumber: number): SurahDetails | undefined {
  return quranCache.get(surahNumber);
}

/**
 * Check if all data is preloaded
 */
export function isQuranPreloaded(): boolean {
  return preloadComplete && quranCache.size === 114;
}

/**
 * Get preload progress
 */
export function getPreloadProgress(): { loaded: number; total: number } {
  return { loaded: quranCache.size, total: 114 };
}

/**
 * Hook to preload Quran data in the background
 */
export function useQuranPreloader() {
  const queryClient = useQueryClient();
  
  useEffect(() => {
    // Start preloading after a short delay to not block initial render
    const timeout = setTimeout(() => {
      preloadAllSurahs((loaded, total) => {
        // Update progress silently
        if (loaded % 10 === 0 || loaded === total) {
          console.log(`Preloaded ${loaded}/${total} surahs`);
        }
      }).then(() => {
        // Populate React Query cache with preloaded data
        quranCache.forEach((surah, number) => {
          queryClient.setQueryData(['surah', number], surah);
          queryClient.setQueryData(['surah-search', number], surah);
        });
        
        // Set full data cache
        const allSurahs = Array.from(quranCache.values()).sort((a, b) => a.number - b.number);
        queryClient.setQueryData(['quran-full-data'], allSurahs);
        
        console.log('Quran data preload complete');
      });
    }, 1000);
    
    return () => clearTimeout(timeout);
  }, [queryClient]);
  
  return {
    isPreloaded: isQuranPreloaded(),
    progress: getPreloadProgress(),
  };
}
