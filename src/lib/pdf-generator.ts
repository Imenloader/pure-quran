// PDF Generation is currently disabled
// Arabic text requires server-side rendering with embedded fonts for proper display.
// Client-side PDF libraries (jsPDF, html2canvas) do not support Arabic shaping and ligatures.
// 
// To properly generate Arabic PDFs, you would need:
// 1. Server-side rendering with Puppeteer/Playwright
// 2. Properly embedded Arabic Uthmani fonts
// 3. RTL layout support
//
// This feature will be implemented when a proper backend PDF service is available.

import { SurahDetails, toArabicNumerals } from "@/lib/quran-api";

// PDF generation is disabled - returns false to indicate unavailability
export function isPDFAvailable(): boolean {
  return false;
}

// Placeholder function - does nothing since PDF is disabled
export async function generateSurahPDF(surah: SurahDetails): Promise<void> {
  throw new Error("تحميل PDF غير متوفر حالياً. يتطلب خادم متخصص لدعم النص العربي.");
}

// Placeholder function - does nothing since PDF is disabled
export async function generateFavoritesPDF(
  favorites: Array<{ surahName: string; surahNumber: number; ayahNumber: number; text: string }>
): Promise<void> {
  throw new Error("تحميل PDF غير متوفر حالياً. يتطلب خادم متخصص لدعم النص العربي.");
}
