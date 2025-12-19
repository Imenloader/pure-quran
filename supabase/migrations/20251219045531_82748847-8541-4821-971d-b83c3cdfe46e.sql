-- Create table for storing Arabic tafsir content locally
CREATE TABLE public.tafsir_content (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  surah_number INTEGER NOT NULL CHECK (surah_number >= 1 AND surah_number <= 114),
  ayah_number INTEGER NOT NULL CHECK (ayah_number >= 1),
  tafsir_id INTEGER NOT NULL,
  tafsir_name TEXT NOT NULL,
  tafsir_author TEXT NOT NULL,
  text TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE (surah_number, ayah_number, tafsir_id)
);

-- Create index for fast lookups
CREATE INDEX idx_tafsir_lookup ON public.tafsir_content (surah_number, ayah_number, tafsir_id);
CREATE INDEX idx_tafsir_by_surah ON public.tafsir_content (surah_number);

-- Enable RLS
ALTER TABLE public.tafsir_content ENABLE ROW LEVEL SECURITY;

-- Allow public read access (tafsir is public content)
CREATE POLICY "Anyone can read tafsir content"
ON public.tafsir_content
FOR SELECT
USING (true);

-- Create table to track import status
CREATE TABLE public.tafsir_import_status (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tafsir_id INTEGER NOT NULL UNIQUE,
  tafsir_name TEXT NOT NULL,
  total_ayahs INTEGER DEFAULT 0,
  imported_ayahs INTEGER DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'failed')),
  error_message TEXT,
  started_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.tafsir_import_status ENABLE ROW LEVEL SECURITY;

-- Allow public read access
CREATE POLICY "Anyone can read import status"
ON public.tafsir_import_status
FOR SELECT
USING (true);