-- Fix RLS policies for jugadores table to allow null equipo_id
-- This migration allows players to be created without being assigned to a team initially

-- Drop existing policies
DROP POLICY IF EXISTS "Users can insert players into their teams" ON public.jugadores;
DROP POLICY IF EXISTS "Users can view players from their teams" ON public.jugadores;
DROP POLICY IF EXISTS "Users can update players from their teams" ON public.jugadores;
DROP POLICY IF EXISTS "Users can delete players from their teams" ON public.jugadores;

-- Create new policies that allow null equipo_id
-- Allow users to insert players (with or without equipo_id)
CREATE POLICY "Users can insert players" ON public.jugadores
FOR INSERT WITH CHECK (
  -- If equipo_id is provided, it must belong to the user
  (equipo_id IS NULL) OR 
  (equipo_id IN (
    SELECT id FROM public.equipos 
    WHERE usuario_id IN (
      SELECT id FROM public.usuarios 
      WHERE auth_user_id = auth.uid()
    )
  ))
);

-- Allow users to view players from their teams or unassigned players
CREATE POLICY "Users can view players" ON public.jugadores
FOR SELECT USING (
  -- Can view players from their teams
  (equipo_id IN (
    SELECT id FROM public.equipos 
    WHERE usuario_id IN (
      SELECT id FROM public.usuarios 
      WHERE auth_user_id = auth.uid()
    )
  )) OR
  -- Can view unassigned players (equipo_id IS NULL)
  (equipo_id IS NULL)
);

-- Allow users to update players from their teams or unassigned players
CREATE POLICY "Users can update players" ON public.jugadores
FOR UPDATE USING (
  -- Can update players from their teams
  (equipo_id IN (
    SELECT id FROM public.equipos 
    WHERE usuario_id IN (
      SELECT id FROM public.usuarios 
      WHERE auth_user_id = auth.uid()
    )
  )) OR
  -- Can update unassigned players (equipo_id IS NULL)
  (equipo_id IS NULL)
);

-- Allow users to delete players from their teams or unassigned players
CREATE POLICY "Users can delete players" ON public.jugadores
FOR DELETE USING (
  -- Can delete players from their teams
  (equipo_id IN (
    SELECT id FROM public.equipos 
    WHERE usuario_id IN (
      SELECT id FROM public.usuarios 
      WHERE auth_user_id = auth.uid()
    )
  )) OR
  -- Can delete unassigned players (equipo_id IS NULL)
  (equipo_id IS NULL)
);

-- Also update the constraint to allow null equipo_id
ALTER TABLE public.jugadores 
ALTER COLUMN equipo_id DROP NOT NULL;
