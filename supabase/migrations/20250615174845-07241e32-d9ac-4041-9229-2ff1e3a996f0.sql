
-- Eliminar políticas existentes que podrían estar causando conflictos
DROP POLICY IF EXISTS "delete all 1livt5k_0" ON storage.objects;
DROP POLICY IF EXISTS "Insert all 1livt5k_0" ON storage.objects;
DROP POLICY IF EXISTS "Select all 1livt5k_0" ON storage.objects;

-- Crear política específica para acceso público de lectura al bucket videos
CREATE POLICY "Public video access" ON storage.objects
FOR SELECT USING (bucket_id = 'videos');

-- Crear política para insertar videos (solo usuarios autenticados)
CREATE POLICY "Authenticated users can upload videos" ON storage.objects
FOR INSERT WITH CHECK (bucket_id = 'videos' AND auth.role() = 'authenticated');

-- Crear política para actualizar videos (solo el propietario)
CREATE POLICY "Users can update own videos" ON storage.objects
FOR UPDATE USING (bucket_id = 'videos' AND auth.uid() = owner::uuid);

-- Crear política para eliminar videos (solo el propietario)
CREATE POLICY "Users can delete own videos" ON storage.objects
FOR DELETE USING (bucket_id = 'videos' AND auth.uid() = owner::uuid);
