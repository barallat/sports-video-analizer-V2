
-- Añadir campos para almacenar rutas de videos en Storage
ALTER TABLE public.analisis_videos 
ADD COLUMN raw_video_path text,
ADD COLUMN processed_video_path text;
