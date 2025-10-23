-- Add club_name field to usuarios table
ALTER TABLE usuarios ADD COLUMN club_name TEXT;

-- Add comment to describe the field
COMMENT ON COLUMN usuarios.club_name IS 'Nombre del club para usuarios con rol de gestor/coach';
