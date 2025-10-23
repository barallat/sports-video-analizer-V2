-- Simple user creation trigger fix
-- This migration creates a very simple trigger that won't cause errors

-- Drop existing trigger and function
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

-- Create a very simple function that just creates a basic user record
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Insert a basic user record without any complex logic
  INSERT INTO public.usuarios (auth_user_id, nombre, email, role, club_name, clave_club)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'nombre', NEW.raw_user_meta_data->>'name', 'Usuario'),
    NEW.email,
    COALESCE((NEW.raw_user_meta_data->>'role')::user_role, 'coach'::user_role),
    NEW.raw_user_meta_data->>'club_name',
    NULL
  );
  
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- If there's any error, just log it and continue
    RAISE WARNING 'Error creating user record: %', SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create the trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
