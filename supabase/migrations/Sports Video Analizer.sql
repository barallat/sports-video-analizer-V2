-- WARNING: This schema is for context only and is not meant to be run.
-- Table order and constraints may not be valid for execution.

CREATE TABLE public.analisis_videos (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  usuario_id uuid NOT NULL,
  deporte_id uuid NOT NULL,
  jugador_id uuid NOT NULL,
  posicion_movimiento_id uuid NOT NULL,
  titulo character varying NOT NULL,
  descripcion text,
  url_video character varying NOT NULL,
  fecha_analisis timestamp with time zone DEFAULT now(),
  duracion_segundos integer,
  resultados_analisis jsonb,
  metadatos jsonb,
  comentarios text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  raw_video_path text,
  processed_video_path text,
  equipo_id uuid,
  CONSTRAINT analisis_videos_pkey PRIMARY KEY (id),
  CONSTRAINT analisis_videos_usuario_id_fkey FOREIGN KEY (usuario_id) REFERENCES public.usuarios(id),
  CONSTRAINT analisis_videos_deporte_id_fkey FOREIGN KEY (deporte_id) REFERENCES public.deportes(id),
  CONSTRAINT analisis_videos_jugador_id_fkey FOREIGN KEY (jugador_id) REFERENCES public.jugadores(id),
  CONSTRAINT analisis_videos_posicion_movimiento_id_fkey FOREIGN KEY (posicion_movimiento_id) REFERENCES public.posicion_movimientos(id),
  CONSTRAINT analisis_videos_equipo_id_fkey FOREIGN KEY (equipo_id) REFERENCES public.equipos(id)
);
CREATE TABLE public.deportes (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  nombre character varying NOT NULL UNIQUE,
  descripcion text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT deportes_pkey PRIMARY KEY (id)
);
CREATE TABLE public.entrenos (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  equipo_id uuid NOT NULL,
  user_id uuid NOT NULL,
  fecha date NOT NULL,
  hora time without time zone NOT NULL,
  lugar text NOT NULL,
  entrada text,
  created_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  CONSTRAINT entrenos_pkey PRIMARY KEY (id),
  CONSTRAINT entrenos_equipo_id_fkey FOREIGN KEY (equipo_id) REFERENCES public.equipos(id),
  CONSTRAINT entrenos_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.usuarios(id)
);
CREATE TABLE public.equipos (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  nombre character varying NOT NULL,
  deporte_id uuid NOT NULL,
  usuario_id uuid NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  entrenador character varying CHECK (entrenador IS NULL OR length(entrenador::text) >= 2),
  categoria character varying CHECK (categoria IS NULL OR length(categoria::text) >= 2),
  CONSTRAINT equipos_pkey PRIMARY KEY (id),
  CONSTRAINT equipos_deporte_id_fkey FOREIGN KEY (deporte_id) REFERENCES public.deportes(id),
  CONSTRAINT equipos_usuario_id_fkey FOREIGN KEY (usuario_id) REFERENCES public.usuarios(id)
);
CREATE TABLE public.jugador_equipos (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  jugador_id uuid NOT NULL,
  equipo_id uuid NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT jugador_equipos_pkey PRIMARY KEY (id),
  CONSTRAINT jugador_equipos_jugador_id_fkey FOREIGN KEY (jugador_id) REFERENCES public.jugadores(id),
  CONSTRAINT jugador_equipos_equipo_id_fkey FOREIGN KEY (equipo_id) REFERENCES public.equipos(id)
);
CREATE TABLE public.jugador_posiciones (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  jugador_id uuid NOT NULL,
  posicion_id uuid NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT jugador_posiciones_pkey PRIMARY KEY (id),
  CONSTRAINT jugador_posiciones_jugador_id_fkey FOREIGN KEY (jugador_id) REFERENCES public.jugadores(id),
  CONSTRAINT jugador_posiciones_posicion_id_fkey FOREIGN KEY (posicion_id) REFERENCES public.posiciones(id)
);
CREATE TABLE public.jugadores (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  equipo_id uuid,
  nombre character varying NOT NULL,
  fecha_nacimiento date,
  altura numeric CHECK (altura IS NULL OR altura > 0::numeric AND altura <= 300::numeric),
  peso numeric CHECK (peso IS NULL OR peso > 0::numeric AND peso <= 500::numeric),
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  apellidos character varying,
  email character varying CHECK (email IS NULL OR email::text ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'::text),
  movil character varying CHECK (movil IS NULL OR movil::text ~ '^[0-9]{9,15}$'::text),
  envergadura numeric CHECK (envergadura IS NULL OR envergadura > 0::numeric),
  numero_pie integer CHECK (numero_pie IS NULL OR numero_pie > 0),
  fc_reposo integer CHECK (fc_reposo IS NULL OR fc_reposo > 0),
  fc_max integer CHECK (fc_max IS NULL OR fc_max > 0),
  notas text,
  user_id uuid NOT NULL,
  clave_club character varying NOT NULL,
  CONSTRAINT jugadores_pkey PRIMARY KEY (id),
  CONSTRAINT jugadores_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.usuarios(id),
  CONSTRAINT jugadores_equipo_id_fkey FOREIGN KEY (equipo_id) REFERENCES public.equipos(id)
);
CREATE TABLE public.posicion_movimientos (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  posicion_id uuid NOT NULL,
  nombre_movimiento character varying NOT NULL,
  caracteristica_1 character varying,
  caracteristica_2 character varying,
  caracteristica_3 character varying,
  caracteristica_4 character varying,
  caracteristica_5 character varying,
  caracteristica_6 character varying,
  caracteristica_7 character varying,
  descripcion_movimiento text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT posicion_movimientos_pkey PRIMARY KEY (id),
  CONSTRAINT posicion_movimientos_posicion_id_fkey FOREIGN KEY (posicion_id) REFERENCES public.posiciones(id)
);
CREATE TABLE public.posiciones (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  nombre character varying NOT NULL,
  descripcion text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  deporte_id uuid,
  CONSTRAINT posiciones_pkey PRIMARY KEY (id),
  CONSTRAINT posiciones_deporte_id_fkey FOREIGN KEY (deporte_id) REFERENCES public.deportes(id)
);
CREATE TABLE public.usuario_deportes (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  usuario_id uuid NOT NULL,
  deporte_id uuid NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT usuario_deportes_pkey PRIMARY KEY (id),
  CONSTRAINT usuario_deportes_usuario_id_fkey FOREIGN KEY (usuario_id) REFERENCES public.usuarios(id),
  CONSTRAINT usuario_deportes_deporte_id_fkey FOREIGN KEY (deporte_id) REFERENCES public.deportes(id)
);
CREATE TABLE public.usuarios (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  auth_user_id uuid,
  nombre character varying NOT NULL,
  email character varying NOT NULL UNIQUE,
  role USER-DEFINED DEFAULT 'coach'::user_role,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  club_name text,
  clave_club character varying,
  CONSTRAINT usuarios_pkey PRIMARY KEY (id),
  CONSTRAINT usuarios_auth_user_id_fkey FOREIGN KEY (auth_user_id) REFERENCES auth.users(id)
);