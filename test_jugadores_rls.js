import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://jqlcnnvpsraqxfdburmy.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpxbGNubnZwc3JhcXhmZGJ1cm15Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk5MTQ0NDMsImV4cCI6MjA2NTQ5MDQ0M30.FAyNL9Lx1zP72D1Zmj_VNjKJ7yKZKCqUFkTlJUKnNLo';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testJugadoresRLS() {
  console.log('🧪 Probando políticas RLS para jugadores...');
  
  try {
    // 1. Crear un usuario de prueba
    console.log('👤 Creando usuario de prueba...');
    const testEmail = `test-rls-${Date.now()}@example.com`;
    const testPassword = 'TestPassword123!';
    
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: testEmail,
      password: testPassword,
      options: {
        data: {
          nombre: 'Usuario RLS Test',
          role: 'coach',
          club_name: 'Club RLS Test'
        }
      }
    });
    
    if (authError) {
      console.error('❌ Error creando usuario:', authError);
      return;
    }
    
    console.log('✅ Usuario creado:', authData.user?.id);
    
    // Esperar un momento para que el trigger se ejecute
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // 2. Verificar que el usuario se creó en public.usuarios
    const { data: usuario, error: usuarioError } = await supabase
      .from('usuarios')
      .select('*')
      .eq('auth_user_id', authData.user.id)
      .single();
    
    if (usuarioError) {
      console.error('❌ Error obteniendo usuario:', usuarioError);
      return;
    }
    
    console.log('✅ Usuario en public.usuarios:', usuario.nombre);
    
    // 3. Hacer login
    const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
      email: testEmail,
      password: testPassword
    });
    
    if (loginError) {
      console.error('❌ Error en login:', loginError);
      return;
    }
    
    console.log('✅ Login exitoso');
    
    // 4. Crear un deporte
    console.log('⚽ Creando deporte...');
    const { data: deporte, error: deporteError } = await supabase
      .from('deportes')
      .select('*')
      .eq('nombre', 'Fútbol')
      .single();
    
    if (deporteError) {
      console.error('❌ Error obteniendo deporte:', deporteError);
      return;
    }
    
    console.log('✅ Deporte encontrado:', deporte.nombre);
    
    // 5. Crear un equipo
    console.log('🏟️ Creando equipo...');
    const { data: equipo, error: equipoError } = await supabase
      .from('equipos')
      .insert({
        nombre: 'Equipo Test RLS',
        deporte_id: deporte.id,
        usuario_id: usuario.id
      })
      .select()
      .single();
    
    if (equipoError) {
      console.error('❌ Error creando equipo:', equipoError);
      return;
    }
    
    console.log('✅ Equipo creado:', equipo.nombre);
    
    // 6. Intentar crear un jugador
    console.log('⚽ Creando jugador...');
    const { data: jugador, error: jugadorError } = await supabase
      .from('jugadores')
      .insert({
        equipo_id: equipo.id,
        nombre: 'Jugador Test RLS',
        fecha_nacimiento: '2000-01-01',
        altura: 1.75,  // Usar metros en lugar de centímetros
        peso: 70.0
      })
      .select()
      .single();
    
    if (jugadorError) {
      console.error('❌ Error creando jugador:', jugadorError);
      console.log('🔍 Detalles del error:', {
        code: jugadorError.code,
        message: jugadorError.message,
        details: jugadorError.details,
        hint: jugadorError.hint
      });
    } else {
      console.log('✅ Jugador creado exitosamente:', jugador.nombre);
    }
    
  } catch (error) {
    console.error('❌ Error general:', error);
  }
}

testJugadoresRLS();
