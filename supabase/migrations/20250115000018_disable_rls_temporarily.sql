-- Temporalmente deshabilitar RLS para debugging
-- Esto permitirá que las consultas funcionen mientras investigamos el problema

-- Deshabilitar RLS en tablas relacionadas con análisis
ALTER TABLE public.jugadores DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.equipos DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.deportes DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.posiciones DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.posicion_movimientos DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.jugador_posiciones DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.analisis_videos DISABLE ROW LEVEL SECURITY;

-- Mantener RLS solo en usuarios para seguridad
-- ALTER TABLE public.usuarios DISABLE ROW LEVEL SECURITY;
