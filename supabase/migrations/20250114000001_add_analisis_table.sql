
-- Añadir nuevos deportes
INSERT INTO public.deportes (nombre, descripcion) VALUES 
('Balonmano', 'Deporte de equipo con pelota y porterías'),
('Atletismo', 'Conjunto de disciplinas deportivas individuales'),
('Equitación', 'Deporte ecuestre con caballos');

-- Añadir posiciones específicas para cada deporte
-- Posiciones de Fútbol (ya existen algunas, añadimos más específicas)
INSERT INTO public.posiciones (nombre, descripcion) VALUES 
('Lateral Derecho', 'Defensa por el lado derecho'),
('Lateral Izquierdo', 'Defensa por el lado izquierdo'),
('Central', 'Defensa central'),
('Mediocentro Defensivo', 'Centrocampista defensivo'),
('Mediocentro Ofensivo', 'Centrocampista ofensivo'),
('Extremo Derecho', 'Delantero por banda derecha'),
('Extremo Izquierdo', 'Delantero por banda izquierda'),
('Delantero Centro', 'Delantero central');

-- Posiciones de Baloncesto (ya existen algunas, añadimos más específicas)
INSERT INTO public.posiciones (nombre, descripcion) VALUES 
('Escolta Tirador', 'Escolta especializado en tiro'),
('Alero Pequeño', 'Alero ágil y versátil'),
('Alero Grande', 'Alero con presencia física');

-- Posiciones de Balonmano
INSERT INTO public.posiciones (nombre, descripcion) VALUES 
('Portero Balonmano', 'Guardameta de balonmano'),
('Central Balonmano', 'Jugador central en balonmano'),
('Lateral Derecho Balonmano', 'Lateral derecho en balonmano'),
('Lateral Izquierdo Balonmano', 'Lateral izquierdo en balonmano'),
('Extremo Derecho Balonmano', 'Extremo derecho en balonmano'),
('Extremo Izquierdo Balonmano', 'Extremo izquierdo en balonmano'),
('Pivot Balonmano', 'Pivot en balonmano');

-- Posiciones de Voleibol
INSERT INTO public.posiciones (nombre, descripcion) VALUES 
('Colocador', 'Organizador del juego en voleibol'),
('Opuesto', 'Atacante opuesto en voleibol'),
('Central Voleibol', 'Bloqueador central en voleibol'),
('Receptor Atacante', 'Receptor y atacante en voleibol'),
('Líbero', 'Especialista defensivo en voleibol');

-- Posiciones de Atletismo
INSERT INTO public.posiciones (nombre, descripcion) VALUES 
('Velocista', 'Especialista en carreras de velocidad'),
('Medio Fondista', 'Especialista en medio fondo'),
('Fondista', 'Especialista en carreras de fondo'),
('Saltador Altura', 'Especialista en salto de altura'),
('Saltador Longitud', 'Especialista en salto de longitud'),
('Lanzador Peso', 'Especialista en lanzamiento de peso'),
('Lanzador Disco', 'Especialista en lanzamiento de disco'),
('Lanzador Jabalina', 'Especialista en lanzamiento de jabalina'),
('Decatleta', 'Especialista en decatlón'),
('Heptatleta', 'Especialista en heptatlón');

-- Posiciones de Equitación
INSERT INTO public.posiciones (nombre, descripcion) VALUES 
('Jinete Doma', 'Especialista en doma clásica'),
('Jinete Salto', 'Especialista en salto de obstáculos'),
('Jinete Concurso Completo', 'Especialista en concurso completo'),
('Jinete Raid', 'Especialista en raid ecuestre'),
('Jinete Volteo', 'Especialista en volteo ecuestre');

-- Posiciones de Tenis (ya existe, pero añadimos más específicas)
INSERT INTO public.posiciones (nombre, descripcion) VALUES 
('Tenista Individual', 'Jugador de tenis individual'),
('Tenista Dobles', 'Especialista en dobles de tenis');
