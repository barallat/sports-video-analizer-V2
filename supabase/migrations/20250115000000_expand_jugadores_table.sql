-- Expandir tabla jugadores con nuevos campos (manteniendo equipo_id para compatibilidad)
-- Fecha: 2025-01-15

-- Añadir nuevos campos a la tabla jugadores
ALTER TABLE public.jugadores 
ADD COLUMN apellidos VARCHAR(255),
ADD COLUMN email VARCHAR(255),
ADD COLUMN movil VARCHAR(20),
ADD COLUMN envergadura DECIMAL(4,2),
ADD COLUMN numero_pie INTEGER,
ADD COLUMN fc_reposo INTEGER,
ADD COLUMN fc_max INTEGER,
ADD COLUMN notas TEXT;

-- Añadir constraints para validación
ALTER TABLE public.jugadores 
ADD CONSTRAINT check_email_format CHECK (email IS NULL OR email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'),
ADD CONSTRAINT check_movil_format CHECK (movil IS NULL OR movil ~ '^[0-9]{9,15}$'),
ADD CONSTRAINT check_altura_positive CHECK (altura IS NULL OR altura > 0),
ADD CONSTRAINT check_peso_positive CHECK (peso IS NULL OR peso > 0),
ADD CONSTRAINT check_envergadura_positive CHECK (envergadura IS NULL OR envergadura > 0),
ADD CONSTRAINT check_numero_pie_positive CHECK (numero_pie IS NULL OR numero_pie > 0),
ADD CONSTRAINT check_fc_reposo_positive CHECK (fc_reposo IS NULL OR fc_reposo > 0),
ADD CONSTRAINT check_fc_max_positive CHECK (fc_max IS NULL OR fc_max > 0);

-- NO eliminamos equipo_id para mantener compatibilidad con las políticas existentes
-- ALTER TABLE public.jugadores DROP COLUMN IF EXISTS equipo_id;

-- Crear función para calcular la edad
CREATE OR REPLACE FUNCTION calcular_edad(fecha_nacimiento DATE)
RETURNS INTEGER AS $$
BEGIN
  IF fecha_nacimiento IS NULL THEN
    RETURN NULL;
  END IF;
  
  RETURN EXTRACT(YEAR FROM AGE(fecha_nacimiento));
END;
$$ LANGUAGE plpgsql;

-- Crear función para calcular el IMC
CREATE OR REPLACE FUNCTION calcular_imc(peso DECIMAL, altura DECIMAL)
RETURNS DECIMAL AS $$
BEGIN
  IF peso IS NULL OR altura IS NULL OR altura = 0 THEN
    RETURN NULL;
  END IF;
  
  RETURN ROUND(peso / (altura * altura), 2);
END;
$$ LANGUAGE plpgsql;

-- Crear función para calcular FC Max (fórmula: 220 - edad)
CREATE OR REPLACE FUNCTION calcular_fc_max(fecha_nacimiento DATE)
RETURNS INTEGER AS $$
BEGIN
  IF fecha_nacimiento IS NULL THEN
    RETURN NULL;
  END IF;
  
  RETURN 220 - calcular_edad(fecha_nacimiento);
END;
$$ LANGUAGE plpgsql;

-- Añadir comentarios para documentar los nuevos campos
COMMENT ON COLUMN public.jugadores.apellidos IS 'Apellidos del deportista';
COMMENT ON COLUMN public.jugadores.email IS 'Correo electrónico del deportista';
COMMENT ON COLUMN public.jugadores.movil IS 'Número de teléfono móvil del deportista';
COMMENT ON COLUMN public.jugadores.envergadura IS 'Envergadura del deportista en metros';
COMMENT ON COLUMN public.jugadores.numero_pie IS 'Número de pie del deportista';
COMMENT ON COLUMN public.jugadores.fc_reposo IS 'Frecuencia cardíaca en reposo (pulsaciones por minuto)';
COMMENT ON COLUMN public.jugadores.fc_max IS 'Frecuencia cardíaca máxima (pulsaciones por minuto)';
COMMENT ON COLUMN public.jugadores.notas IS 'Notas adicionales sobre el deportista';

-- Crear índices para mejorar el rendimiento en búsquedas
CREATE INDEX IF NOT EXISTS idx_jugadores_email ON public.jugadores (email);
CREATE INDEX IF NOT EXISTS idx_jugadores_movil ON public.jugadores (movil);
CREATE INDEX IF NOT EXISTS idx_jugadores_fecha_nacimiento ON public.jugadores (fecha_nacimiento);
