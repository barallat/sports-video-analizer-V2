-- Fix the handle_new_user trigger to work correctly
-- This migration ensures the trigger properly inserts users into public.usuarios

-- First, drop the existing trigger and function
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

-- Create a simplified and working handle_new_user function
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  user_role_value user_role;
  user_name TEXT;
  club_name_value TEXT;
  clave_club_value VARCHAR(6);
BEGIN
  -- Determine user role from metadata
  IF NEW.raw_user_meta_data->>'role' = 'athlete' THEN
    user_role_value := 'athlete'::user_role;
  ELSE
    user_role_value := 'coach'::user_role;
  END IF;
  
  -- Get user name from metadata
  user_name := COALESCE(
    NEW.raw_user_meta_data->>'nombre', 
    NEW.raw_user_meta_data->>'name', 
    'Usuario'
  );
  
  -- Get club name from metadata
  club_name_value := NEW.raw_user_meta_data->>'club_name';
  
  -- Generate Clave Club for coaches with club name
  IF user_role_value = 'coach' AND club_name_value IS NOT NULL AND club_name_value != '' THEN
    clave_club_value := generate_clave_club();
  ELSE
    clave_club_value := NULL;
  END IF;
  
  -- Insert into usuarios table
  INSERT INTO public.usuarios (auth_user_id, nombre, email, role, club_name, clave_club)
  VALUES (
    NEW.id,
    user_name,
    NEW.email,
    user_role_value,
    club_name_value,
    clave_club_value
  );
  
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Log the error but don't fail the user creation
    RAISE WARNING 'Error in handle_new_user trigger: %', SQLERRM;
    RETURN NEW;
END;
$$;

-- Recreate the trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW 
  EXECUTE FUNCTION public.handle_new_user();

-- Ensure the generate_clave_club function exists
CREATE OR REPLACE FUNCTION generate_clave_club()
RETURNS VARCHAR(6)
LANGUAGE plpgsql
AS $$
DECLARE
  clave VARCHAR(6);
  exists_count INTEGER;
BEGIN
  LOOP
    -- Generate a 6-character random string
    clave := UPPER(SUBSTRING(MD5(RANDOM()::TEXT) FROM 1 FOR 6));
    
    -- Check if this clave already exists
    SELECT COUNT(*) INTO exists_count 
    FROM usuarios 
    WHERE clave_club = clave;
    
    -- If it doesn't exist, we can use it
    IF exists_count = 0 THEN
      EXIT;
    END IF;
  END LOOP;
  
  RETURN clave;
END;
$$;
