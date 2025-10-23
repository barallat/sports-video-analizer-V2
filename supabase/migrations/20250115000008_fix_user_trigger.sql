-- Fix user creation trigger
-- This migration fixes the trigger that creates usuarios records when auth.users are created

-- First, drop the existing trigger and function if they exist
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

-- Create a new, simplified function that handles user creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
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
    RAISE WARNING 'Error creating user record: %', SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create the trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create a function to manually create user records for existing auth users
CREATE OR REPLACE FUNCTION public.create_missing_user_records()
RETURNS void AS $$
DECLARE
  auth_user RECORD;
  user_role_value user_role;
  user_name TEXT;
  club_name_value TEXT;
  clave_club_value VARCHAR(6);
BEGIN
  -- Loop through all auth users that don't have a corresponding usuarios record
  FOR auth_user IN 
    SELECT au.id, au.email, au.raw_user_meta_data, au.created_at
    FROM auth.users au
    LEFT JOIN public.usuarios u ON au.id = u.auth_user_id
    WHERE u.auth_user_id IS NULL
  LOOP
    -- Determine user role from metadata
    IF auth_user.raw_user_meta_data->>'role' = 'athlete' THEN
      user_role_value := 'athlete'::user_role;
    ELSE
      user_role_value := 'coach'::user_role;
    END IF;
    
    -- Get user name from metadata
    user_name := COALESCE(
      auth_user.raw_user_meta_data->>'nombre', 
      auth_user.raw_user_meta_data->>'name', 
      'Usuario'
    );
    
    -- Get club name from metadata
    club_name_value := auth_user.raw_user_meta_data->>'club_name';
    
    -- Generate Clave Club for coaches with club name
    IF user_role_value = 'coach' AND club_name_value IS NOT NULL AND club_name_value != '' THEN
      clave_club_value := generate_clave_club();
    ELSE
      clave_club_value := NULL;
    END IF;
    
    -- Insert into usuarios table
    INSERT INTO public.usuarios (auth_user_id, nombre, email, role, club_name, clave_club)
    VALUES (
      auth_user.id,
      user_name,
      auth_user.email,
      user_role_value,
      club_name_value,
      clave_club_value
    );
    
    RAISE NOTICE 'Created user record for auth user: %', auth_user.email;
  END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Execute the function to create missing user records
SELECT public.create_missing_user_records();

-- Drop the temporary function
DROP FUNCTION public.create_missing_user_records();
