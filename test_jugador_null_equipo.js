import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://jqlcnnvpsraqxfdburmy.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpxbGNubnZwc3JhcXhmZGJ1cm15Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk5MTQ0NDMsImV4cCI6MjA2NTQ5MDQ0M30.FAyNL9Lx1zP72D1Zmj_VNjKJ7yKZKCqUFkTlJUKnNLo';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testJugadorNullEquipo() {
  console.log('🧪 Probando creación de jugador con equipo_id nulo...');
  
  try {
    // Crear un usuario de prueba
    const testEmail = `test-null-equipo-${Date.now()}@example.com`;
    const testPassword = 'TestPassword123!';
    
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: testEmail,
      password: testPassword,
      options: {
        data: {
          nombre: 'Usuario Null Equipo Test',
          role: 'coach',
          club_name: 'Club Null Equipo Test'
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
    
    // Obtener usuario
    const { data: usuario, error: usuarioError } = await supabase
      .from('usuarios')
      .select('*')
      .eq('auth_user_id', loginData.user.id)
      .single();
    
    if (usuarioError) {
      console.error('❌ Error obteniendo usuario:', usuarioError);
      return;
    }
    
    console.log('✅ Usuario obtenido:', usuario.nombre);
    
    // Probar crear jugador con equipo_id nulo
    console.log('⚽ Creando jugador con equipo_id nulo...');
    const { data: jugador, error: jugadorError } = await supabase
      .from('jugadores')
      .insert({
        equipo_id: null,  // equipo_id nulo
        nombre: 'Jugador Sin Equipo',
        fecha_nacimiento: '2000-01-01',
        altura: 1.94,  // 1.94 metros
        peso: 80.0
      })
      .select()
      .single();
    
    if (jugadorError) {
      console.error('❌ Error creando jugador con equipo_id nulo:', {
        code: jugadorError.code,
        message: jugadorError.message,
        details: jugadorError.details,
        hint: jugadorError.hint
      });
    } else {
      console.log('✅ Jugador creado exitosamente con equipo_id nulo:', {
        id: jugador.id,
        nombre: jugador.nombre,
        equipo_id: jugador.equipo_id,
        altura: jugador.altura
      });
    }
    
    // También probar con un equipo válido
    console.log('\n🏟️ Creando equipo y probando con equipo_id válido...');
    
    // Obtener deporte
    const { data: deporte, error: deporteError } = await supabase
      .from('deportes')
      .select('*')
      .eq('nombre', 'Fútbol')
      .single();
    
    if (deporteError) {
      console.error('❌ Error obteniendo deporte:', deporteError);
      return;
    }
    
    // Crear equipo
    const { data: equipo, error: equipoError } = await supabase
      .from('equipos')
      .insert({
        nombre: 'Equipo Test',
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
    
    // Crear jugador con equipo_id válido
    const { data: jugadorConEquipo, error: jugadorConEquipoError } = await supabase
      .from('jugadores')
      .insert({
        equipo_id: equipo.id,  // equipo_id válido
        nombre: 'Jugador Con Equipo',
        fecha_nacimiento: '2000-01-01',
        altura: 1.85,
        peso: 75.0
      })
      .select()
      .single();
    
    if (jugadorConEquipoError) {
      console.error('❌ Error creando jugador con equipo_id válido:', {
        code: jugadorConEquipoError.code,
        message: jugadorConEquipoError.message,
        details: jugadorConEquipoError.details
      });
    } else {
      console.log('✅ Jugador creado exitosamente con equipo_id válido:', {
        id: jugadorConEquipo.id,
        nombre: jugadorConEquipo.nombre,
        equipo_id: jugadorConEquipo.equipo_id,
        altura: jugadorConEquipo.altura
      });
    }
    
  } catch (error) {
    console.error('❌ Error general:', error);
  }
}

testJugadorNullEquipo();
