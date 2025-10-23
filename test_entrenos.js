// Script para probar la funcionalidad de entrenos
// Ejecutar en la consola del navegador después de cargar la página

console.log('=== Test de Entrenos ===');

// Función para crear un entreno de prueba
async function createTestEntreno(teamId, fecha, hora, lugar, entrada) {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      console.error('No hay usuario autenticado');
      return;
    }

    // Obtener el user_id de la tabla usuarios
    const { data: userData, error: userError } = await supabase
      .from('usuarios')
      .select('id')
      .eq('auth_user_id', user.id)
      .single();

    if (userError || !userData) {
      console.error('Error obteniendo user_id:', userError);
      return;
    }

    // Crear el entreno
    const { data, error } = await supabase
      .from('entrenos')
      .insert({
        equipo_id: teamId,
        user_id: userData.id,
        fecha: fecha,
        hora: hora,
        lugar: lugar,
        entrada: entrada
      })
      .select();

    if (error) {
      console.error('Error creando entreno:', error);
    } else {
      console.log('Entreno creado:', data);
    }
  } catch (error) {
    console.error('Error:', error);
  }
}

// Función para listar entrenos de un equipo
async function listEntrenos(teamId) {
  try {
    const { data, error } = await supabase
      .from('entrenos')
      .select('*')
      .eq('equipo_id', teamId)
      .order('fecha', { ascending: true });

    if (error) {
      console.error('Error listando entrenos:', error);
    } else {
      console.log('Entrenos del equipo:', data);
    }
  } catch (error) {
    console.error('Error:', error);
  }
}

// Exportar funciones para uso en consola
window.createTestEntreno = createTestEntreno;
window.listEntrenos = listEntrenos;

console.log('Funciones disponibles:');
console.log('- createTestEntreno(teamId, fecha, hora, lugar, entrada)');
console.log('- listEntrenos(teamId)');
console.log('');
console.log('Ejemplo de uso:');
console.log('createTestEntreno("tu-team-id", "2025-01-20", "18:00", "Campo Principal", "Entrenamiento de prueba")');
