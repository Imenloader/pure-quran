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

// Cache for all Quran data
let quranDataCache: { surahs: SurahDetails[]; indexed: boolean } | null = null;

/**
 * Fetch and cache all Quran data for fast searching
 */
async function fetchAllQuranData(): Promise<SurahDetails[]> {
  if (quranDataCache?.indexed) {
    return quranDataCache.surahs;
  }

  const surahs = await getAllSurahs();
  const surahsData: SurahDetails[] = [];

  // Fetch surahs in batches to avoid rate limiting
  const batchSize = 10;
  for (let i = 0; i < surahs.length; i += batchSize) {
    const batch = surahs.slice(i, i + batchSize);
    const batchData = await Promise.all(
      batch.map(s => getSurah(s.number))
    );
    surahsData.push(...batchData);
  }

  quranDataCache = { surahs: surahsData, indexed: true };
  return surahsData;
}

/**
 * Hook for smart Quran search
 */
export function useQuranSearch(options: SearchOptions = {}) {
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Fetch all Quran data
  const {
    data: allSurahs,
    isLoading: isLoadingQuran,
    error: loadError,
  } = useQuery({
    queryKey: ['quran-full-data'],
    queryFn: fetchAllQuranData,
    staleTime: 1000 * 60 * 60 * 24, // 24 hours
    gcTime: 1000 * 60 * 60 * 24 * 7, // 7 days
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
    }, 300);

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [query]);

  // Perform search
  const results = useMemo((): SearchResult[] => {
    if (!debouncedQuery.trim() || !allSurahs) {
      return [];
    }

    const searchResults: SearchResult[] = [];
    const surahsToSearch = options.surahNumber
      ? allSurahs.filter(s => s.number === options.surahNumber)
      : allSurahs;

    for (const surah of surahsToSearch) {
      for (const ayah of surah.ayahs) {
        const { matches, score, matchType } = matchesArabicQuery(ayah.text, debouncedQuery);

        if (matches) {
          searchResults.push({
            surahNumber: surah.number,
            surahName: surah.name,
            ayahNumber: ayah.numberInSurah,
            text: ayah.text,
            highlightedText: highlightMatches(ayah.text, debouncedQuery),
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
  }, [debouncedQuery, allSurahs, options.surahNumber, options.limit]);

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

  return {
    query,
    search,
    clearSearch,
    results,
    suggestions,
    isSearching: isSearching || (!!debouncedQuery && isLoadingQuran),
    isLoadingQuran,
    loadError,
    surahList,
    totalResults: results.length,
    hasSearched: !!debouncedQuery.trim(),
  };
}

/**
 * Hook for getting autocomplete suggestions
 */
export function useQuranAutocomplete() {
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const { data: allSurahs } = useQuery({
    queryKey: ['quran-full-data'],
    queryFn: fetchAllQuranData,
    staleTime: 1000 * 60 * 60 * 24,
  });

  // Common Quran words for autocomplete
  const commonWords = useMemo(() => {
    const words = new Set<string>();
    
    // Add common Quran words
    const frequentWords = [
      'الله', 'الرحمن', 'الرحيم', 'رب', 'العالمين',
      'الصلاة', 'الزكاة', 'المؤمنين', 'الكافرين',
      'الجنة', 'النار', 'الصراط', 'المستقيم',
      'بسم', 'الحمد', 'إياك', 'نعبد', 'نستعين',
      'اهدنا', 'أنعمت', 'المغضوب', 'الضالين',
      'قل', 'آمنوا', 'كفروا', 'عملوا', 'الصالحات',
    ];
    
    frequentWords.forEach(w => words.add(w));
    return Array.from(words);
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
