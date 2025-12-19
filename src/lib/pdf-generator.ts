import { jsPDF } from "jspdf";
import { SurahDetails, toArabicNumerals } from "@/lib/quran-api";

// Generate PDF for a Surah
export async function generateSurahPDF(surah: SurahDetails): Promise<void> {
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  // Add Arabic font support - use built-in Helvetica for now
  // For proper Arabic support, we'd need to embed an Arabic font
  
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 20;
  const lineHeight = 10;
  let yPosition = margin;

  // Title
  doc.setFontSize(24);
  doc.setFont("helvetica", "bold");
  
  // Surah name (will appear as Unicode, works in most PDF viewers)
  const title = surah.name;
  doc.text(title, pageWidth / 2, yPosition, { align: "center" });
  yPosition += 15;

  // Surah info
  doc.setFontSize(12);
  doc.setFont("helvetica", "normal");
  const info = `${toArabicNumerals(surah.numberOfAyahs)} آية`;
  doc.text(info, pageWidth / 2, yPosition, { align: "center" });
  yPosition += 15;

  // Separator line
  doc.setDrawColor(200);
  doc.line(margin, yPosition, pageWidth - margin, yPosition);
  yPosition += 10;

  // Bismillah (except for Surah 1 and 9)
  if (surah.number !== 1 && surah.number !== 9) {
    doc.setFontSize(14);
    const bismillah = "بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ";
    doc.text(bismillah, pageWidth / 2, yPosition, { align: "center" });
    yPosition += 15;
  }

  // Ayahs
  doc.setFontSize(14);
  
  for (const ayah of surah.ayahs) {
    const ayahText = `${ayah.text} ﴿${toArabicNumerals(ayah.numberInSurah)}﴾`;
    
    // Split text into lines that fit the page width
    const textWidth = pageWidth - (margin * 2);
    const lines = doc.splitTextToSize(ayahText, textWidth);
    
    // Check if we need a new page
    const textHeight = lines.length * lineHeight;
    if (yPosition + textHeight > pageHeight - margin) {
      doc.addPage();
      yPosition = margin;
    }
    
    // Add text (right-aligned for Arabic)
    for (const line of lines) {
      doc.text(line, pageWidth - margin, yPosition, { align: "right" });
      yPosition += lineHeight;
    }
    
    yPosition += 3; // Space between ayahs
  }

  // Save the PDF
  const fileName = `${surah.englishName}-${surah.number}.pdf`;
  doc.save(fileName);
}

// Generate PDF for favorite ayahs
export async function generateFavoritesPDF(
  favorites: Array<{ surahName: string; surahNumber: number; ayahNumber: number; text: string }>
): Promise<void> {
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 20;
  const lineHeight = 10;
  let yPosition = margin;

  // Title
  doc.setFontSize(24);
  doc.setFont("helvetica", "bold");
  doc.text("الآيات المفضلة", pageWidth / 2, yPosition, { align: "center" });
  yPosition += 15;

  // Separator line
  doc.setDrawColor(200);
  doc.line(margin, yPosition, pageWidth - margin, yPosition);
  yPosition += 10;

  doc.setFontSize(14);
  doc.setFont("helvetica", "normal");

  for (const fav of favorites) {
    // Surah info
    doc.setFont("helvetica", "bold");
    const surahInfo = `${fav.surahName} - الآية ${toArabicNumerals(fav.ayahNumber)}`;
    doc.text(surahInfo, pageWidth - margin, yPosition, { align: "right" });
    yPosition += lineHeight;

    // Ayah text
    doc.setFont("helvetica", "normal");
    const ayahText = `${fav.text} ﴿${toArabicNumerals(fav.ayahNumber)}﴾`;
    const textWidth = pageWidth - (margin * 2);
    const lines = doc.splitTextToSize(ayahText, textWidth);

    const textHeight = lines.length * lineHeight;
    if (yPosition + textHeight > pageHeight - margin) {
      doc.addPage();
      yPosition = margin;
    }

    for (const line of lines) {
      doc.text(line, pageWidth - margin, yPosition, { align: "right" });
      yPosition += lineHeight;
    }

    yPosition += 8; // Space between favorites
  }

  doc.save("favorites.pdf");
}