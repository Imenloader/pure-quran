import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const QURAN_COM_API = "https://api.quran.com/api/v4";

// Count Arabic characters in text
function countArabicChars(text: string): number {
  const arabicPattern = /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]/g;
  const matches = text.match(arabicPattern);
  return matches ? matches.length : 0;
}

// Check if text is predominantly Arabic (more than 50% Arabic chars)
function isPredominantlyArabic(text: string): boolean {
  if (!text || text.trim().length === 0) return false;
  
  // Remove whitespace and punctuation for accurate counting
  const cleanText = text.replace(/[\s\d.,،؛:!?؟\-_()[\]{}'"«»]/g, '');
  if (cleanText.length === 0) return false;
  
  const arabicCount = countArabicChars(cleanText);
  const ratio = arabicCount / cleanText.length;
  
  // Must be at least 60% Arabic
  return ratio >= 0.6;
}

// Clean HTML tags and decode entities
function cleanText(text: string): string {
  return text
    // Remove HTML tags
    .replace(/<[^>]*>/g, " ")
    // Decode HTML entities
    .replace(/&nbsp;/g, " ")
    .replace(/&quot;/g, '"')
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&#(\d+);/g, (_, num) => String.fromCharCode(parseInt(num)))
    .replace(/&#x([a-fA-F0-9]+);/g, (_, hex) => String.fromCharCode(parseInt(hex, 16)))
    // Normalize whitespace
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

    const { action, tafsirKey, surahNumber } = await req.json();

    if (action === 'sources') {
      // Return all enabled tafsir sources
      const { data, error } = await supabase
        .from('tafsir_sources')
        .select('*')
        .eq('enabled', true)
        .order('display_order');

      if (error) throw error;

      return new Response(JSON.stringify({ sources: data }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (action === 'status') {
      // Return import progress for all tafsirs
      const { data: sources } = await supabase
        .from('tafsir_sources')
        .select('tafsir_key, tafsir_name_ar, api_id')
        .eq('enabled', true);

      const stats = [];
      for (const source of sources || []) {
        const { count } = await supabase
          .from('tafsir_texts')
          .select('*', { count: 'exact', head: true })
          .eq('tafsir_key', source.tafsir_key);
        
        stats.push({
          tafsir_key: source.tafsir_key,
          tafsir_name_ar: source.tafsir_name_ar,
          imported_count: count || 0,
          total_count: 6236,
        });
      }

      return new Response(JSON.stringify({ status: stats }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (action === 'import') {
      // Get tafsir source info from DB
      const { data: source, error: sourceError } = await supabase
        .from('tafsir_sources')
        .select('*')
        .eq('tafsir_key', tafsirKey)
        .single();

      if (sourceError || !source) {
        return new Response(JSON.stringify({ error: 'Invalid tafsir key' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      const surahNum = surahNumber || 1;
      const ayahCount = SURAH_AYAH_COUNTS[surahNum - 1];
      
      console.log(`Importing ${source.tafsir_name_ar} for Surah ${surahNum} (${ayahCount} ayahs)`);

      let importedCount = 0;
      let rejectedCount = 0;
      const batchSize = 10;
      
      for (let batch = 0; batch < Math.ceil(ayahCount / batchSize); batch++) {
        const start = batch * batchSize + 1;
        const end = Math.min(start + batchSize - 1, ayahCount);
        const tafsirRecords = [];

        for (let ayah = start; ayah <= end; ayah++) {
          try {
            const verseKey = `${surahNum}:${ayah}`;
            const response = await fetch(
              `${QURAN_COM_API}/tafsirs/${source.api_id}/by_ayah/${verseKey}`
            );

            if (response.ok) {
              const data = await response.json();
              if (data.tafsir && data.tafsir.text) {
                const cleanedText = cleanText(data.tafsir.text);
                
                // Validate predominantly Arabic content
                if (isPredominantlyArabic(cleanedText)) {
                  tafsirRecords.push({
                    surah_number: surahNum,
                    ayah_number: ayah,
                    tafsir_key: source.tafsir_key,
                    text_ar: cleanedText,
                  });
                  importedCount++;
                } else {
                  rejectedCount++;
                  console.log(`Rejected non-Arabic content for ${verseKey} (tafsir: ${source.tafsir_key})`);
                }
              }
            } else {
              console.log(`API returned ${response.status} for ${verseKey}`);
            }
            
            // Rate limiting - be gentle with the API
            await new Promise(resolve => setTimeout(resolve, 150));
          } catch (err) {
            console.error(`Error fetching ${surahNum}:${ayah}:`, err);
          }
        }

        // Insert batch using upsert
        if (tafsirRecords.length > 0) {
          const { error: insertError } = await supabase
            .from('tafsir_texts')
            .upsert(tafsirRecords, {
              onConflict: 'surah_number,ayah_number,tafsir_key',
            });

          if (insertError) {
            console.error('Insert error:', insertError);
          }
        }
      }

      console.log(`Completed: imported ${importedCount}, rejected ${rejectedCount}`);

      return new Response(JSON.stringify({ 
        success: true,
        imported: importedCount,
        rejected: rejectedCount,
        surah: surahNum,
        tafsir: source.tafsir_name_ar 
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
