import { createClient } from '@supabase/supabase-js';

// Configuración de Supabase
const supabaseUrl = 'https://jqlcnnvpsraqxfdburmy.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpxbGNubnZwc3JhcXhmZGJ1cm15Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk5MTQ0NDMsImV4cCI6MjA2NTQ5MDQ0M30.FAyNL9Lx1zP72D1Zmj_VNjKJ7yKZKCqUFkTlJUKnNLo';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testPosiciones() {
  try {
    console.log('🔍 Verificando datos en jugador_posiciones...');
    
    // 1. Verificar si hay datos en la tabla
    const { data: posicionesData, error: posicionesError } = await supabase
      .from('jugador_posiciones')
      .select('*')
      .limit(10);
    
    if (posicionesError) {
      console.error('❌ Error obteniendo datos de jugador_posiciones:', posicionesError);
      return;
    }
    
    console.log(`📊 Datos en jugador_posiciones (${posicionesData.length} registros):`);
    posicionesData.forEach(pos => {
      console.log(`  - ID: ${pos.id}, Jugador: ${pos.jugador_id}, Posición: ${pos.posicion_id}`);
    });
    
    // 2. Verificar jugadores recientes
    const { data: jugadoresData, error: jugadoresError } = await supabase
      .from('jugadores')
      .select('id, nombre, created_at')
      .order('created_at', { ascending: false })
      .limit(5);
    
    if (jugadoresError) {
      console.error('❌ Error obteniendo jugadores:', jugadoresError);
      return;
    }
    
    console.log(`\n👥 Jugadores recientes (${jugadoresData.length} registros):`);
    jugadoresData.forEach(jug => {
      console.log(`  - ID: ${jug.id}, Nombre: ${jug.nombre}, Creado: ${jug.created_at}`);
    });
    
    // 3. Verificar posiciones disponibles
    const { data: posicionesDisponibles, error: posicionesDisponiblesError } = await supabase
      .from('posiciones')
      .select('id, nombre')
      .limit(5);
    
    if (posicionesDisponiblesError) {
      console.error('❌ Error obteniendo posiciones:', posicionesDisponiblesError);
      return;
    }
    
    console.log(`\n🏃 Posiciones disponibles (${posicionesDisponibles.length} registros):`);
    posicionesDisponibles.forEach(pos => {
      console.log(`  - ID: ${pos.id}, Nombre: ${pos.nombre}`);
    });
    
    // 4. Verificar si los jugadores tienen posiciones asignadas
    if (jugadoresData.length > 0) {
      console.log('\n🔍 Verificando posiciones de jugadores específicos...');
      
      for (const jugador of jugadoresData.slice(0, 3)) {
        const { data: jugadorPosiciones, error: jugadorPosicionesError } = await supabase
          .from('jugador_posiciones')
          .select(`
            posicion_id,
            posiciones!inner(nombre)
          `)
          .eq('jugador_id', jugador.id);
        
        if (jugadorPosicionesError) {
          console.error(`❌ Error obteniendo posiciones para ${jugador.nombre}:`, jugadorPosicionesError);
        } else {
          const posicionesNombres = jugadorPosiciones?.map(p => p.posiciones.nombre) || [];
          console.log(`  - ${jugador.nombre}: ${posicionesNombres.length > 0 ? posicionesNombres.join(', ') : 'Sin posiciones'}`);
        }
      }
    }
    
    // 5. Probar inserción de una posición de prueba
    if (jugadoresData.length > 0 && posicionesDisponibles.length > 0) {
      console.log('\n🧪 Probando inserción de posición...');
      
      const testJugadorId = jugadoresData[0].id;
      const testPosicionId = posicionesDisponibles[0].id;
      
      console.log(`Probando con jugador ${testJugadorId} y posición ${testPosicionId}`);
      
      const { data: insertData, error: insertError } = await supabase
        .from('jugador_posiciones')
        .insert({
          jugador_id: testJugadorId,
          posicion_id: testPosicionId
        })
        .select();
      
      if (insertError) {
        console.error('❌ Error insertando posición de prueba:', insertError);
      } else {
        console.log('✅ Inserción de posición exitosa:', insertData);
        
        // Limpiar el registro de prueba
        await supabase
          .from('jugador_posiciones')
          .delete()
          .eq('id', insertData[0].id);
        console.log('🧹 Registro de prueba eliminado');
      }
    }
    
  } catch (error) {
    console.error('❌ Error general:', error);
  }
}

testPosiciones();
