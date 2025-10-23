
-- Actualizar posiciones existentes con deportes apropiados
-- Primero obtenemos los IDs de los deportes
WITH deportes_ids AS (
  SELECT id, nombre FROM deportes
)
UPDATE posiciones SET deporte_id = (
  CASE 
    -- Posiciones de Fútbol
    WHEN nombre IN ('Portero', 'Defensa', 'Centrocampista', 'Delantero', 'Lateral Derecho', 'Lateral Izquierdo', 'Central', 'Mediocentro Defensivo', 'Mediocentro Ofensivo', 'Extremo Derecho', 'Extremo Izquierdo', 'Delantero Centro') 
    THEN (SELECT id FROM deportes_ids WHERE nombre = 'Fútbol')
    
    -- Posiciones de Baloncesto
    WHEN nombre IN ('Base', 'Escolta', 'Alero', 'Ala-Pívot', 'Pívot', 'Escolta Tirador', 'Alero Pequeño', 'Alero Grande') 
    THEN (SELECT id FROM deportes_ids WHERE nombre = 'Baloncesto')
    
    -- Posiciones de Balonmano
    WHEN nombre LIKE '%Balonmano%' 
    THEN (SELECT id FROM deportes_ids WHERE nombre = 'Balonmano')
    
    -- Posiciones de Voleibol
    WHEN nombre IN ('Colocador', 'Opuesto', 'Central Voleibol', 'Receptor Atacante', 'Líbero') 
    THEN (SELECT id FROM deportes_ids WHERE nombre = 'Voleibol')
    
    -- Posiciones de Tenis
    WHEN nombre IN ('Tenista Individual', 'Tenista Dobles') 
    THEN (SELECT id FROM deportes_ids WHERE nombre = 'Tenis')
    
    -- Posiciones de Atletismo
    WHEN nombre IN ('Velocista', 'Medio Fondista', 'Fondista', 'Saltador Altura', 'Saltador Longitud', 'Lanzador Peso', 'Lanzador Disco', 'Lanzador Jabalina', 'Decatleta', 'Heptatleta') 
    THEN (SELECT id FROM deportes_ids WHERE nombre = 'Atletismo')
    
    -- Posiciones de Equitación
    WHEN nombre LIKE 'Jinete%' 
    THEN (SELECT id FROM deportes_ids WHERE nombre = 'Equitación')
    
    ELSE NULL
  END
);
