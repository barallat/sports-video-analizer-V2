import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://jqlcnnvpsraqxfdburmy.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpxbGNubnZwc3JhcXhmZGJ1cm15Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk5MTQ0NDMsImV4cCI6MjA2NTQ5MDQ0M30.FAyNL9Lx1zP72D1Zmj_VNjKJ7yKZKCqUFkTlJUKnNLo';

const supabase = createClient(supabaseUrl, supabaseKey);

async function fixAlturaType() {
  console.log('🔧 Corrigiendo tipo de datos de altura...');
  
  try {
    // Ejecutar la migración SQL directamente
    const { data, error } = await supabase.rpc('exec_sql', {
      sql: `
        -- Fix altura data type to allow proper height values
        ALTER TABLE public.jugadores 
        ALTER COLUMN altura TYPE DECIMAL(5,2);
        
        -- Also fix peso to be safe
        ALTER TABLE public.jugadores 
        ALTER COLUMN peso TYPE DECIMAL(6,2);
        
        -- Update constraints
        ALTER TABLE public.jugadores 
        DROP CONSTRAINT IF EXISTS check_altura_positive;
        
        ALTER TABLE public.jugadores 
        ADD CONSTRAINT check_altura_positive CHECK (altura IS NULL OR (altura > 0 AND altura <= 300));
        
        ALTER TABLE public.jugadores 
        DROP CONSTRAINT IF EXISTS check_peso_positive;
        
        ALTER TABLE public.jugadores 
        ADD CONSTRAINT check_peso_positive CHECK (peso IS NULL OR (peso > 0 AND peso <= 500));
      `
    });
    
    if (error) {
      console.error('❌ Error ejecutando migración:', error);
    } else {
      console.log('✅ Tipo de datos de altura corregido exitosamente');
    }
    
  } catch (error) {
    console.error('❌ Error general:', error);
  }
}

fixAlturaType();
