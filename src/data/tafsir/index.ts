// Local Tafsir Data Loader
import { TAFSIR_SOURCES, LocalTafsirSource, isArabicText } from './sources';

export interface TafsirEntry {
  surah: number;
  ayah: number;
  text: string;
}

export interface TafsirData {
  [surahNumber: number]: {
    [ayahNumber: number]: string;
  };
}

// Cache for loaded tafsir data
const tafsirCache: Map<string, TafsirData> = new Map();

// Dynamic import for tafsir data
async function loadTafsirFile(tafsirKey: string): Promise<TafsirData> {
  // Check cache first
  if (tafsirCache.has(tafsirKey)) {
    return tafsirCache.get(tafsirKey)!;
  }

  try {
    // Dynamic import based on tafsir key
    let data: TafsirData;
    
    switch (tafsirKey) {
      case 'ibn-kathir':
        data = (await import('./content/ibn-kathir')).default;
        break;
      case 'saadi':
        data = (await import('./content/saadi')).default;
        break;
      case 'tabari':
        data = (await import('./content/tabari')).default;
        break;
      case 'qurtubi':
        data = (await import('./content/qurtubi')).default;
        break;
      case 'muyassar':
        data = (await import('./content/muyassar')).default;
        break;
      default:
        return {};
    }

    // Cache the loaded data
    tafsirCache.set(tafsirKey, data);
    return data;
  } catch (error) {
    console.error(`Failed to load tafsir: ${tafsirKey}`, error);
    return {};
  }
}

// Get tafsir text for a specific ayah
export async function getLocalTafsirText(
  tafsirKey: string,
  surahNumber: number,
  ayahNumber: number
): Promise<string | null> {
  const data = await loadTafsirFile(tafsirKey);
  
  const surahData = data[surahNumber];
  if (!surahData) return null;
  
  const text = surahData[ayahNumber];
  if (!text) return null;
  
  // Validate Arabic text
  if (!isArabicText(text)) {
    console.warn(`Non-Arabic text detected for ${tafsirKey} ${surahNumber}:${ayahNumber}`);
    return null;
  }
  
  return text;
}

// Get all tafsir sources
export function getTafsirSources(): LocalTafsirSource[] {
  return TAFSIR_SOURCES;
}

// Export types
export type { LocalTafsirSource };
export { isArabicText };
