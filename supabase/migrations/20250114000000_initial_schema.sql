
-- Crear enum para tipos de usuario
CREATE TYPE user_role AS ENUM ('admin', 'coach');

-- Tabla Usuario (Entrenador) - Adaptada para trabajar con Supabase Auth
CREATE TABLE public.usuarios (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    auth_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    nombre VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    role user_role DEFAULT 'coach',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Tabla Deporte
CREATE TABLE public.deportes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nombre VARCHAR(255) NOT NULL UNIQUE,
    descripcion TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Tabla de unión Usuario_Deporte
CREATE TABLE public.usuario_deportes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    usuario_id UUID NOT NULL REFERENCES public.usuarios(id) ON DELETE CASCADE,
    deporte_id UUID NOT NULL REFERENCES public.deportes(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    UNIQUE (usuario_id, deporte_id)
);

-- Tabla Posicion
CREATE TABLE public.posiciones (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nombre VARCHAR(255) NOT NULL UNIQUE,
    descripcion TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Tabla Posicion_Movimiento
CREATE TABLE public.posicion_movimientos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    posicion_id UUID NOT NULL REFERENCES public.posiciones(id) ON DELETE CASCADE,
    nombre_movimiento VARCHAR(255) NOT NULL,
    caracteristica_1 VARCHAR(255),
    caracteristica_2 VARCHAR(255),
    caracteristica_3 VARCHAR(255),
    caracteristica_4 VARCHAR(255),
    caracteristica_5 VARCHAR(255),
    caracteristica_6 VARCHAR(255),
    caracteristica_7 VARCHAR(255),
    descripcion_movimiento TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    UNIQUE (posicion_id, nombre_movimiento)
);

-- Tabla Equipo
CREATE TABLE public.equipos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nombre VARCHAR(255) NOT NULL,
    deporte_id UUID NOT NULL REFERENCES public.deportes(id) ON DELETE RESTRICT,
    usuario_id UUID NOT NULL REFERENCES public.usuarios(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Tabla Jugador
CREATE TABLE public.jugadores (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    equipo_id UUID NOT NULL REFERENCES public.equipos(id) ON DELETE CASCADE,
    nombre VARCHAR(255) NOT NULL,
    fecha_nacimiento DATE,
    altura DECIMAL(3,2),
    peso DECIMAL(5,2),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Tabla de unión Jugador_Posicion
CREATE TABLE public.jugador_posiciones (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    jugador_id UUID NOT NULL REFERENCES public.jugadores(id) ON DELETE CASCADE,
    posicion_id UUID NOT NULL REFERENCES public.posiciones(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    UNIQUE (jugador_id, posicion_id)
);

-- Tabla AnalisisVideo
CREATE TABLE public.analisis_videos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    usuario_id UUID NOT NULL REFERENCES public.usuarios(id) ON DELETE RESTRICT,
    deporte_id UUID NOT NULL REFERENCES public.deportes(id) ON DELETE RESTRICT,
    jugador_id UUID NOT NULL REFERENCES public.jugadores(id) ON DELETE RESTRICT,
    posicion_movimiento_id UUID NOT NULL REFERENCES public.posicion_movimientos(id) ON DELETE RESTRICT,
    titulo VARCHAR(255) NOT NULL,
    descripcion TEXT,
    url_video VARCHAR(512) NOT NULL,
    fecha_analisis TIMESTAMP WITH TIME ZONE DEFAULT now(),
    duracion_segundos INTEGER,
    resultados_analisis JSONB,
    metadatos JSONB,
    comentarios TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Habilitar RLS en todas las tablas
ALTER TABLE public.usuarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.deportes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.usuario_deportes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.posiciones ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.posicion_movimientos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.equipos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.jugadores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.jugador_posiciones ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analisis_videos ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para usuarios
CREATE POLICY "Users can view their own profile" ON public.usuarios
FOR SELECT USING (auth.uid() = auth_user_id);

CREATE POLICY "Users can update their own profile" ON public.usuarios
FOR UPDATE USING (auth.uid() = auth_user_id);

-- Políticas RLS para deportes (todos pueden ver)
CREATE POLICY "Anyone can view deportes" ON public.deportes
FOR SELECT USING (true);

-- Políticas RLS para usuario_deportes
CREATE POLICY "Users can manage their own sports" ON public.usuario_deportes
FOR ALL USING (usuario_id IN (SELECT id FROM public.usuarios WHERE auth_user_id = auth.uid()));

-- Políticas RLS para posiciones (todos pueden ver)
CREATE POLICY "Anyone can view posiciones" ON public.posiciones
FOR SELECT USING (true);

-- Políticas RLS para posicion_movimientos (todos pueden ver)
CREATE POLICY "Anyone can view posicion_movimientos" ON public.posicion_movimientos
FOR SELECT USING (true);

-- Políticas RLS para equipos
CREATE POLICY "Users can manage their own teams" ON public.equipos
FOR ALL USING (usuario_id IN (SELECT id FROM public.usuarios WHERE auth_user_id = auth.uid()));

-- Políticas RLS para jugadores
CREATE POLICY "Users can manage players from their teams" ON public.jugadores
FOR ALL USING (equipo_id IN (SELECT id FROM public.equipos WHERE usuario_id IN (SELECT id FROM public.usuarios WHERE auth_user_id = auth.uid())));

-- Políticas RLS para jugador_posiciones
CREATE POLICY "Users can manage positions for their players" ON public.jugador_posiciones
FOR ALL USING (jugador_id IN (SELECT j.id FROM public.jugadores j JOIN public.equipos e ON j.equipo_id = e.id WHERE e.usuario_id IN (SELECT id FROM public.usuarios WHERE auth_user_id = auth.uid())));

-- Políticas RLS para analisis_videos
CREATE POLICY "Users can manage their own analysis" ON public.analisis_videos
FOR ALL USING (usuario_id IN (SELECT id FROM public.usuarios WHERE auth_user_id = auth.uid()));

-- Insertar algunos deportes y posiciones básicos
INSERT INTO public.deportes (nombre, descripcion) VALUES 
('Fútbol', 'Deporte de equipo con balón'),
('Baloncesto', 'Deporte de canasta'),
('Tenis', 'Deporte de raqueta'),
('Voleibol', 'Deporte de red');

INSERT INTO public.posiciones (nombre, descripcion) VALUES 
('Portero', 'Guardameta'),
('Defensa', 'Jugador defensivo'),
('Centrocampista', 'Jugador de medio campo'),
('Delantero', 'Jugador ofensivo'),
('Base', 'Armador del equipo'),
('Escolta', 'Jugador perimetral'),
('Alero', 'Jugador versátil'),
('Ala-Pívot', 'Jugador interior'),
('Pívot', 'Jugador centro');

-- Función para crear perfil de usuario automáticamente
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.usuarios (auth_user_id, nombre, email)
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data->>'nombre', new.raw_user_meta_data->>'name', 'Usuario'),
    new.email
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger para crear perfil automáticamente
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
