// Local Tafsir Sources - Arabic Only
export interface LocalTafsirSource {
  key: string;
  name: string;
  author: string;
  displayOrder: number;
}

export const TAFSIR_SOURCES: LocalTafsirSource[] = [
  {
    key: "ibn-kathir",
    name: "تفسير ابن كثير",
    author: "ابن كثير",
    displayOrder: 1,
  },
  {
    key: "saadi",
    name: "تفسير السعدي",
    author: "عبد الرحمن السعدي",
    displayOrder: 2,
  },
  {
    key: "tabari",
    name: "تفسير الطبري",
    author: "ابن جرير الطبري",
    displayOrder: 3,
  },
  {
    key: "qurtubi",
    name: "تفسير القرطبي",
    author: "القرطبي",
    displayOrder: 4,
  },
  {
    key: "muyassar",
    name: "التفسير الميسر",
    author: "مجمع الملك فهد",
    displayOrder: 5,
  },
];

// Arabic Unicode range check
export function isArabicText(text: string): boolean {
  if (!text || text.trim().length === 0) return false;
  
  // Count Arabic characters
  const arabicPattern = /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]/g;
  const arabicMatches = text.match(arabicPattern) || [];
  const totalLetters = text.replace(/[\s\d\p{P}]/gu, '').length;
  
  // Must be at least 60% Arabic
  return totalLetters > 0 && (arabicMatches.length / totalLetters) >= 0.6;
}
