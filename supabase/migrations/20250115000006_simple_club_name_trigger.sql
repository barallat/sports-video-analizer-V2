-- Versión simple del trigger que solo añade club_name, manteniendo la funcionalidad original
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.usuarios (auth_user_id, nombre, email, club_name)
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data->>'nombre', new.raw_user_meta_data->>'name', 'Usuario'),
    new.email,
    new.raw_user_meta_data->>'club_name'
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
