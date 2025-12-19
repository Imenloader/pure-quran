// Arabic Smart Search Utilities
// Handles Arabic text normalization, diacritics removal, and intelligent matching

// Arabic diacritics (tashkeel) to remove
const ARABIC_DIACRITICS = /[\u064B-\u065F\u0670\u06D6-\u06ED]/g;

// Alef variants normalization map
const ALEF_VARIANTS = /[أإآٱ]/g;
const ALEF_NORMAL = 'ا';

// Yaa/Alef Maqsura normalization
const YAA_VARIANTS = /[ى]/g;
const YAA_NORMAL = 'ي';

// Taa Marbuta (optional, conservative approach)
const TAA_MARBUTA = /ة/g;

// Waw with hamza
const WAW_HAMZA = /ؤ/g;

// Yaa with hamza
const YAA_HAMZA = /ئ/g;

// Hamza variants
const HAMZA_VARIANTS = /[ء]/g;

// Kashida/Tatweel removal
const KASHIDA = /ـ/g;

// Common Arabic punctuation and symbols to remove
const ARABIC_SYMBOLS = /[۩۞۝]/g;

// Quran-specific marks
const QURAN_MARKS = /[\u06D6-\u06ED]/g;

/**
 * Normalize Arabic text for search matching
 * Removes diacritics, normalizes letter variants
 */
