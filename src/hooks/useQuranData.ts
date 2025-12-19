import { useQuery } from "@tanstack/react-query";
import { getAllSurahs, getSurah, Surah, SurahDetails } from "@/lib/quran-api";

export function useAllSurahs() {
  return useQuery<Surah[], Error>({
    queryKey: ["surahs"],
    queryFn: getAllSurahs,
    staleTime: 1000 * 60 * 60 * 24, // 24 hours
    gcTime: 1000 * 60 * 60 * 24 * 7, // 7 days
  });
}

export function useSurah(surahNumber: number) {
  return useQuery<SurahDetails, Error>({
    queryKey: ["surah", surahNumber],
    queryFn: () => getSurah(surahNumber),
    enabled: surahNumber >= 1 && surahNumber <= 114,
    staleTime: 1000 * 60 * 60 * 24, // 24 hours
    gcTime: 1000 * 60 * 60 * 24 * 7, // 7 days
  });
}
