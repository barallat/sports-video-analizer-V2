const fs = require('fs');

// Leer el archivo
let content = fs.readFileSync('src/components/NewAnalysisView.tsx', 'utf8');

// Reemplazar la función loadJugadores
const newLoadJugadores = `  const loadJugadores = async () => {
    try {
      // Primero obtener los IDs de los jugadores del equipo
      const { data: jugadorEquipos, error: jugadorEquiposError } = await supabase
        .from('jugador_equipos')
        .select('jugador_id')
        .eq('equipo_id', selectedEquipo);

      if (jugadorEquiposError) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "No se pudieron cargar los jugadores del equipo"
        });
        return;
      }

      if (!jugadorEquipos || jugadorEquipos.length === 0) {
        setJugadores([]);
        return;
      }

      const jugadorIds = jugadorEquipos.map(item => item.jugador_id);

      // Ahora obtener los datos de los jugadores
      const { data, error } = await supabase
        .from('jugadores')
        .select('id, nombre')
        .in('id', jugadorIds);

      if (error) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "No se pudieron cargar los jugadores"
        });
      } else {
        setJugadores(data || []);
      }
    } catch (error) {
      console.error('Error loading jugadores:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Error al cargar los jugadores"
      });
    }
  };`;

// Reemplazar la función completa
content = content.replace(
  /const loadJugadores = async \(\) => \{[\s\S]*?\};/,
  newLoadJugadores
);

// Escribir el archivo actualizado
fs.writeFileSync('src/components/NewAnalysisView.tsx', content);
console.log('Archivo actualizado correctamente');
