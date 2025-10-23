import { createClient } from '@supabase/supabase-js';

// Configuración de Supabase
const supabaseUrl = 'https://jqlcnnvpsraqxfdburmy.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpxbGNubnZwc3JhcXhmZGJ1cm15Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk5MTQ0NDMsImV4cCI6MjA2NTQ5MDQ0M30.FAyNL9Lx1zP72D1Zmj_VNjKJ7yKZKCqUFkTlJUKnNLo';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkMigration() {
  try {
    console.log('🔍 Verificando si la migración se ha aplicado...');
    
    // Intentar obtener jugadores con los nuevos campos
    const { data: jugadoresData, error: jugadoresError } = await supabase
      .from('jugadores')
      .select('id, nombre, user_id, clave_club, equipo_id')
      .limit(5);
    
    if (jugadoresError) {
      console.error('❌ Error obteniendo jugadores:', jugadoresError);
      
      // Si el error es que no existen los campos, la migración no se ha aplicado
      if (jugadoresError.message.includes('user_id') || jugadoresError.message.includes('clave_club')) {
        console.log('⚠️ Los campos user_id y/o clave_club no existen. La migración no se ha aplicado.');
        return;
      }
    }
    
    console.log(`✅ Migración aplicada. Jugadores encontrados (${jugadoresData.length}):`);
    jugadoresData.forEach(jug => {
      console.log(`  - ${jug.nombre} (ID: ${jug.id})`);
      console.log(`    - user_id: ${jug.user_id}`);
      console.log(`    - clave_club: ${jug.clave_club}`);
      console.log(`    - equipo_id: ${jug.equipo_id}`);
    });
    
    // Verificar si hay datos en jugador_posiciones
    const { data: posicionesData, error: posicionesError } = await supabase
      .from('jugador_posiciones')
      .select('*')
      .limit(5);
    
    if (posicionesError) {
      console.error('❌ Error obteniendo posiciones:', posicionesError);
    } else {
      console.log(`\n📊 Posiciones en jugador_posiciones (${posicionesData.length}):`);
      posicionesData.forEach(pos => {
        console.log(`  - Jugador: ${pos.jugador_id}, Posición: ${pos.posicion_id}`);
      });
    }
    
  } catch (error) {
    console.error('❌ Error general:', error);
  }
}

checkMigration();
