
-- Hacer el bucket privado nuevamente
UPDATE storage.buckets 
SET public = false 
WHERE id = 'videos';

-- Eliminar todas las políticas existentes en storage.objects relacionadas con videos
DROP POLICY IF EXISTS "Public video access" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload videos" ON storage.objects;
DROP POLICY IF EXISTS "Insert all 1livt5k_0" ON storage.objects;
DROP POLICY IF EXISTS "Select all 1livt5k_0" ON storage.objects;
DROP POLICY IF EXISTS "delete all 1livt5k_0" ON storage.objects;
DROP POLICY IF EXISTS "Users can update own videos" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete own videos" ON storage.objects;

-- Crear políticas nuevas y seguras
CREATE POLICY "Authenticated users can view videos" ON storage.objects
FOR SELECT USING (bucket_id = 'videos' AND auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can upload videos" ON storage.objects
FOR INSERT WITH CHECK (bucket_id = 'videos' AND auth.role() = 'authenticated');

CREATE POLICY "Users can update own videos" ON storage.objects
FOR UPDATE USING (bucket_id = 'videos' AND auth.uid() = owner::uuid);

CREATE POLICY "Users can delete own videos" ON storage.objects
FOR DELETE USING (bucket_id = 'videos' AND auth.uid() = owner::uuid);
