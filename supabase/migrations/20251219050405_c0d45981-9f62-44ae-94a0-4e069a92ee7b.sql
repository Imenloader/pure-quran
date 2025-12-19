-- Drop old tables if exist (will recreate with better schema)
DROP TABLE IF EXISTS public.tafsir_import_status CASCADE;
DROP TABLE IF EXISTS public.tafsir_content CASCADE;

-- Create tafsir sources table (enabled Arabic tafsirs)
CREATE TABLE public.tafsir_sources (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tafsir_key TEXT NOT NULL UNIQUE,
  tafsir_name_ar TEXT NOT NULL,
  author_ar TEXT NOT NULL,
  api_id INTEGER NOT NULL,
  enabled BOOLEAN NOT NULL DEFAULT true,
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Insert Arabic tafsirs
INSERT INTO public.tafsir_sources (tafsir_key, tafsir_name_ar, author_ar, api_id, display_order) VALUES
  ('ibn-kathir', 'تفسير ابن كثير', 'ابن كثير', 169, 1),
  ('saadi', 'تفسير السعدي', 'عبد الرحمن السعدي', 170, 2),
  ('tabari', 'تفسير الطبري', 'ابن جرير الطبري', 171, 3),
  ('qurtubi', 'تفسير القرطبي', 'الإمام القرطبي', 172, 4),
  ('jalalayn', 'تفسير الجلالين', 'جلال الدين المحلي والسيوطي', 173, 5);

-- Enable RLS on tafsir_sources
ALTER TABLE public.tafsir_sources ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read tafsir sources"
ON public.tafsir_sources FOR SELECT USING (true);

-- Create tafsir texts table (actual content)
CREATE TABLE public.tafsir_texts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  surah_number INTEGER NOT NULL CHECK (surah_number >= 1 AND surah_number <= 114),
  ayah_number INTEGER NOT NULL CHECK (ayah_number >= 1),
  tafsir_key TEXT NOT NULL REFERENCES public.tafsir_sources(tafsir_key) ON DELETE CASCADE,
  text_ar TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE (surah_number, ayah_number, tafsir_key)
);

-- Create indexes for fast lookups
CREATE INDEX idx_tafsir_texts_lookup ON public.tafsir_texts (surah_number, ayah_number, tafsir_key);
CREATE INDEX idx_tafsir_texts_by_surah ON public.tafsir_texts (surah_number);

-- Enable RLS
ALTER TABLE public.tafsir_texts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read tafsir texts"
ON public.tafsir_texts FOR SELECT USING (true);

-- Create user favorites table
CREATE TABLE public.user_favorites (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  surah_number INTEGER NOT NULL CHECK (surah_number >= 1 AND surah_number <= 114),
  ayah_number INTEGER NOT NULL CHECK (ayah_number >= 1),
  note TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE (user_id, surah_number, ayah_number)
);

CREATE INDEX idx_user_favorites_user ON public.user_favorites (user_id);

-- Enable RLS
ALTER TABLE public.user_favorites ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own favorites"
ON public.user_favorites FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own favorites"
ON public.user_favorites FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own favorites"
ON public.user_favorites FOR DELETE USING (auth.uid() = user_id);

-- Create user settings table
CREATE TABLE public.user_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  font_size TEXT NOT NULL DEFAULT 'medium',
  line_spacing TEXT NOT NULL DEFAULT 'normal',
  dark_mode BOOLEAN NOT NULL DEFAULT false,
  default_tafsir TEXT REFERENCES public.tafsir_sources(tafsir_key),
  show_translation BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.user_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own settings"
ON public.user_settings FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own settings"
ON public.user_settings FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own settings"
ON public.user_settings FOR UPDATE USING (auth.uid() = user_id);