import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import { SettingsProvider } from "@/contexts/SettingsContext";
import { FavoritesProvider } from "@/contexts/FavoritesContext";
import { useAutoImportTafsir } from "@/hooks/useAutoImportTafsir";
import { AutoImportBanner } from "@/components/AutoImportBanner";
import Index from "./pages/Index";
import SurahPage from "./pages/SurahPage";
import AyahPage from "./pages/AyahPage";
import SearchPage from "./pages/SearchPage";
import FavoritesPage from "./pages/FavoritesPage";
import TafsirImportPage from "./pages/TafsirImportPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      refetchOnWindowFocus: false,
    },
  },
});

const AppContent = () => {
  const importProgress = useAutoImportTafsir();

  return (
    <>
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/search" element={<SearchPage />} />
        <Route path="/favorites" element={<FavoritesPage />} />
        <Route path="/tafsir-import" element={<TafsirImportPage />} />
        <Route path="/surah/:slug" element={<SurahPage />} />
        <Route path="/surah/:surahNumber/ayah/:ayahNumber" element={<AyahPage />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
      <AutoImportBanner {...importProgress} />
    </>
  );
};

const App = () => (
  <HelmetProvider>
    <QueryClientProvider client={queryClient}>
      <SettingsProvider>
        <FavoritesProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <AppContent />
            </BrowserRouter>
          </TooltipProvider>
        </FavoritesProvider>
      </SettingsProvider>
    </QueryClientProvider>
  </HelmetProvider>
);

export default App;