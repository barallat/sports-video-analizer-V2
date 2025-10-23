-- Add user_id and clave_club fields to jugadores table
-- This migration allows filtering players by user's clave_club instead of equipo_id

-- Add new fields to jugadores table
ALTER TABLE public.jugadores 
ADD COLUMN user_id UUID REFERENCES public.usuarios(id) ON DELETE CASCADE,
ADD COLUMN clave_club VARCHAR(6);

-- Make the new fields NOT NULL after we populate them
-- First, let's populate existing records (if any)
UPDATE public.jugadores 
SET 
  user_id = (
    SELECT u.id 
    FROM public.usuarios u 
    JOIN public.equipos e ON e.usuario_id = u.id 
    WHERE e.id = jugadores.equipo_id
  ),
  clave_club = (
    SELECT u.clave_club 
    FROM public.usuarios u 
    JOIN public.equipos e ON e.usuario_id = u.id 
    WHERE e.id = jugadores.equipo_id
  )
WHERE equipo_id IS NOT NULL;

-- For players without equipo_id, we'll need to handle them separately
-- For now, we'll set them to a default user (you may need to adjust this)
UPDATE public.jugadores 
SET 
  user_id = (SELECT id FROM public.usuarios LIMIT 1),
  clave_club = (SELECT clave_club FROM public.usuarios LIMIT 1)
WHERE equipo_id IS NULL AND user_id IS NULL;

-- Now make the fields NOT NULL
ALTER TABLE public.jugadores 
ALTER COLUMN user_id SET NOT NULL,
ALTER COLUMN clave_club SET NOT NULL;

-- Drop the old RLS policies
DROP POLICY IF EXISTS "Users can insert players" ON public.jugadores;
DROP POLICY IF EXISTS "Users can view players" ON public.jugadores;
DROP POLICY IF EXISTS "Users can update players" ON public.jugadores;
DROP POLICY IF EXISTS "Users can delete players" ON public.jugadores;

-- Create new RLS policies based on clave_club
CREATE POLICY "Users can insert players" ON public.jugadores
FOR INSERT WITH CHECK (
  user_id IN (
    SELECT id FROM public.usuarios 
    WHERE auth_user_id = auth.uid()
  ) AND
  clave_club IN (
    SELECT clave_club FROM public.usuarios 
    WHERE auth_user_id = auth.uid()
  )
);

CREATE POLICY "Users can view players" ON public.jugadores
FOR SELECT USING (
  clave_club IN (
    SELECT clave_club FROM public.usuarios 
    WHERE auth_user_id = auth.uid()
  )
);

CREATE POLICY "Users can update players" ON public.jugadores
FOR UPDATE USING (
  clave_club IN (
    SELECT clave_club FROM public.usuarios 
    WHERE auth_user_id = auth.uid()
  )
);

CREATE POLICY "Users can delete players" ON public.jugadores
FOR DELETE USING (
  clave_club IN (
    SELECT clave_club FROM public.usuarios 
    WHERE auth_user_id = auth.uid()
  )
);

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_jugadores_clave_club ON public.jugadores(clave_club);
CREATE INDEX IF NOT EXISTS idx_jugadores_user_id ON public.jugadores(user_id);
