-- Crear tabla de relación muchos a muchos entre jugadores y equipos
CREATE TABLE public.jugador_equipos (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  jugador_id uuid NOT NULL,
  equipo_id uuid NOT NULL,
  created_at timestamp with time zone NULL DEFAULT now(),
  updated_at timestamp with time zone NULL DEFAULT now(),
  CONSTRAINT jugador_equipos_pkey PRIMARY KEY (id),
  CONSTRAINT jugador_equipos_jugador_id_fkey FOREIGN KEY (jugador_id) REFERENCES jugadores (id) ON DELETE CASCADE,
  CONSTRAINT jugador_equipos_equipo_id_fkey FOREIGN KEY (equipo_id) REFERENCES equipos (id) ON DELETE CASCADE,
  CONSTRAINT jugador_equipos_unique UNIQUE (jugador_id, equipo_id)
) TABLESPACE pg_default;

-- Crear índices para mejorar el rendimiento
CREATE INDEX idx_jugador_equipos_jugador_id ON public.jugador_equipos (jugador_id);
CREATE INDEX idx_jugador_equipos_equipo_id ON public.jugador_equipos (equipo_id);

-- Migrar datos existentes de la tabla jugadores a la nueva tabla de relación
INSERT INTO public.jugador_equipos (jugador_id, equipo_id)
SELECT id, equipo_id FROM public.jugadores WHERE equipo_id IS NOT NULL;

-- Añadir constraint para limitar a máximo 5 equipos por jugador
CREATE OR REPLACE FUNCTION check_max_equipos_per_jugador()
RETURNS TRIGGER AS $$
BEGIN
  IF (SELECT COUNT(*) FROM jugador_equipos WHERE jugador_id = NEW.jugador_id) >= 5 THEN
    RAISE EXCEPTION 'Un jugador no puede pertenecer a más de 5 equipos';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_check_max_equipos
  BEFORE INSERT ON jugador_equipos
  FOR EACH ROW
  EXECUTE FUNCTION check_max_equipos_per_jugador();

-- Comentarios para documentar la nueva estructura
COMMENT ON TABLE public.jugador_equipos IS 'Tabla de relación muchos a muchos entre jugadores y equipos. Un jugador puede pertenecer a hasta 5 equipos.';
COMMENT ON COLUMN public.jugador_equipos.jugador_id IS 'ID del jugador';
COMMENT ON COLUMN public.jugador_equipos.equipo_id IS 'ID del equipo';
COMMENT ON CONSTRAINT jugador_equipos_unique ON public.jugador_equipos IS 'Evita duplicados de la misma relación jugador-equipo';
