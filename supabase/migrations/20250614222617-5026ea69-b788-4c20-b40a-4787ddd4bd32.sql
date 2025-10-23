
-- Insertar movimientos para Atletismo - Salto de altura
INSERT INTO posicion_movimientos (
  posicion_id, 
  nombre_movimiento, 
  caracteristica_1, 
  caracteristica_2, 
  caracteristica_3, 
  caracteristica_4, 
  caracteristica_5
) 
SELECT 
  p.id as posicion_id,
  movimiento_data.nombre_movimiento,
  movimiento_data.caracteristica_1,
  movimiento_data.caracteristica_2,
  movimiento_data.caracteristica_3,
  movimiento_data.caracteristica_4,
  movimiento_data.caracteristica_5
FROM (
  VALUES 
    -- Atletismo - Salto de altura
    ('Atletismo', 'Salto de altura', 'Técnica de salto (Fosbury)', 'Aproximación en curva', 'Batida', 'Paso por el listón', 'Arqueo', 'Caída'),
    ('Atletismo', 'Salto de altura', 'Fuerza de piernas', 'Potencia de impulso', 'Fuerza en la batida', 'Explosividad', 'Salto vertical', 'Fuerza reactiva'),
    ('Atletismo', 'Salto de altura', 'Flexibilidad', 'Movilidad de cadera', 'Arqueo de espalda', 'Amplitud de movimiento', 'Prevención de lesiones', 'Recuperación'),
    ('Atletismo', 'Salto de altura', 'Coordinación', 'Sincronización de movimientos', 'Ritmo de carrera', 'Batida', 'Movimiento de brazos', 'Control corporal'),
    ('Atletismo', 'Salto de altura', 'Ritmo de carrera', 'Constancia en la zancada', 'Aceleración progresiva', 'Curva de aproximación', 'Velocidad controlada', 'Consistencia')
) AS movimiento_data(deporte_nombre, posicion_nombre, nombre_movimiento, caracteristica_1, caracteristica_2, caracteristica_3, caracteristica_4, caracteristica_5)
JOIN deportes d ON d.nombre = movimiento_data.deporte_nombre
JOIN posiciones p ON p.nombre = movimiento_data.posicion_nombre AND p.deporte_id = d.id;
