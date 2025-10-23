
-- Primero eliminar todos los registros existentes de posicion_movimientos
DELETE FROM posicion_movimientos;

-- Insertar los nuevos movimientos y características
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
    -- Baloncesto - Base
    ('Baloncesto', 'Base', 'Visión de juego', 'Lectura de la defensa', 'Identificación de compañeros abiertos', 'Anticipación de jugadas', 'Capacidad para encontrar pases', 'Control del tempo'),
    ('Baloncesto', 'Base', 'Manejo de balón', 'Dribbling con ambas manos', 'Cambios de dirección', 'Protección del balón', 'Control de la velocidad', 'Manejo bajo presión'),
    ('Baloncesto', 'Base', 'Pase', 'Precisión en el pase', 'Variedad de pases', 'Pase con ambas manos', 'Pase sin mirar', 'Pase bajo presión'),
    ('Baloncesto', 'Base', 'Liderazgo', 'Comunicación en cancha', 'Organización del equipo', 'Calma bajo presión', 'Motivación a compañeros', 'Toma de decisiones rápidas'),
    ('Baloncesto', 'Base', 'Tiro exterior', 'Mecánica de tiro', 'Selección de tiro', 'Consistencia', 'Tiro tras drible', 'Tiro bajo presión'),
    
    -- Baloncesto - Escolta
    ('Baloncesto', 'Escolta', 'Capacidad anotadora', 'Variedad de tiros', 'Consistencia en el tiro', 'Creación de sus propios tiros', 'Anotación en diferentes situaciones', 'Eficacia en el clutch'),
    ('Baloncesto', 'Escolta', 'Tiro de media distancia', 'Mecánica de tiro', 'Consistencia', 'Tiro tras drible', 'Tiro en suspensión', 'Tiro desde el poste'),
    ('Baloncesto', 'Escolta', 'Movimientos sin balón', 'Cortes a canasta', 'Desmarques', 'Ubicación para el rebote ofensivo', 'Creación de espacio', 'Lectura de la defensa'),
    ('Baloncesto', 'Escolta', 'Defensa exterior', 'Velocidad lateral', 'Marcaje 1vs1', 'Robo de balón', 'Defensa de pick and roll', 'Cierre de líneas de pase'),
    ('Baloncesto', 'Escolta', 'Creación de espacio', 'Bloqueos sin balón', 'Cortes', 'Movimientos de engaño', 'Atraer defensores', 'Sacar faltas'),
    
    -- Baloncesto - Alero
    ('Baloncesto', 'Alero', 'Versatilidad ofensiva', 'Tiro exterior', 'Penetración', 'Posteo', 'Juego sin balón', 'Asistencia'),
    ('Baloncesto', 'Alero', 'Rebote', 'Posicionamiento', 'Salto vertical', 'Fuerza para ganar la posición', 'Lectura del rebote', 'Protección del balón tras rebote'),
    ('Baloncesto', 'Alero', 'Defensa 1vs1', 'Velocidad lateral', 'Marcaje', 'Anticipación', 'Recuperación', 'Defensa posteo'),
    ('Baloncesto', 'Alero', 'Capacidad de penetración', 'Primer paso', 'Control de balón en carrera', 'Finalización cerca del aro', 'Habilidad para sacar faltas', 'Cambios de ritmo'),
    ('Baloncesto', 'Alero', 'Tiro de 3 puntos', 'Mecánica de tiro', 'Consistencia', 'Tiro en catch and shoot', 'Tiro tras drible', 'Tiro desde las esquinas'),
    
    -- Baloncesto - Ala-pívot
    ('Baloncesto', 'Ala-pívot', 'Posteo', 'Movimientos de espaldas al aro', 'Ganchos', 'Fuerza en el poste bajo', 'Juego de pies', 'Pases desde el poste'),
    ('Baloncesto', 'Ala-pívot', 'Rebote defensivo', 'Posicionamiento', 'Bloqueo de rebote', 'Salto vertical', 'Fuerza', 'Comunicación para el rebote'),
    ('Baloncesto', 'Ala-pívot', 'Tiro de media distancia', 'Mecánica de tiro', 'Consistencia', 'Tiro en suspensión', 'Tiro tras bloqueo', 'Tiro desde la zona de media'),
    ('Baloncesto', 'Ala-pívot', 'Defensa interior', 'Defensa al poste bajo', 'Bloqueos', 'Ayudas defensivas', 'Anticipación de pases', 'Intimidación'),
    ('Baloncesto', 'Ala-pívot', 'Bloqueos', 'Fuerza en el bloqueo', 'Precisión del bloqueo', 'Continuidad tras bloqueo', 'Bloqueo para el tirador', 'Bloqueo para la penetración'),
    
    -- Baloncesto - Pívot
    ('Baloncesto', 'Pívot', 'Rebote ofensivo', 'Posicionamiento', 'Salto', 'Fuerza para ganar la posición', 'Agresividad en el rebote', 'Lectura del rebote'),
    ('Baloncesto', 'Pívot', 'Bloqueos', 'Fuerza en el bloqueo', 'Precisión del bloqueo', 'Continuidad tras bloqueo', 'Bloqueo para el tirador', 'Bloqueo para la penetración'),
    ('Baloncesto', 'Pívot', 'Finalización cerca del aro', 'Ganchos', 'Bandejas', 'Mate', 'Tiros de corta distancia', 'Habilidad para recibir pases difíciles'),
    ('Baloncesto', 'Pívot', 'Defensa interior', 'Defensa al poste bajo', 'Bloqueos', 'Ayudas defensivas', 'Intimidación', 'Protección del aro'),
    ('Baloncesto', 'Pívot', 'Presencia en la pintura', 'Capacidad para atraer faltas', 'Rebote', 'Defensa de la zona', 'Bloqueos', 'Intimidación')
) AS movimiento_data(deporte_nombre, posicion_nombre, nombre_movimiento, caracteristica_1, caracteristica_2, caracteristica_3, caracteristica_4, caracteristica_5)
JOIN deportes d ON d.nombre = movimiento_data.deporte_nombre
JOIN posiciones p ON p.nombre = movimiento_data.posicion_nombre AND p.deporte_id = d.id;

