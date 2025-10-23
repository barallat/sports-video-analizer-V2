-- Script para eliminar el equipo "Deportistas" que se creó incorrectamente
-- Solo ejecutar si existe el equipo "Deportistas" en baloncesto

-- Primero, verificar si existe el equipo "Deportistas"
SELECT id, nombre, deporte_id, usuario_id 
FROM equipos 
WHERE nombre = 'Deportistas';

-- Si existe, eliminar las relaciones en jugador_equipos primero
DELETE FROM jugador_equipos 
WHERE equipo_id IN (
  SELECT id FROM equipos 
  WHERE nombre = 'Deportistas'
);

-- Luego eliminar el equipo
DELETE FROM equipos 
WHERE nombre = 'Deportistas';

-- Verificar que se eliminó correctamente
SELECT id, nombre, deporte_id, usuario_id 
FROM equipos 
WHERE nombre = 'Deportistas';
