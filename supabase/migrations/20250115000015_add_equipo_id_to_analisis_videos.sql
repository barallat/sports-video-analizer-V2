-- Add equipo_id field to analisis_videos table
ALTER TABLE public.analisis_videos 
ADD COLUMN equipo_id UUID REFERENCES public.equipos(id) ON DELETE RESTRICT;

-- Add index for better query performance
CREATE INDEX idx_analisis_videos_equipo_id ON public.analisis_videos(equipo_id);

-- Update RLS policies to include equipo_id
-- The existing policies should work fine since they're based on usuario_id
-- but we can add a comment for clarity
COMMENT ON COLUMN public.analisis_videos.equipo_id IS 'Reference to the team associated with this analysis';
