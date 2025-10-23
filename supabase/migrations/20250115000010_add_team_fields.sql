-- Add entrenador and categoria fields to equipos table
-- Fecha: 2025-01-15

-- Añadir nuevos campos a la tabla equipos
ALTER TABLE public.equipos 
ADD COLUMN entrenador VARCHAR(255),
ADD COLUMN categoria VARCHAR(255);

-- Añadir constraints para validación
ALTER TABLE public.equipos 
ADD CONSTRAINT check_entrenador_length CHECK (entrenador IS NULL OR LENGTH(entrenador) >= 2),
ADD CONSTRAINT check_categoria_length CHECK (categoria IS NULL OR LENGTH(categoria) >= 2);

-- Comentarios para documentar los nuevos campos
COMMENT ON COLUMN public.equipos.entrenador IS 'Nombre del entrenador del equipo';
COMMENT ON COLUMN public.equipos.categoria IS 'Categoría o división del equipo (ej: Juvenil, Senior, etc.)';