export function normalizeArabicText(text: string): string {
  if (!text) return '';
  
  return text
    // Remove diacritics (tashkeel)
    .replace(ARABIC_DIACRITICS, '')
    // Remove Quran-specific marks
    .replace(QURAN_MARKS, '')
    // Remove kashida
    .replace(KASHIDA, '')
    // Remove Arabic symbols
    .replace(ARABIC_SYMBOLS, '')
    // Normalize Alef variants
    .replace(ALEF_VARIANTS, ALEF_NORMAL)
    // Normalize Yaa/Alef Maqsura
    .replace(YAA_VARIANTS, YAA_NORMAL)
    // Trim and normalize whitespace
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Extended normalization with Taa Marbuta handling
 * Used for fuzzy matching when exact match fails
 */
export function normalizeArabicTextExtended(text: string): string {
  return normalizeArabicText(text)
    // Normalize Taa Marbuta to Haa
    .replace(TAA_MARBUTA, 'ه');
}

/**
 * Remove "ال" prefix for matching
 */
export function removeAlPrefix(text: string): string {
  const normalized = normalizeArabicText(text);
  // Match "ال" at word boundaries
  return normalized.replace(/\bال/g, '');
}

/**
 * Check if text matches query with various matching strategies
 */
export function matchesArabicQuery(text: string, query: string): {
  matches: boolean;
  score: number;
  matchType: 'exact' | 'phrase' | 'word' | 'partial' | 'fuzzy' | 'none';
} {
  const normalizedText = normalizeArabicText(text);
  const normalizedQuery = normalizeArabicText(query);
  
  if (!normalizedQuery) {
    return { matches: false, score: 0, matchType: 'none' };
  }
  
  // 1. Exact phrase match (highest score)
  if (normalizedText.includes(normalizedQuery)) {
    // Check if it's an exact phrase or word match
    const wordBoundaryRegex = new RegExp(`(^|\\s)${escapeRegex(normalizedQuery)}($|\\s)`);
    if (wordBoundaryRegex.test(normalizedText)) {
      return { matches: true, score: 100, matchType: 'exact' };
    }
    return { matches: true, score: 90, matchType: 'phrase' };
  }
  
  // 2. Match without "ال" prefix
  const textWithoutAl = removeAlPrefix(normalizedText);
  const queryWithoutAl = removeAlPrefix(normalizedQuery);
  
  if (textWithoutAl.includes(queryWithoutAl)) {
    return { matches: true, score: 85, matchType: 'word' };
  }
  
  // 3. Word-by-word matching for multi-word queries
  const queryWords = normalizedQuery.split(/\s+/);
  if (queryWords.length > 1) {
    const allWordsMatch = queryWords.every(word => {
      const wordWithoutAl = removeAlPrefix(word);
      return textWithoutAl.includes(wordWithoutAl) || normalizedText.includes(word);
    });
    if (allWordsMatch) {
      return { matches: true, score: 75, matchType: 'partial' };
    }
  }
  
  // 4. Extended normalization (Taa Marbuta)
  const extendedText = normalizeArabicTextExtended(text);
  const extendedQuery = normalizeArabicTextExtended(query);
  
  if (extendedText.includes(extendedQuery)) {
    return { matches: true, score: 60, matchType: 'fuzzy' };
  }
  
  return { matches: false, score: 0, matchType: 'none' };
}

/**
 * Escape regex special characters
 */
function escapeRegex(text: string): string {
  return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Highlight matching text in original (with diacritics) text
 */
export function highlightMatches(originalText: string, query: string): string {
  if (!query.trim()) return originalText;
  
  const normalizedQuery = normalizeArabicText(query);
  const queryWithoutAl = removeAlPrefix(normalizedQuery);
  
  // Build character mapping between original and normalized
  const charMap = buildCharacterMap(originalText);
  
  // Find matches in normalized text
  const normalizedText = normalizeArabicText(originalText);
  const matches: { start: number; end: number }[] = [];
  
  // Try different matching patterns
  const patterns = [
    normalizedQuery,
    queryWithoutAl.length >= 2 ? queryWithoutAl : null,
  ].filter(Boolean) as string[];
  
  for (const pattern of patterns) {
    let startIndex = 0;
    while (startIndex < normalizedText.length) {
      const matchIndex = normalizedText.indexOf(pattern, startIndex);
      if (matchIndex === -1) break;
      
      matches.push({
        start: matchIndex,
        end: matchIndex + pattern.length
      });
      startIndex = matchIndex + 1;
    }
  }
  
  if (matches.length === 0) return originalText;
  
  // Convert normalized indices to original indices
  const originalMatches = matches.map(m => ({
    start: charMap[m.start]?.originalIndex ?? 0,
    end: charMap[m.end - 1]?.originalEndIndex ?? originalText.length
  }));
  
  // Merge overlapping matches
  const mergedMatches = mergeOverlappingRanges(originalMatches);
  
  // Build highlighted text
  let result = '';
  let lastEnd = 0;
  
  for (const match of mergedMatches) {
    result += originalText.slice(lastEnd, match.start);
    result += `<mark class="bg-primary/20 text-primary px-0.5 rounded">${originalText.slice(match.start, match.end)}</mark>`;
    lastEnd = match.end;
  }
  result += originalText.slice(lastEnd);
  
  return result;
}

/**
 * Build a mapping from normalized text indices to original text indices
 */
function buildCharacterMap(originalText: string): { originalIndex: number; originalEndIndex: number }[] {
  const map: { originalIndex: number; originalEndIndex: number }[] = [];
  let normalizedIndex = 0;
  
  for (let i = 0; i < originalText.length; i++) {
    const char = originalText[i];
    const normalizedChar = normalizeArabicText(char);
    
    if (normalizedChar.length > 0) {
      // Find the end of this character group (including following diacritics)
      let endIndex = i + 1;
      while (endIndex < originalText.length && normalizeArabicText(originalText[endIndex]).length === 0) {
        endIndex++;
      }
      
      map[normalizedIndex] = {
        originalIndex: i,
        originalEndIndex: endIndex
      };
      normalizedIndex++;
    }
  }
  
  return map;
}

/**
 * Merge overlapping ranges
 */
function mergeOverlappingRanges(ranges: { start: number; end: number }[]): { start: number; end: number }[] {
  if (ranges.length === 0) return [];
  
  const sorted = [...ranges].sort((a, b) => a.start - b.start);
  const merged: { start: number; end: number }[] = [sorted[0]];
  
  for (let i = 1; i < sorted.length; i++) {
    const current = sorted[i];
    const last = merged[merged.length - 1];
    
    if (current.start <= last.end) {
      last.end = Math.max(last.end, current.end);
    } else {
      merged.push(current);
    }
  }
  
  return merged;
}

/**
 * Common Quran search corrections
 */
const COMMON_CORRECTIONS: Record<string, string[]> = {
  'رحمن': ['الرحمن', 'رحمان'],
  'الرحمن': ['رحمن', 'رحمان'],
  'صراط': ['سراط', 'الصراط'],
  'سراط': ['صراط', 'الصراط'],
  'الصراط': ['صراط', 'سراط'],
  'مستقيم': ['المستقيم'],
  'المستقيم': ['مستقيم'],
  'عليهم': ['عليم'],
  'انعمت': ['أنعمت'],
  'المغضوب': ['مغضوب'],
  'الضالين': ['ضالين'],
};

/**
 * Get search suggestions for a query
 */
export function getSearchSuggestions(query: string): string[] {
  const normalizedQuery = normalizeArabicText(query).toLowerCase();
  const suggestions: string[] = [];
  
  // Check common corrections
  for (const [key, values] of Object.entries(COMMON_CORRECTIONS)) {
    const normalizedKey = normalizeArabicText(key);
    if (normalizedKey.includes(normalizedQuery) || normalizedQuery.includes(normalizedKey)) {
      suggestions.push(...values);
    }
  }
  
  // Remove duplicates and the original query
  return [...new Set(suggestions)].filter(s => normalizeArabicText(s) !== normalizedQuery).slice(0, 3);
}

/**
 * Result type for search
 */
export interface SearchResult {
  surahNumber: number;
  surahName: string;
  ayahNumber: number;
  text: string;
  highlightedText: string;
  score: number;
  matchType: 'exact' | 'phrase' | 'word' | 'partial' | 'fuzzy' | 'none';
}

/**
 * Search options
 */
export interface SearchOptions {
  surahNumber?: number;
  limit?: number;
}
