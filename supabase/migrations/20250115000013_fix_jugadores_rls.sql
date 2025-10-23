-- Fix RLS policies for jugadores table to allow proper insertion
-- This migration ensures users can create and manage players correctly

-- Drop existing policies
DROP POLICY IF EXISTS "Users can manage players from their teams" ON public.jugadores;

-- Create improved policies for jugadores
-- Allow users to insert players into their own teams
CREATE POLICY "Users can insert players into their teams" ON public.jugadores
FOR INSERT WITH CHECK (
  equipo_id IN (
    SELECT id FROM public.equipos 
    WHERE usuario_id IN (
      SELECT id FROM public.usuarios 
      WHERE auth_user_id = auth.uid()
    )
  )
);

-- Allow users to view players from their teams
CREATE POLICY "Users can view players from their teams" ON public.jugadores
FOR SELECT USING (
  equipo_id IN (
    SELECT id FROM public.equipos 
    WHERE usuario_id IN (
      SELECT id FROM public.usuarios 
      WHERE auth_user_id = auth.uid()
    )
  )
);

-- Allow users to update players from their teams
CREATE POLICY "Users can update players from their teams" ON public.jugadores
FOR UPDATE USING (
  equipo_id IN (
    SELECT id FROM public.equipos 
    WHERE usuario_id IN (
      SELECT id FROM public.usuarios 
      WHERE auth_user_id = auth.uid()
    )
  )
);

-- Allow users to delete players from their teams
CREATE POLICY "Users can delete players from their teams" ON public.jugadores
FOR DELETE USING (
  equipo_id IN (
    SELECT id FROM public.equipos 
    WHERE usuario_id IN (
      SELECT id FROM public.usuarios 
      WHERE auth_user_id = auth.uid()
    )
  )
);

-- Also fix jugador_posiciones policies
DROP POLICY IF EXISTS "Users can manage positions for their players" ON public.jugador_posiciones;

CREATE POLICY "Users can manage positions for their players" ON public.jugador_posiciones
FOR ALL USING (
  jugador_id IN (
    SELECT j.id FROM public.jugadores j 
    JOIN public.equipos e ON j.equipo_id = e.id 
    WHERE e.usuario_id IN (
      SELECT id FROM public.usuarios 
      WHERE auth_user_id = auth.uid()
    )
  )
);
