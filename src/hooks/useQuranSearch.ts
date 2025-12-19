import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getAllSurahs, getSurah, SurahDetails, Surah } from '@/lib/quran-api';
import {
  normalizeArabicText,
  matchesArabicQuery,
  highlightMatches,
  getSearchSuggestions,
  SearchResult,
  SearchOptions,
} from '@/lib/arabic-search';

// Cache for all Quran data - stored outside hook to persist across renders
const quranDataCache: Map<number, SurahDetails> = new Map();

/**
 * Fetch a single surah with caching
 */
async function fetchSurah(surahNumber: number): Promise<SurahDetails> {
  if (quranDataCache.has(surahNumber)) {
    return quranDataCache.get(surahNumber)!;
  }
  
  const surah = await getSurah(surahNumber);
  quranDataCache.set(surahNumber, surah);
  return surah;
}

/**
 * Fetch all surahs for global search
 */
async function fetchAllSurahs(): Promise<SurahDetails[]> {
  // If we have all 114, return cached
  if (quranDataCache.size === 114) {
    return Array.from(quranDataCache.values()).sort((a, b) => a.number - b.number);
  }

  const surahs = await getAllSurahs();
  
  // Fetch in batches of 20 for speed
  const batchSize = 20;
  for (let i = 0; i < surahs.length; i += batchSize) {
    const batch = surahs.slice(i, i + batchSize);
    const batchData = await Promise.all(
      batch.map(s => {
        if (quranDataCache.has(s.number)) {
          return quranDataCache.get(s.number)!;
        }
        return getSurah(s.number);
      })
    );
    batchData.forEach(s => quranDataCache.set(s.number, s));
  }

  return Array.from(quranDataCache.values()).sort((a, b) => a.number - b.number);
}

/**
 * Hook for smart Quran search
 */
export function useQuranSearch(options: SearchOptions = {}) {
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const searchInSpecificSurah = !!options.surahNumber;

  // For single surah search - fetch only that surah
  const {
    data: singleSurah,
    isLoading: isLoadingSingleSurah,
    isFetching: isFetchingSingleSurah,
  } = useQuery({
    queryKey: ['surah-search', options.surahNumber],
    queryFn: () => fetchSurah(options.surahNumber!),
    enabled: searchInSpecificSurah,
    staleTime: 1000 * 60 * 60 * 24,
    gcTime: 1000 * 60 * 60 * 24 * 7,
  });

  // For global search - fetch all surahs
  const {
    data: allSurahs,
    isLoading: isLoadingAll,
    isFetching: isFetchingAll,
  } = useQuery({
    queryKey: ['quran-full-data'],
    queryFn: fetchAllSurahs,
    enabled: !searchInSpecificSurah, // Only fetch all when no specific surah
    staleTime: 1000 * 60 * 60 * 24,
    gcTime: 1000 * 60 * 60 * 24 * 7,
  });

  // Fetch surah list for dropdown
  const { data: surahList } = useQuery({
    queryKey: ['surahs'],
    queryFn: getAllSurahs,
    staleTime: 1000 * 60 * 60 * 24,
  });

  // Debounce search query
  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    if (!query.trim()) {
      setDebouncedQuery('');
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    searchTimeoutRef.current = setTimeout(() => {
      setDebouncedQuery(query);
      setIsSearching(false);
    }, 250); // Faster debounce for better UX

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [query]);

  // Determine which data to search
  const searchData = useMemo((): SurahDetails[] => {
    if (searchInSpecificSurah) {
      return singleSurah ? [singleSurah] : [];
    }
    return allSurahs || [];
  }, [searchInSpecificSurah, singleSurah, allSurahs]);

  // Check if data is ready
  const isDataReady = searchInSpecificSurah 
    ? !!singleSurah 
    : (allSurahs && allSurahs.length > 0);

  // Loading state
  const isLoadingData = searchInSpecificSurah
    ? (isLoadingSingleSurah || isFetchingSingleSurah)
    : (isLoadingAll || isFetchingAll);

  // Perform search
  const results = useMemo((): SearchResult[] => {
    const trimmedQuery = debouncedQuery.trim();
    
    if (!trimmedQuery || searchData.length === 0) {
      return [];
    }

    const searchResults: SearchResult[] = [];

    for (const surah of searchData) {
      if (!surah || !surah.ayahs) continue;
      
      for (const ayah of surah.ayahs) {
        if (!ayah || !ayah.text) continue;
        
        const { matches, score, matchType } = matchesArabicQuery(ayah.text, trimmedQuery);

        if (matches) {
          searchResults.push({
            surahNumber: surah.number,
            surahName: surah.name,
            ayahNumber: ayah.numberInSurah,
            text: ayah.text,
            highlightedText: highlightMatches(ayah.text, trimmedQuery),
            score,
            matchType,
          });
        }
      }
    }

    // Sort by score (highest first), then by surah order
    return searchResults
      .sort((a, b) => {
        if (b.score !== a.score) return b.score - a.score;
        if (a.surahNumber !== b.surahNumber) return a.surahNumber - b.surahNumber;
        return a.ayahNumber - b.ayahNumber;
      })
      .slice(0, options.limit || 100);
  }, [debouncedQuery, searchData, options.limit]);

  // Get suggestions
  const suggestions = useMemo(() => {
    if (!query.trim() || query.length < 2) return [];
    return getSearchSuggestions(query);
  }, [query]);

  // Search handler
  const search = useCallback((newQuery: string) => {
    setQuery(newQuery);
  }, []);

  // Clear search
  const clearSearch = useCallback(() => {
    setQuery('');
    setDebouncedQuery('');
  }, []);

  // Has the user searched and is data ready?
  const hasSearched = !!debouncedQuery.trim() && isDataReady;

  return {
    query,
    search,
    clearSearch,
    results,
    suggestions,
    isSearching: isSearching || (!!debouncedQuery.trim() && isLoadingData),
    isLoadingQuran: isLoadingData,
    loadError: null,
    surahList,
    totalResults: results.length,
    hasSearched,
    dataReady: isDataReady,
    searchInSpecificSurah,
  };
}

/**
 * Hook for getting autocomplete suggestions
 */
export function useQuranAutocomplete() {
  // Common Quran words for autocomplete
  const commonWords = useMemo(() => {
    return [
      'الله', 'الرحمن', 'الرحيم', 'رب', 'العالمين',
      'الصلاة', 'الزكاة', 'المؤمنين', 'الكافرين',
      'الجنة', 'النار', 'الصراط', 'المستقيم',
      'بسم', 'الحمد', 'إياك', 'نعبد', 'نستعين',
      'اهدنا', 'أنعمت', 'المغضوب', 'الضالين',
      'قل', 'آمنوا', 'كفروا', 'عملوا', 'الصالحات',
    ];
  }, []);

  const getAutocompleteSuggestions = useCallback((query: string): string[] => {
    if (!query.trim() || query.length < 2) return [];
    
    const normalizedQuery = normalizeArabicText(query);
    
    return commonWords
      .filter(word => {
        const normalizedWord = normalizeArabicText(word);
        return normalizedWord.includes(normalizedQuery) || 
               normalizedQuery.includes(normalizedWord);
      })
      .slice(0, 5);
  }, [commonWords]);

  return {
    getAutocompleteSuggestions,
    commonWords,
  };
}
