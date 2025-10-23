-- Fix altura data type to allow proper height values
-- The current DECIMAL(3,2) only allows values up to 9.99, but heights are typically 100-250 cm

-- Change altura from DECIMAL(3,2) to DECIMAL(5,2) to allow values up to 999.99
ALTER TABLE public.jugadores 
ALTER COLUMN altura TYPE DECIMAL(5,2);

-- Also fix peso if needed (currently DECIMAL(5,2) should be fine for weights up to 999.99 kg)
-- But let's make it DECIMAL(6,2) to be safe for very heavy athletes
ALTER TABLE public.jugadores 
ALTER COLUMN peso TYPE DECIMAL(6,2);

-- Update the constraint to reflect the new range
ALTER TABLE public.jugadores 
DROP CONSTRAINT IF EXISTS check_altura_positive;

ALTER TABLE public.jugadores 
ADD CONSTRAINT check_altura_positive CHECK (altura IS NULL OR (altura > 0 AND altura <= 300));

-- Update peso constraint as well
ALTER TABLE public.jugadores 
DROP CONSTRAINT IF EXISTS check_peso_positive;

ALTER TABLE public.jugadores 
ADD CONSTRAINT check_peso_positive CHECK (peso IS NULL OR (peso > 0 AND peso <= 500));
