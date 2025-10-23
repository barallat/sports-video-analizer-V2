import { createClient } from '@supabase/supabase-js';

// Configuración de Supabase
const supabaseUrl = 'https://jqlcnnvpsraqxfdburmy.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpxbGNubnZwc3JhcXhmZGJ1cm15Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk5MTQ0NDMsImV4cCI6MjA2NTQ5MDQ0M30.FAyNL9Lx1zP72D1Zmj_VNjKJ7yKZKCqUFkTlJUKnNLo';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testPosicionesDetailed() {
  try {
    console.log('🔍 Verificando jugadores y posiciones...');
    
    // 1. Obtener jugadores
    const { data: jugadoresData, error: jugadoresError } = await supabase
      .from('jugadores')
      .select('id, nombre, user_id, clave_club')
      .limit(5);
    
    if (jugadoresError) {
      console.error('❌ Error obteniendo jugadores:', jugadoresError);
      return;
    }
    
    console.log(`👥 Jugadores encontrados (${jugadoresData.length}):`);
    jugadoresData.forEach(jug => {
      console.log(`  - ${jug.nombre} (ID: ${jug.id}, User: ${jug.user_id}, Clave: ${jug.clave_club})`);
    });
    
    if (jugadoresData.length === 0) {
      console.log('❌ No hay jugadores para probar');
      return;
    }
    
    // 2. Obtener posiciones
    const { data: posicionesData, error: posicionesError } = await supabase
      .from('posiciones')
      .select('id, nombre')
      .limit(3);
    
    if (posicionesError) {
      console.error('❌ Error obteniendo posiciones:', posicionesError);
      return;
    }
    
    console.log(`\n🏃 Posiciones disponibles (${posicionesData.length}):`);
    posicionesData.forEach(pos => {
      console.log(`  - ${pos.nombre} (ID: ${pos.id})`);
    });
    
    if (posicionesData.length === 0) {
      console.log('❌ No hay posiciones para probar');
      return;
    }
    
    // 3. Verificar posiciones actuales de cada jugador
    console.log('\n🔍 Verificando posiciones actuales de jugadores...');
    for (const jugador of jugadoresData) {
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
    
    // 4. Probar inserción de posición
    console.log('\n🧪 Probando inserción de posición...');
    const testJugador = jugadoresData[0];
    const testPosicion = posicionesData[0];
    
    console.log(`Probando con jugador: ${testJugador.nombre} (${testJugador.id})`);
    console.log(`Y posición: ${testPosicion.nombre} (${testPosicion.id})`);
    
    // Verificar si ya existe esta combinación
    const { data: existingPosicion, error: existingError } = await supabase
      .from('jugador_posiciones')
      .select('id')
      .eq('jugador_id', testJugador.id)
      .eq('posicion_id', testPosicion.id)
      .single();
    
    if (existingError && existingError.code !== 'PGRST116') {
      console.error('❌ Error verificando posición existente:', existingError);
      return;
    }
    
    if (existingPosicion) {
      console.log('⚠️ Esta combinación ya existe, probando con otra posición...');
      const testPosicion2 = posicionesData[1];
      if (testPosicion2) {
        await testInsertPosition(testJugador.id, testPosicion2.id, testJugador.nombre, testPosicion2.nombre);
      }
    } else {
      await testInsertPosition(testJugador.id, testPosicion.id, testJugador.nombre, testPosicion.nombre);
    }
    
  } catch (error) {
    console.error('❌ Error general:', error);
  }
}

async function testInsertPosition(jugadorId, posicionId, jugadorNombre, posicionNombre) {
  try {
    console.log(`\n📝 Insertando posición ${posicionNombre} para ${jugadorNombre}...`);
    
    const { data: insertData, error: insertError } = await supabase
      .from('jugador_posiciones')
      .insert({
        jugador_id: jugadorId,
        posicion_id: posicionId
      })
      .select();
    
    if (insertError) {
      console.error('❌ Error insertando posición:', insertError);
      console.error('Detalles del error:', JSON.stringify(insertError, null, 2));
    } else {
      console.log('✅ Inserción exitosa:', insertData);
      
      // Verificar que se insertó correctamente
      const { data: verifyData, error: verifyError } = await supabase
        .from('jugador_posiciones')
        .select(`
          id,
          jugador_id,
          posicion_id,
          posiciones!inner(nombre)
        `)
        .eq('id', insertData[0].id)
        .single();
      
      if (verifyError) {
        console.error('❌ Error verificando inserción:', verifyError);
      } else {
        console.log('✅ Verificación exitosa:', verifyData);
      }
      
      // Limpiar el registro de prueba
      console.log('🧹 Limpiando registro de prueba...');
      const { error: deleteError } = await supabase
        .from('jugador_posiciones')
        .delete()
        .eq('id', insertData[0].id);
      
      if (deleteError) {
        console.error('❌ Error eliminando registro de prueba:', deleteError);
      } else {
        console.log('✅ Registro de prueba eliminado');
      }
    }
  } catch (error) {
    console.error('❌ Error en testInsertPosition:', error);
  }
}

testPosicionesDetailed();
