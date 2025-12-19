// Quran API client using alquran.cloud and LOCAL tafsir database
// Tafsir content is stored locally - NO external API calls for tafsir

const ALQURAN_API = "https://api.alquran.cloud/v1";

export interface Surah {
  number: number;
  name: string;
  englishName: string;
  englishNameTranslation: string;
  numberOfAyahs: number;
  revelationType: "Meccan" | "Medinan";
}

export interface Ayah {
  number: number;
  text: string;
  numberInSurah: number;
  juz: number;
  manzil: number;
  page: number;
  ruku: number;
  hizbQuarter: number;
  sajda: boolean | { id: number; recommended: boolean; obligatory: boolean };
}

export interface SurahDetails extends Surah {
  ayahs: Ayah[];
}

export interface ApiResponse<T> {
  code: number;
  status: string;
  data: T;
}

// New schema types matching database
export interface TafsirSource {
  id: string;
  tafsir_key: string;
  tafsir_name_ar: string;
  author_ar: string;
  api_id: number;
  enabled: boolean;
  display_order: number;
}

export interface TafsirText {
  id: string;
  surah_number: number;
  ayah_number: number;
  tafsir_key: string;
  text_ar: string;
}

// Cache for API responses
const cache = new Map<string, { data: unknown; timestamp: number }>();
const CACHE_DURATION = 1000 * 60 * 60; // 1 hour

async function fetchWithCache<T>(url: string): Promise<T> {
  const cached = cache.get(url);
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.data as T;
  }

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`API Error: ${response.status}`);
  }

  const json = await response.json();
  
  // Handle AlQuran.cloud API response format
  if (json.code !== undefined) {
    if (json.code !== 200) {
      throw new Error(`API Error: ${json.status}`);
    }
    cache.set(url, { data: json.data, timestamp: Date.now() });
    return json.data;
  }
  
  cache.set(url, { data: json, timestamp: Date.now() });
  return json;
}

// Get list of all 114 Surahs
export async function getAllSurahs(): Promise<Surah[]> {
  return fetchWithCache<Surah[]>(`${ALQURAN_API}/surah`);
}

// Get a single Surah with all its Ayahs in Arabic Uthmani script
export async function getSurah(surahNumber: number): Promise<SurahDetails> {
  if (surahNumber < 1 || surahNumber > 114) {
    throw new Error("Invalid Surah number. Must be between 1 and 114.");
  }
  return fetchWithCache<SurahDetails>(
    `${ALQURAN_API}/surah/${surahNumber}/ar.quran-uthmani`
  );
}

// Get Surah info without ayahs (lighter request)
export async function getSurahInfo(surahNumber: number): Promise<Surah> {
  const surahs = await getAllSurahs();
  const surah = surahs.find((s) => s.number === surahNumber);
  if (!surah) {
    throw new Error(`Surah ${surahNumber} not found`);
  }
  return surah;
}

// Generate URL-friendly slug from Surah info
export function getSurahSlug(surah: Surah): string {
  const englishName = surah.englishName
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
  return `${surah.number}-${englishName}`;
}

// Parse Surah number from URL slug
export function parseSurahSlug(slug: string): number {
  const match = slug.match(/^(\d+)/);
  if (!match) {
    throw new Error("Invalid Surah slug");
  }
  const number = parseInt(match[1], 10);
  if (number < 1 || number > 114) {
    throw new Error("Invalid Surah number");
  }
  return number;
}

// Normalize Arabic text for search (remove diacritics)
function normalizeForSearch(text: string): string {
  return text
    // Remove Arabic diacritics
    .replace(/[\u064B-\u0652\u0670\u0610-\u061A\u06D6-\u06ED]/g, '')
    // Normalize Alef variants
    .replace(/[أإآٱ]/g, 'ا')
    // Normalize Alef Maqsura
    .replace(/ى/g, 'ي')
    // Normalize Taa Marbuta (optional)
    .replace(/ة/g, 'ه')
    // Remove extra whitespace
    .replace(/\s+/g, ' ')
    .trim();
}

// Search Surahs by name or number
export function searchSurahs(surahs: Surah[], query: string): Surah[] {
  const trimmedQuery = query.trim();
  
  if (!trimmedQuery) {
    return surahs;
  }

  // Check if query is a number (Arabic or English)
  const arabicToEnglish: Record<string, string> = {
    '٠': '0', '١': '1', '٢': '2', '٣': '3', '٤': '4',
    '٥': '5', '٦': '6', '٧': '7', '٨': '8', '٩': '9'
  };
  
  const englishQuery = trimmedQuery
    .split('')
    .map(char => arabicToEnglish[char] || char)
    .join('');
  
  const numberQuery = parseInt(englishQuery, 10);
  if (!isNaN(numberQuery) && numberQuery >= 1 && numberQuery <= 114) {
    return surahs.filter((s) => s.number === numberQuery);
  }

  // Normalize query for Arabic search
  const normalizedQuery = normalizeForSearch(trimmedQuery);
  
  // Search by Arabic name (normalized)
  return surahs.filter((s) => {
    const normalizedName = normalizeForSearch(s.name);
    // Check if normalized name contains normalized query
    return normalizedName.includes(normalizedQuery) || 
           s.name.includes(trimmedQuery);
  });
}

// Convert Arabic numerals to Eastern Arabic numerals (٠١٢٣٤٥٦٧٨٩)
export function toArabicNumerals(num: number): string {
  const arabicNumerals = ["٠", "١", "٢", "٣", "٤", "٥", "٦", "٧", "٨", "٩"];
  return num
    .toString()
    .split("")
    .map((digit) => arabicNumerals[parseInt(digit, 10)] || digit)
    .join("");
}

// Default tafsir keys - these match the tafsir_sources table
export const DEFAULT_TAFSIR_KEYS = [
  'ibn-kathir',
  'saadi', 
  'tabari',
  'qurtubi',
  'jalalayn',
] as const;

// Revelation type in Arabic
export function getRevelationTypeArabic(type: "Meccan" | "Medinan"): string {
  return type === "Meccan" ? "مكية" : "مدنية";
}
