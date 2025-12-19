// Quran API client using alquran.cloud and Quran Foundation APIs
// Documentation: https://alquran.cloud/api
// Tafsir: https://api.quran.com/api/v4/resources/tafsirs

const ALQURAN_API = "https://api.alquran.cloud/v1";
const QURAN_COM_API = "https://api.quran.com/api/v4";

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

export interface TafsirResource {
  id: number;
  name: string;
  author_name: string;
  slug: string;
  language_name: string;
  translated_name: {
    name: string;
    language_name: string;
  };
}

export interface TafsirContent {
  resource_id: number;
  resource_name: string;
  text: string;
  verse_key: string;
  language_id: number;
}

export interface Translation {
  id: number;
  name: string;
  author_name: string;
  slug: string;
  language_name: string;
  translated_name: {
    name: string;
    language_name: string;
  };
}

export interface TranslationContent {
  resource_id: number;
  resource_name: string;
  text: string;
  verse_key: string;
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
  
  // Handle Quran.com API response format
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

// Get a single Ayah
export async function getAyah(surahNumber: number, ayahNumber: number): Promise<Ayah & { surah: Surah }> {
  const surah = await getSurah(surahNumber);
  const ayah = surah.ayahs.find(a => a.numberInSurah === ayahNumber);
  if (!ayah) {
    throw new Error(`Ayah ${ayahNumber} not found in Surah ${surahNumber}`);
  }
  return { ...ayah, surah };
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

// Get available tafsirs from Quran Foundation API
export async function getAvailableTafsirs(): Promise<TafsirResource[]> {
  const response = await fetchWithCache<{ tafsirs: TafsirResource[] }>(
    `${QURAN_COM_API}/resources/tafsirs`
  );
  // Filter to get Arabic tafsirs primarily
  return response.tafsirs;
}

// Get tafsir content for a specific ayah
export async function getTafsirForAyah(
  surahNumber: number,
  ayahNumber: number,
  tafsirId: number
): Promise<TafsirContent | null> {
  try {
    const verseKey = `${surahNumber}:${ayahNumber}`;
    const response = await fetchWithCache<{ tafsir: TafsirContent }>(
      `${QURAN_COM_API}/tafsirs/${tafsirId}/by_ayah/${verseKey}`
    );
    return response.tafsir || null;
  } catch {
    return null;
  }
}

// Get multiple tafsirs for an ayah
export async function getMultipleTafsirsForAyah(
  surahNumber: number,
  ayahNumber: number,
  tafsirIds: number[]
): Promise<Map<number, TafsirContent | null>> {
  const results = new Map<number, TafsirContent | null>();
  await Promise.all(
    tafsirIds.map(async (id) => {
      const content = await getTafsirForAyah(surahNumber, ayahNumber, id);
      results.set(id, content);
    })
  );
  return results;
}

// Get available translations
export async function getAvailableTranslations(): Promise<Translation[]> {
  const response = await fetchWithCache<{ translations: Translation[] }>(
    `${QURAN_COM_API}/resources/translations`
  );
  return response.translations;
}

// Get translation for an ayah
export async function getTranslationForAyah(
  surahNumber: number,
  ayahNumber: number,
  translationId: number
): Promise<TranslationContent | null> {
  try {
    const response = await fetchWithCache<{ translations: TranslationContent[] }>(
      `${QURAN_COM_API}/verses/by_key/${surahNumber}:${ayahNumber}/translations/${translationId}`
    );
    return response.translations?.[0] || null;
  } catch {
    return null;
  }
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

// Search Surahs by name or number
export function searchSurahs(surahs: Surah[], query: string): Surah[] {
  const normalizedQuery = query.toLowerCase().trim();
  
  if (!normalizedQuery) {
    return surahs;
  }

  // Check if query is a number
  const numberQuery = parseInt(normalizedQuery, 10);
  if (!isNaN(numberQuery)) {
    return surahs.filter((s) => s.number === numberQuery);
  }

  // Search by English name or Arabic name
  return surahs.filter(
    (s) =>
      s.englishName.toLowerCase().includes(normalizedQuery) ||
      s.englishNameTranslation.toLowerCase().includes(normalizedQuery) ||
      s.name.includes(query) // Arabic search
  );
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

// Get navigation info for an ayah
export function getAyahNavigation(surahNumber: number, ayahNumber: number, totalAyahs: number) {
  const hasPrev = ayahNumber > 1 || surahNumber > 1;
  const hasNext = ayahNumber < totalAyahs || surahNumber < 114;
  
  let prevSurah = surahNumber;
  let prevAyah = ayahNumber - 1;
  let nextSurah = surahNumber;
  let nextAyah = ayahNumber + 1;
  
  if (ayahNumber === 1 && surahNumber > 1) {
    prevSurah = surahNumber - 1;
    prevAyah = -1; // Will need to fetch previous surah's total ayahs
  }
  
  if (ayahNumber >= totalAyahs && surahNumber < 114) {
    nextSurah = surahNumber + 1;
    nextAyah = 1;
  }
  
  return { hasPrev, hasNext, prevSurah, prevAyah, nextSurah, nextAyah };
}

// Default tafsirs to show (popular Arabic and English)
export const DEFAULT_TAFSIR_IDS = [
  169, // Ibn Kathir (Arabic)
  164, // Al-Tabari
  93,  // Ibn Kathir (English)
];

// Popular tafsirs for quick access
export const POPULAR_TAFSIRS = [
  { id: 169, name: "تفسير ابن كثير", nameEn: "Ibn Kathir (Arabic)" },
  { id: 164, name: "تفسير الطبري", nameEn: "Al-Tabari" },
  { id: 93, name: "Ibn Kathir (English)", nameEn: "Ibn Kathir (English)" },
  { id: 168, name: "تفسير القرطبي", nameEn: "Al-Qurtubi" },
  { id: 166, name: "تفسير البغوي", nameEn: "Al-Baghawi" },
];