-- Continuar con Fútbol - debido a límites de caracteres, dividiré en múltiples inserts
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
    -- Fútbol - Portero
    ('Fútbol', 'Portero', 'Reflejos', 'Velocidad de reacción', 'Agilidad', 'Movimientos rápidos', 'Capacidad de parada', 'Anticipación'),
    ('Fútbol', 'Portero', 'Colocación', 'Posicionamiento bajo los tres palos', 'Ángulo de cobertura', 'Posición en los saques de esquina', 'Cobertura del área', 'Lectura de la jugada'),
    ('Fútbol', 'Portero', 'Juego aéreo', 'Salida por alto', 'Dominio del área pequeña', 'Puñetazos', 'Agarres', 'Comunicación'),
    ('Fútbol', 'Portero', 'Comunicación', 'Organización de la defensa', 'Gritos de mando', 'Claridad en las indicaciones', 'Confianza', 'Entendimiento con la defensa'),
    ('Fútbol', 'Portero', 'Saque', 'Precisión del saque de meta', 'Potencia del saque', 'Saque de mano', 'Saque de volea', 'Lectura del juego para el saque'),
    
    -- Fútbol - Defensa central
    ('Fútbol', 'Defensa central', 'Marcaje', 'Marcaje individual', 'Marcaje zonal', 'Capacidad de anticipación', 'Fuerza en el choque', 'Coberturas'),
    ('Fútbol', 'Defensa central', 'Juego aéreo defensivo', 'Remate de cabeza defensivo', 'Posicionamiento en balones aéreos', 'Salto', 'Fuerza', 'Anticipación'),
    ('Fútbol', 'Defensa central', 'Salida de balón', 'Pase en corto', 'Pase en largo', 'Visión de juego', 'Conducción', 'Presión tras pérdida'),
    ('Fútbol', 'Defensa central', 'Anticipación', 'Lectura de juego', 'Intercepción de pases', 'Cortes de jugada', 'Posicionamiento preventivo', 'Reacción rápida'),
    ('Fútbol', 'Defensa central', 'Liderazgo en defensa', 'Organización de la línea defensiva', 'Comunicación', 'Gritos de mando', 'Capacidad para corregir', 'Calma bajo presión')
) AS movimiento_data(deporte_nombre, posicion_nombre, nombre_movimiento, caracteristica_1, caracteristica_2, caracteristica_3, caracteristica_4, caracteristica_5)
JOIN deportes d ON d.nombre = movimiento_data.deporte_nombre
JOIN posiciones p ON p.nombre = movimiento_data.posicion_nombre AND p.deporte_id = d.id;
