-- Simplificar la función handle_new_user para evitar errores de tipo
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  user_role_value user_role;
  user_name TEXT;
  club_name_value TEXT;
BEGIN
  -- Determinar el rol del usuario
  IF new.raw_user_meta_data->>'role' = 'athlete' THEN
    user_role_value := 'athlete'::user_role;
  ELSE
    user_role_value := 'coach'::user_role;
  END IF;
  
  -- Obtener el nombre del usuario
  user_name := COALESCE(
    new.raw_user_meta_data->>'nombre', 
    new.raw_user_meta_data->>'name', 
    'Usuario'
  );
  
  -- Obtener el nombre del club
  club_name_value := new.raw_user_meta_data->>'club_name';
  
  -- Insertar en la tabla usuarios
  INSERT INTO public.usuarios (auth_user_id, nombre, email, role, club_name)
  VALUES (
    new.id,
    user_name,
    new.email,
    user_role_value,
    club_name_value
  );
  
  RETURN new;
EXCEPTION
  WHEN OTHERS THEN
    -- En caso de error, insertar con valores por defecto
    INSERT INTO public.usuarios (auth_user_id, nombre, email, role, club_name)
    VALUES (
      new.id,
      'Usuario',
      new.email,
      'coach'::user_role,
      NULL
    );
    RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
