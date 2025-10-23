import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://jqlcnnvpsraqxfdburmy.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpxbGNubnZwc3JhcXhmZGJ1cm15Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk5MTQ0NDMsImV4cCI6MjA2NTQ5MDQ0M30.FAyNL9Lx1zP72D1Zmj_VNjKJ7yKZKCqUFkTlJUKnNLo';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testNewStructure() {
  console.log('🧪 Probando nueva estructura con user_id y clave_club...');
  
  try {
    // Crear un usuario de prueba
    const testEmail = `test-new-structure-${Date.now()}@example.com`;
    const testPassword = 'TestPassword123!';
    
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: testEmail,
      password: testPassword,
      options: {
        data: {
          nombre: 'Usuario Nueva Estructura',
          role: 'coach',
          club_name: 'Club Nueva Estructura'
        }
      }
    });
    
    if (authError) {
      console.error('❌ Error creando usuario:', authError);
      return;
    }
    
    console.log('✅ Usuario creado:', authData.user?.id);
    
    // Esperar un momento
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Hacer login
    const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
      email: testEmail,
      password: testPassword
    });
    
    if (loginError) {
      console.error('❌ Error en login:', loginError);
      return;
    }
    
    console.log('✅ Login exitoso');
    
    // Obtener datos del usuario
    const { data: usuarioData, error: usuarioError } = await supabase
      .from('usuarios')
      .select('id, clave_club')
      .eq('auth_user_id', loginData.user.id)
      .single();
    
    if (usuarioError || !usuarioData) {
      console.error('❌ Error obteniendo usuario:', usuarioError);
      return;
    }
    
    console.log('✅ Usuario obtenido:', {
      id: usuarioData.id,
      clave_club: usuarioData.clave_club
    });
    
    // Crear un jugador con la nueva estructura
    console.log('⚽ Creando jugador con nueva estructura...');
    const { data: jugador, error: jugadorError } = await supabase
      .from('jugadores')
      .insert({
        nombre: 'Jugador Nueva Estructura',
        fecha_nacimiento: '2000-01-01',
        altura: 1.85,
        peso: 75.0,
        user_id: usuarioData.id,
        clave_club: usuarioData.clave_club
      })
      .select('*')
      .single();
    
    if (jugadorError) {
      console.error('❌ Error creando jugador:', {
        code: jugadorError.code,
        message: jugadorError.message,
        details: jugadorError.details
      });
    } else {
      console.log('✅ Jugador creado exitosamente:', {
        id: jugador.id,
        nombre: jugador.nombre,
        user_id: jugador.user_id,
        clave_club: jugador.clave_club
      });
    }
    
    // Probar consulta de jugadores por clave_club
    console.log('🔍 Probando consulta por clave_club...');
    const { data: jugadores, error: jugadoresError } = await supabase
      .from('jugadores')
      .select('*')
      .eq('clave_club', usuarioData.clave_club);
    
    if (jugadoresError) {
      console.error('❌ Error consultando jugadores:', jugadoresError);
    } else {
      console.log('✅ Jugadores encontrados:', jugadores?.length || 0);
      jugadores?.forEach(jugador => {
        console.log(`  - ${jugador.nombre} (${jugador.clave_club})`);
      });
    }
    
  } catch (error) {
    console.error('❌ Error general:', error);
  }
}

testNewStructure();
