
-- Primero eliminar la restricción única del nombre
ALTER TABLE posiciones DROP CONSTRAINT IF EXISTS posiciones_nombre_key;

-- Agregar una restricción única compuesta para nombre + deporte_id
ALTER TABLE posiciones ADD CONSTRAINT posiciones_nombre_deporte_unique UNIQUE (nombre, deporte_id);

-- Ahora eliminar todas las posiciones existentes
DELETE FROM posiciones;

-- Insertar las nuevas posiciones con sus deportes correspondientes
INSERT INTO posiciones (nombre, deporte_id) 
SELECT 
  posicion_data.nombre,
  d.id as deporte_id
FROM (
  VALUES 
    -- Baloncesto
    ('Base', 'Baloncesto'),
    ('Escolta', 'Baloncesto'),
    ('Alero', 'Baloncesto'),
    ('Ala-pívot', 'Baloncesto'),
    ('Pívot', 'Baloncesto'),
    
    -- Fútbol
    ('Portero', 'Fútbol'),
    ('Defensa central', 'Fútbol'),
    ('Lateral derecho', 'Fútbol'),
    ('Lateral izquierdo', 'Fútbol'),
    ('Carrilero', 'Fútbol'),
    ('Mediocentro defensivo', 'Fútbol'),
    ('Mediocentro', 'Fútbol'),
    ('Mediocentro ofensivo', 'Fútbol'),
    ('Extremo derecho', 'Fútbol'),
    ('Extremo izquierdo', 'Fútbol'),
    ('Segundo delantero', 'Fútbol'),
    ('Delantero centro', 'Fútbol'),
    
    -- Balonmano
    ('Portero', 'Balonmano'),
    ('Central', 'Balonmano'),
    ('Lateral', 'Balonmano'),
    ('Extremo', 'Balonmano'),
    ('Pivote', 'Balonmano'),
    
    -- Voleibol
    ('Colocador', 'Voleibol'),
    ('Central', 'Voleibol'),
    ('Opuesto', 'Voleibol'),
    ('Receptor-Atacante', 'Voleibol'),
    ('Líbero', 'Voleibol'),
    
    -- Atletismo
    ('Carreras de velocidad', 'Atletismo'),
    ('Vallas', 'Atletismo'),
    ('Carreras de medio fondo', 'Atletismo'),
    ('Carreras de fondo', 'Atletismo'),
    ('Marcha', 'Atletismo'),
    ('Salto de longitud', 'Atletismo'),
    ('Triple salto', 'Atletismo'),
    ('Salto de altura', 'Atletismo'),
    ('Salto con pértiga', 'Atletismo'),
    ('Lanzamiento de peso', 'Atletismo'),
    ('Lanzamiento de disco', 'Atletismo'),
    ('Lanzamiento de martillo', 'Atletismo'),
    ('Lanzamiento de jabalina', 'Atletismo'),
    ('Pruebas combinadas', 'Atletismo'),
    
    -- Equitación
    ('Salto de obstáculos', 'Equitación'),
    ('Doma clásica', 'Equitación'),
    ('Concurso completo', 'Equitación'),
    ('Raid', 'Equitación'),
    ('Enganche', 'Equitación'),
    ('Volteo', 'Equitación'),
    ('Horseball', 'Equitación'),
    ('Doma vaquera', 'Equitación'),
    ('Ponis', 'Equitación'),
    ('Paraecuestre', 'Equitación'),
    ('Reining', 'Equitación'),
    ('Trec', 'Equitación'),
    ('Turismo ecuestre', 'Equitación'),
    ('Equitación de trabajo', 'Equitación'),
    
    -- Tenis
    ('Individual', 'Tenis'),
    ('Dobles lado derecho', 'Tenis'),
    ('Dobles lado izquierdo', 'Tenis')
) AS posicion_data(nombre, deporte_nombre)
JOIN deportes d ON d.nombre = posicion_data.deporte_nombre;
