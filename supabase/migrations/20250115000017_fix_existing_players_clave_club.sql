-- Fix existing players that don't have clave_club assigned
-- This migration ensures all existing players have a valid clave_club

-- First, let's see what players don't have clave_club
-- Assign them to the first available user with a clave_club
UPDATE public.jugadores 
SET 
  user_id = (SELECT id FROM public.usuarios WHERE clave_club IS NOT NULL LIMIT 1),
  clave_club = (SELECT clave_club FROM public.usuarios WHERE clave_club IS NOT NULL LIMIT 1)
WHERE clave_club IS NULL OR user_id IS NULL;

-- Verify that all players now have clave_club
-- This should not return any rows if everything is correct
SELECT id, nombre, user_id, clave_club 
FROM public.jugadores 
WHERE clave_club IS NULL OR user_id IS NULL;
