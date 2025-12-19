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

export interface LocalTafsirContent {
  id: string;
  surah_number: number;
  ayah_number: number;
  tafsir_id: number;
  tafsir_name: string;
  tafsir_author: string;
  text: string;
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

  // Search by Arabic name only
  return surahs.filter((s) => s.name.includes(query));
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

// STRICT ARABIC-ONLY TAFSIR WHITELIST
// Only these Arabic tafsir IDs are allowed - stored locally in database
export const ARABIC_TAFSIRS = [
  { id: 169, name: "تفسير ابن كثير", author: "ابن كثير" },
  { id: 170, name: "تفسير السعدي", author: "السعدي" },
  { id: 164, name: "تفسير الطبري", author: "الطبري" },
  { id: 168, name: "تفسير القرطبي", author: "القرطبي" },
  { id: 74, name: "تفسير الجلالين", author: "الجلالين" },
] as const;

// Whitelist of allowed Arabic tafsir IDs
export const ALLOWED_ARABIC_TAFSIR_IDS: Set<number> = new Set(ARABIC_TAFSIRS.map(t => t.id));

// Validate if a tafsir ID is in the Arabic whitelist
export function isArabicTafsir(tafsirId: number): boolean {
  return ALLOWED_ARABIC_TAFSIR_IDS.has(tafsirId);
}

// Revelation type in Arabic
export function getRevelationTypeArabic(type: "Meccan" | "Medinan"): string {
  return type === "Meccan" ? "مكية" : "مدنية";
}
