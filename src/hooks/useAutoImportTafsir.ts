import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { ARABIC_TAFSIRS } from "@/lib/quran-api";

const AUTO_IMPORT_KEY = "tafsir_auto_import_started";

interface ImportProgress {
  isImporting: boolean;
  currentTafsir: string | null;
  currentSurah: number;
  totalProgress: number;
}

export const useAutoImportTafsir = () => {
  const [progress, setProgress] = useState<ImportProgress>({
    isImporting: false,
    currentTafsir: null,
    currentSurah: 0,
    totalProgress: 0,
  });

  const checkIfNeedsImport = useCallback(async (): Promise<boolean> => {
    // Check if already started import before
    const alreadyStarted = localStorage.getItem(AUTO_IMPORT_KEY);
    if (alreadyStarted) return false;

    // Check if any tafsir has data
    const { count } = await supabase
      .from("tafsir_content")
      .select("*", { count: "exact", head: true });

    return (count || 0) === 0;
  }, []);

  const importSurah = async (
    tafsirId: number,
    surahNumber: number
  ): Promise<boolean> => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/import-tafsir`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            action: "import",
            tafsirId,
            surahNumber,
          }),
        }
      );

      const data = await response.json();
      return data.success;
    } catch (err) {
      console.error("Import error:", err);
      return false;
    }
  };

  const startAutoImport = useCallback(async () => {
    const needsImport = await checkIfNeedsImport();
    if (!needsImport) return;

    // Mark as started
    localStorage.setItem(AUTO_IMPORT_KEY, "true");

    setProgress({
      isImporting: true,
      currentTafsir: null,
      currentSurah: 0,
      totalProgress: 0,
    });

    // Import first tafsir only (Ibn Kathir) to speed up initial experience
    const firstTafsir = ARABIC_TAFSIRS[0];
    
    setProgress((prev) => ({
      ...prev,
      currentTafsir: firstTafsir.name,
    }));

    for (let surah = 1; surah <= 114; surah++) {
      setProgress((prev) => ({
        ...prev,
        currentSurah: surah,
        totalProgress: Math.round((surah / 114) * 100),
      }));

      const success = await importSurah(firstTafsir.id, surah);
      if (!success) {
        console.error(`Failed to import surah ${surah}`);
        // Continue anyway
      }
    }

    setProgress({
      isImporting: false,
      currentTafsir: null,
      currentSurah: 0,
      totalProgress: 100,
    });
  }, [checkIfNeedsImport]);

  useEffect(() => {
    startAutoImport();
  }, [startAutoImport]);

  return progress;
};
