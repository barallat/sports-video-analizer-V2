
-- Asegurarse de que el bucket videos sea público
UPDATE storage.buckets 
SET public = true 
WHERE id = 'videos';

-- Si el bucket no existe, crearlo como público
INSERT INTO storage.buckets (id, name, public)
SELECT 'videos', 'videos', true
WHERE NOT EXISTS (SELECT 1 FROM storage.buckets WHERE id = 'videos');
