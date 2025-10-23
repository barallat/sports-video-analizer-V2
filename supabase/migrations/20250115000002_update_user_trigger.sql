-- Actualizar la función handle_new_user para incluir club_name y role
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.usuarios (auth_user_id, nombre, email, role, club_name)
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data->>'nombre', new.raw_user_meta_data->>'name', 'Usuario'),
    new.email,
    COALESCE(
      CASE 
        WHEN new.raw_user_meta_data->>'role' = 'athlete' THEN 'athlete'::user_role
        WHEN new.raw_user_meta_data->>'role' = 'coach' THEN 'coach'::user_role
        ELSE 'coach'::user_role
      END,
      'coach'::user_role
    ),
    new.raw_user_meta_data->>'club_name'
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
