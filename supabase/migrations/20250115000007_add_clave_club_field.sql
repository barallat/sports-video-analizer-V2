-- Add Clave Club field to usuarios table
ALTER TABLE usuarios ADD COLUMN clave_club VARCHAR(6);

-- Add comment to describe the field
COMMENT ON COLUMN usuarios.clave_club IS 'Clave única del club generada automáticamente para gestores (coach) con formato CCC-NN';

-- Create function to generate Clave Club (CCC-NN format)
CREATE OR REPLACE FUNCTION generate_clave_club()
RETURNS VARCHAR(6) AS $$
DECLARE
  clave VARCHAR(6);
  chars VARCHAR(26) := 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  char1 CHAR(1);
  char2 CHAR(1);
  char3 CHAR(1);
  num1 INTEGER;
  num2 INTEGER;
  exists_check INTEGER;
BEGIN
  LOOP
    -- Generate 3 random characters
    char1 := substr(chars, floor(random() * 26 + 1)::integer, 1);
    char2 := substr(chars, floor(random() * 26 + 1)::integer, 1);
    char3 := substr(chars, floor(random() * 26 + 1)::integer, 1);
    
    -- Generate 2 random numbers
    num1 := floor(random() * 10)::integer;
    num2 := floor(random() * 10)::integer;
    
    -- Format as CCC-NN
    clave := char1 || char2 || char3 || '-' || num1 || num2;
    
    -- Check if this clave already exists
    SELECT COUNT(*) INTO exists_check 
    FROM usuarios 
    WHERE clave_club = clave;
    
    -- If it doesn't exist, we can use it
    IF exists_check = 0 THEN
      EXIT;
    END IF;
  END LOOP;
  
  RETURN clave;
END;
$$ LANGUAGE plpgsql;

-- Create function to generate Clave Club for existing coaches with club name
CREATE OR REPLACE FUNCTION generate_clave_club_for_existing_coaches()
RETURNS VOID AS $$
DECLARE
  coach_record RECORD;
BEGIN
  -- Update all existing coaches that have club_name but no clave_club
  FOR coach_record IN 
    SELECT id FROM usuarios 
    WHERE role = 'coach' 
    AND club_name IS NOT NULL 
    AND club_name != ''
    AND clave_club IS NULL
  LOOP
    UPDATE usuarios 
    SET clave_club = generate_clave_club()
    WHERE id = coach_record.id;
  END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Generate Clave Club for existing coaches
SELECT generate_clave_club_for_existing_coaches();

-- Drop the temporary function
DROP FUNCTION generate_clave_club_for_existing_coaches();

-- Create function to handle Clave Club generation when club_name is updated
CREATE OR REPLACE FUNCTION handle_clave_club_generation()
RETURNS TRIGGER AS $$
BEGIN
  -- Only for coaches
  IF NEW.role = 'coach' THEN
    -- If club_name is being set and clave_club is null, generate it
    IF NEW.club_name IS NOT NULL 
       AND NEW.club_name != '' 
       AND NEW.club_name != OLD.club_name 
       AND NEW.clave_club IS NULL THEN
      NEW.clave_club := generate_clave_club();
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for Clave Club generation on update
CREATE TRIGGER trigger_generate_clave_club_on_update
  BEFORE UPDATE ON usuarios
  FOR EACH ROW
  EXECUTE FUNCTION handle_clave_club_generation();

-- Update the existing user creation trigger to generate Clave Club for new coaches
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  user_role_value user_role;
  user_name TEXT;
  club_name_value TEXT;
  clave_club_value VARCHAR(6);
BEGIN
  -- Determine user role
  IF new.raw_user_meta_data->>'role' = 'athlete' THEN
    user_role_value := 'athlete'::user_role;
  ELSE
    user_role_value := 'coach'::user_role;
  END IF;
  
  -- Get user name
  user_name := COALESCE(
    new.raw_user_meta_data->>'nombre', 
    new.raw_user_meta_data->>'name', 
    'Usuario'
  );
  
  -- Get club name
  club_name_value := new.raw_user_meta_data->>'club_name';
  
  -- Generate Clave Club for coaches with club name
  IF user_role_value = 'coach' AND club_name_value IS NOT NULL AND club_name_value != '' THEN
    clave_club_value := generate_clave_club();
  ELSE
    clave_club_value := NULL;
  END IF;
  
  -- Insert into usuarios table
  INSERT INTO public.usuarios (auth_user_id, nombre, email, role, club_name, clave_club)
  VALUES (
    new.id,
    user_name,
    new.email,
    user_role_value,
    club_name_value,
    clave_club_value
  );
  
  RETURN new;
EXCEPTION
  WHEN OTHERS THEN
    -- In case of error, insert with default values
    INSERT INTO public.usuarios (auth_user_id, nombre, email, role, club_name, clave_club)
    VALUES (
      new.id,
      'Usuario',
      new.email,
      'coach'::user_role,
      NULL,
      NULL
    );
    RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
