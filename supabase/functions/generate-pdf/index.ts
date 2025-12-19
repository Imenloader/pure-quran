import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Arabic number conversion
function toArabicNumerals(num: number): string {
  const arabicNumerals = ["٠", "١", "٢", "٣", "٤", "٥", "٦", "٧", "٨", "٩"];
  return num.toString().split("").map((digit) => arabicNumerals[parseInt(digit, 10)] || digit).join("");
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { surahNumber, ayahNumber, includeAyah, includeTafsir, tafsirKey } = await req.json();

    if (!surahNumber || !ayahNumber) {
      return new Response(JSON.stringify({ error: 'Missing surah or ayah number' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log(`Generating PDF for Surah ${surahNumber}:${ayahNumber}`);

    // Fetch Ayah text from Quran API
    let ayahText = '';
    if (includeAyah !== false) {
      try {
        const quranResponse = await fetch(
          `https://api.alquran.cloud/v1/surah/${surahNumber}/ar.quran-uthmani`
        );
        if (quranResponse.ok) {
          const quranData = await quranResponse.json();
          const ayah = quranData.data.ayahs.find((a: { numberInSurah: number }) => a.numberInSurah === ayahNumber);
          if (ayah) {
            ayahText = ayah.text;
          }
        }
      } catch (err) {
        console.error('Error fetching ayah:', err);
      }
    }

    // Fetch Tafsir from database
    let tafsirText = '';
    let tafsirName = '';
    if (includeTafsir !== false && tafsirKey) {
      const { data: tafsir } = await supabase
        .from('tafsir_texts')
        .select('text_ar')
        .eq('surah_number', surahNumber)
        .eq('ayah_number', ayahNumber)
        .eq('tafsir_key', tafsirKey)
        .maybeSingle();

      if (tafsir) {
        tafsirText = tafsir.text_ar;
      }

      // Get tafsir name
      const { data: source } = await supabase
        .from('tafsir_sources')
        .select('tafsir_name_ar')
        .eq('tafsir_key', tafsirKey)
        .single();

      if (source) {
        tafsirName = source.tafsir_name_ar;
      }
    }

    // Generate HTML with embedded Arabic fonts
    const html = `
<!DOCTYPE html>
<html dir="rtl" lang="ar">
<head>
  <meta charset="UTF-8">
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Amiri:wght@400;700&display=swap');
    
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    
    body {
      font-family: 'Amiri', 'Traditional Arabic', 'Times New Roman', serif;
      direction: rtl;
      text-align: right;
      padding: 40px;
      line-height: 2;
      background: #fff;
      color: #1a1a1a;
    }
    
    .header {
      text-align: center;
      margin-bottom: 30px;
      padding-bottom: 20px;
      border-bottom: 2px solid #c4a35a;
    }
    
    .header h1 {
      font-size: 24px;
      color: #1a5f4a;
      margin-bottom: 10px;
    }
    
    .header .verse-ref {
      font-size: 16px;
      color: #666;
    }
    
    .bismillah {
      text-align: center;
      font-size: 28px;
      color: #1a5f4a;
      margin: 20px 0;
    }
    
    .ayah-section {
      background: #f8f6f0;
      border: 1px solid #e8e4d8;
      border-radius: 8px;
      padding: 30px;
      margin: 20px 0;
    }
    
    .ayah-text {
      font-size: 32px;
      line-height: 2.5;
      color: #1a1a1a;
      text-align: center;
    }
    
    .ayah-number {
      display: inline-block;
      background: #1a5f4a;
      color: white;
      width: 32px;
      height: 32px;
      line-height: 32px;
      text-align: center;
      border-radius: 50%;
      font-size: 14px;
      margin-right: 5px;
    }
    
    .tafsir-section {
      margin-top: 30px;
    }
    
    .tafsir-section h2 {
      font-size: 20px;
      color: #1a5f4a;
      margin-bottom: 15px;
      padding-bottom: 10px;
      border-bottom: 1px solid #e8e4d8;
    }
    
    .tafsir-text {
      font-size: 18px;
      line-height: 2.2;
      text-align: justify;
      color: #333;
    }
    
    .footer {
      margin-top: 40px;
      padding-top: 20px;
      border-top: 1px solid #e8e4d8;
      text-align: center;
      font-size: 12px;
      color: #999;
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>القرآن الكريم</h1>
    <div class="verse-ref">سورة رقم ${toArabicNumerals(surahNumber)} - الآية ${toArabicNumerals(ayahNumber)}</div>
  </div>
  
  <div class="bismillah">﷽</div>
  
  ${ayahText ? `
  <div class="ayah-section">
    <div class="ayah-text">
      ${ayahText}
      <span class="ayah-number">${toArabicNumerals(ayahNumber)}</span>
    </div>
  </div>
  ` : ''}
  
  ${tafsirText ? `
  <div class="tafsir-section">
    <h2>${tafsirName || 'التفسير'}</h2>
    <div class="tafsir-text">${tafsirText}</div>
  </div>
  ` : ''}
  
  <div class="footer">
    تم إنشاء هذا الملف من تطبيق القرآن الكريم
  </div>
</body>
</html>
    `;

    // Return HTML that can be converted to PDF on client
    // Note: Full server-side PDF generation with Puppeteer requires a dedicated service
    return new Response(JSON.stringify({ 
      success: true,
      html,
      metadata: {
        surahNumber,
        ayahNumber,
        hasAyah: !!ayahText,
        hasTafsir: !!tafsirText,
        tafsirName,
      }
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error: unknown) {
    console.error('Error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
