import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://jqlcnnvpsraqxfdburmy.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpxbGNubnZwc3JhcXhmZGJ1cm15Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk5MTQ0NDMsImV4cCI6MjA2NTQ5MDQ0M30.FAyNL9Lx1zP72D1Zmj_VNjKJ7yKZKCqUFkTlJUKnNLo';

const supabase = createClient(supabaseUrl, supabaseKey);

async function applyRLSFix() {
  console.log('🔧 Aplicando corrección de políticas RLS...');
  
  try {
    // Ejecutar la migración SQL directamente
    const { data, error } = await supabase.rpc('exec_sql', {
      sql: `
        -- Drop existing policies
        DROP POLICY IF EXISTS "Users can insert players into their teams" ON public.jugadores;
        DROP POLICY IF EXISTS "Users can view players from their teams" ON public.jugadores;
        DROP POLICY IF EXISTS "Users can update players from their teams" ON public.jugadores;
        DROP POLICY IF EXISTS "Users can delete players from their teams" ON public.jugadores;
        
        -- Create new policies that allow null equipo_id
        CREATE POLICY "Users can insert players" ON public.jugadores
        FOR INSERT WITH CHECK (
          (equipo_id IS NULL) OR 
          (equipo_id IN (
            SELECT id FROM public.equipos 
            WHERE usuario_id IN (
              SELECT id FROM public.usuarios 
              WHERE auth_user_id = auth.uid()
            )
          ))
        );
        
        CREATE POLICY "Users can view players" ON public.jugadores
        FOR SELECT USING (
          (equipo_id IN (
            SELECT id FROM public.equipos 
            WHERE usuario_id IN (
              SELECT id FROM public.usuarios 
              WHERE auth_user_id = auth.uid()
            )
          )) OR
          (equipo_id IS NULL)
        );
        
        CREATE POLICY "Users can update players" ON public.jugadores
        FOR UPDATE USING (
          (equipo_id IN (
            SELECT id FROM public.equipos 
            WHERE usuario_id IN (
              SELECT id FROM public.usuarios 
              WHERE auth_user_id = auth.uid()
            )
          )) OR
          (equipo_id IS NULL)
        );
        
        CREATE POLICY "Users can delete players" ON public.jugadores
        FOR DELETE USING (
          (equipo_id IN (
            SELECT id FROM public.equipos 
            WHERE usuario_id IN (
              SELECT id FROM public.usuarios 
              WHERE auth_user_id = auth.uid()
            )
          )) OR
          (equipo_id IS NULL)
        );
        
        -- Allow null equipo_id
        ALTER TABLE public.jugadores 
        ALTER COLUMN equipo_id DROP NOT NULL;
      `
    });
    
    if (error) {
      console.error('❌ Error ejecutando migración:', error);
    } else {
      console.log('✅ Políticas RLS corregidas exitosamente');
    }
    
  } catch (error) {
    console.error('❌ Error general:', error);
  }
}

applyRLSFix();
