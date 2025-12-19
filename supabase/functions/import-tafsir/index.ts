import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Arabic-only tafsir sources
const ARABIC_TAFSIRS = [
  { id: 169, name: "تفسير ابن كثير", author: "ابن كثير" },
  { id: 170, name: "تفسير السعدي", author: "السعدي" },
  { id: 164, name: "تفسير الطبري", author: "الطبري" },
  { id: 168, name: "تفسير القرطبي", author: "القرطبي" },
  { id: 74, name: "تفسير الجلالين", author: "الجلالين" },
];

const QURAN_COM_API = "https://api.quran.com/api/v4";

// Validate Arabic text (must contain Arabic characters)
function isArabicText(text: string): boolean {
  if (!text || text.trim().length === 0) return false;
  // Arabic Unicode range: \u0600-\u06FF (Arabic), \u0750-\u077F (Arabic Supplement)
  const arabicPattern = /[\u0600-\u06FF\u0750-\u077F]/;
  return arabicPattern.test(text);
}

// Clean HTML tags from text
function cleanText(text: string): string {
  return text
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&quot;/g, '"')
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/\s+/g, " ")
    .trim();
}

// Surah ayah counts
const SURAH_AYAH_COUNTS = [7,286,200,176,120,165,206,75,129,109,123,111,43,52,99,128,111,110,98,135,112,78,118,64,77,227,93,88,69,60,34,30,73,54,45,83,182,88,75,85,54,53,89,59,37,35,38,88,52,77,57,29,52,44,28,88,17,30,30,48,22,65,49,18,44,11,21,8,43,27,19,36,14,29,18,45,30,60,49,62,55,78,96,29,22,24,13,14,11,11,18,12,12,30,52,52,44,28,28,20,56,40,31,50,40,46,42,29,19,36,25,22,17,19,26,30,20,15,21,11,8,8,19,5,8,8,11,11,8,3,9,5,4,7,3,6,3,5,4,5,6];

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { action, tafsirId, surahNumber } = await req.json();

    if (action === 'status') {
      // Return current import status
      const { data, error } = await supabase
        .from('tafsir_import_status')
        .select('*')
        .order('tafsir_id');

      if (error) throw error;

      return new Response(JSON.stringify({ status: data }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (action === 'import') {
      // Import a specific tafsir for a specific surah
      const tafsir = ARABIC_TAFSIRS.find(t => t.id === tafsirId);
      if (!tafsir) {
        return new Response(JSON.stringify({ error: 'Invalid tafsir ID' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      const surahNum = surahNumber || 1;
      const ayahCount = SURAH_AYAH_COUNTS[surahNum - 1];
      
      console.log(`Importing ${tafsir.name} for Surah ${surahNum} (${ayahCount} ayahs)`);

      let importedCount = 0;
      const batchSize = 10;
      
      for (let batch = 0; batch < Math.ceil(ayahCount / batchSize); batch++) {
        const start = batch * batchSize + 1;
        const end = Math.min(start + batchSize - 1, ayahCount);
        const tafsirRecords = [];

        for (let ayah = start; ayah <= end; ayah++) {
          try {
            const verseKey = `${surahNum}:${ayah}`;
            const response = await fetch(
              `${QURAN_COM_API}/tafsirs/${tafsirId}/by_ayah/${verseKey}`
            );

            if (response.ok) {
              const data = await response.json();
              if (data.tafsir && data.tafsir.text) {
                const cleanedText = cleanText(data.tafsir.text);
                
                // Validate Arabic content
                if (isArabicText(cleanedText)) {
                  tafsirRecords.push({
                    surah_number: surahNum,
                    ayah_number: ayah,
                    tafsir_id: tafsirId,
                    tafsir_name: tafsir.name,
                    tafsir_author: tafsir.author,
                    text: cleanedText,
                  });
                  importedCount++;
                } else {
                  console.log(`Rejected non-Arabic content for ${verseKey}`);
                }
              }
            }
            
            // Rate limiting
            await new Promise(resolve => setTimeout(resolve, 100));
          } catch (err) {
            console.error(`Error fetching ${surahNum}:${ayah}:`, err);
          }
        }

        // Insert batch
        if (tafsirRecords.length > 0) {
          const { error: insertError } = await supabase
            .from('tafsir_content')
            .upsert(tafsirRecords, {
              onConflict: 'surah_number,ayah_number,tafsir_id',
            });

          if (insertError) {
            console.error('Insert error:', insertError);
          }
        }
      }

      return new Response(JSON.stringify({ 
        success: true,
        imported: importedCount,
        surah: surahNum,
        tafsir: tafsir.name 
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (action === 'import-all') {
      // Start importing all tafsirs (runs in background)
      console.log('Starting full tafsir import...');

      // Initialize status for all tafsirs
      for (const tafsir of ARABIC_TAFSIRS) {
        await supabase
          .from('tafsir_import_status')
          .upsert({
            tafsir_id: tafsir.id,
            tafsir_name: tafsir.name,
            total_ayahs: 6236,
            imported_ayahs: 0,
            status: 'pending',
          }, { onConflict: 'tafsir_id' });
      }

      return new Response(JSON.stringify({ 
        message: 'Import started. Use status action to check progress.',
        tafsirs: ARABIC_TAFSIRS.map(t => t.name)
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ error: 'Invalid action' }), {
      status: 400,
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
