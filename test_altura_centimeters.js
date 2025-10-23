import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://jqlcnnvpsraqxfdburmy.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpxbGNubnZwc3JhcXhmZGJ1cm15Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk5MTQ0NDMsImV4cCI6MjA2NTQ5MDQ0M30.FAyNL9Lx1zP72D1Zmj_VNjKJ7yKZKCqUFkTlJUKnNLo';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testAlturaCentimeters() {
  console.log('🧪 Probando altura en centímetros...');
  
  try {
    // Crear un usuario de prueba
    const testEmail = `test-altura-${Date.now()}@example.com`;
    const testPassword = 'TestPassword123!';
    
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: testEmail,
      password: testPassword,
      options: {
        data: {
          nombre: 'Usuario Altura Test',
          role: 'coach',
          club_name: 'Club Altura Test'
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
        nombre: 'Equipo Altura Test',
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
    
    // Probar diferentes valores de altura
    const testHeights = [
      { name: '1.75m (metros)', value: 1.75 },
      { name: '175cm (centímetros)', value: 175 },
      { name: '1.80m (metros)', value: 1.80 },
      { name: '180cm (centímetros)', value: 180 }
    ];
    
    for (const test of testHeights) {
      console.log(`\n🧪 Probando ${test.name}: ${test.value}`);
      
      const { data: jugador, error: jugadorError } = await supabase
        .from('jugadores')
        .insert({
          equipo_id: equipo.id,
          nombre: `Jugador ${test.name}`,
          fecha_nacimiento: '2000-01-01',
          altura: test.value,
          peso: 70.0
        })
        .select()
        .single();
      
      if (jugadorError) {
        console.error(`❌ Error con ${test.name}:`, {
          code: jugadorError.code,
          message: jugadorError.message,
          details: jugadorError.details
        });
      } else {
        console.log(`✅ Éxito con ${test.name}:`, jugador.nombre);
      }
    }
    
  } catch (error) {
    console.error('❌ Error general:', error);
  }
}

testAlturaCentimeters();
