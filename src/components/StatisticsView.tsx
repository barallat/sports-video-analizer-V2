import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Trophy, Users, Target, TrendingUp, Award, Star } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useLanguage } from '@/contexts/LanguageContext';
import { useSportConfigContext } from '@/contexts/SportConfigContext';

interface StatisticsViewProps {
  onBack: () => void;
  userName?: string;
  onLogout?: () => Promise<void>;
}

interface AnalysisResult {
  puntuacion?: number;
  score?: number;
  [key: string]: any;
}

interface Statistic {
  id: string;
  title: string;
  value: string | number;
  icon: any;
  description: string;
}

interface BestPlayerByPosition {
  position: string;
  playerName: string;
  averageScore: number;
  analysisCount: number;
}

export function StatisticsView({ onBack, userName, onLogout }: StatisticsViewProps) {
  const [statistics, setStatistics] = useState<Statistic[]>([]);
  const [bestPlayersByPosition, setBestPlayersByPosition] = useState<BestPlayerByPosition[]>([]);
  const [loading, setLoading] = useState(true);
  const { t } = useLanguage();
  const { features, database, sportDisplayName } = useSportConfigContext();

  useEffect(() => {
    loadStatistics();
  }, []);

  const loadStatistics = async () => {
    try {
      const { data: userData, error: userError } = await supabase
        .from('usuarios')
        .select('id')
        .eq('auth_user_id', (await supabase.auth.getUser()).data.user?.id)
        .single();

      if (userError || !userData) {
        console.error('Error getting user:', userError);
        return;
      }

      // Cargar análisis del usuario con información de posiciones
      let query = supabase
        .from('analisis_videos')
        .select(`
          *,
          jugadores(
            nombre, 
            equipo_id,
            user_id,
            clave_club,
            equipos(
              nombre, 
              deportes(nombre)
            )
          ),
          deportes(
            nombre
          ),
          posicion_movimientos(
            posicion_id,
            posiciones(
              nombre,
              deporte_id
            )
          )
        `)
        .eq('usuario_id', userData.id);

      // En modo deporte individual, filtrar por deporte
      if (features.skipSportsConfig && database.sportFilter !== 'all') {
        query = query.eq('deporte_id', database.sportFilter);
      }

      const { data: analisis, error: analysisError } = await query;

      if (analysisError) {
        console.error('Error loading analysis:', analysisError);
        return;
      }

      if (!analisis) return;

      // Calcular estadísticas
      const stats: Statistic[] = [];

      // Total de análisis
      stats.push({
        id: '1',
        title: features.skipSportsConfig ? `Total de Análisis de ${sportDisplayName}` : 'Total de Análisis',
        value: analisis.length,
        icon: Trophy,
        description: features.skipSportsConfig ? `Análisis realizados en ${sportDisplayName}` : 'Análisis realizados en total'
      });

      // Análisis por equipo
      const equipos = analisis.reduce((acc: any, item) => {
        const equipoNombre = item.jugadores?.equipos?.nombre || 'Sin equipo';
        acc[equipoNombre] = (acc[equipoNombre] || 0) + 1;
        return acc;
      }, {});

      const equipoConMasAnalisis = Object.entries(equipos).reduce((a: any, b: any) => 
        equipos[a[0]] > equipos[b[0]] ? a : b, ['', 0]);

      if (equipoConMasAnalisis[0]) {
        stats.push({
          id: '2',
          title: 'Equipo más analizado',
          value: equipoConMasAnalisis[0],
          icon: Users,
          description: `${equipoConMasAnalisis[1]} análisis`
        });
      }

      // Jugador con más análisis
      const jugadores = analisis.reduce((acc: any, item) => {
        const jugadorNombre = item.jugadores?.nombre || 'Sin nombre';
        acc[jugadorNombre] = (acc[jugadorNombre] || 0) + 1;
        return acc;
      }, {});

      const jugadorConMasAnalisis = Object.entries(jugadores).reduce((a: any, b: any) => 
        jugadores[a[0]] > jugadores[b[0]] ? a : b, ['', 0]);

      if (jugadorConMasAnalisis[0]) {
        stats.push({
          id: '3',
          title: 'Jugador más analizado',
          value: jugadorConMasAnalisis[0],
          icon: Target,
          description: `${jugadorConMasAnalisis[1]} análisis`
        });
      }

      // Posición más analizada (solo en modo deporte individual)
      if (features.skipSportsConfig && database.sportFilter !== 'all') {
        const posiciones = analisis.reduce((acc: any, item) => {
          const posicionNombre = item.posicion_movimientos?.posiciones?.nombre || 'Sin posición';
          acc[posicionNombre] = (acc[posicionNombre] || 0) + 1;
          return acc;
        }, {});

        const posicionMasAnalizada = Object.entries(posiciones).reduce((a: any, b: any) => 
          posiciones[a[0]] > posiciones[b[0]] ? a : b, ['', 0]);

        if (posicionMasAnalizada[0]) {
          stats.push({
            id: '4',
            title: 'Posición más analizada',
            value: posicionMasAnalizada[0],
            icon: Award,
            description: `${posicionMasAnalizada[1]} análisis`
          });
        }
      }

      // Deporte más analizado (solo en modo multideporte)
      if (!features.skipSportsConfig) {
        const deportes = analisis.reduce((acc: any, item) => {
          const deporteNombre = item.deportes?.nombre || item.jugadores?.equipos?.deportes?.nombre || 'Sin deporte';
          acc[deporteNombre] = (acc[deporteNombre] || 0) + 1;
          return acc;
        }, {});

        const deporteMasAnalizado = Object.entries(deportes).reduce((a: any, b: any) => 
          deportes[a[0]] > deportes[b[0]] ? a : b, ['', 0]);

        if (deporteMasAnalizado[0]) {
          stats.push({
            id: '4',
            title: 'Deporte más analizado',
            value: deporteMasAnalizado[0],
            icon: Target,
            description: `${deporteMasAnalizado[1]} análisis`
          });
        }
      }

      setStatistics(stats);

      // Calcular mejores jugadores por posición (solo en modo deporte individual)
      if (features.skipSportsConfig && database.sportFilter !== 'all') {
        await loadBestPlayersByPosition(userData.id, database.sportFilter);
      }
    } catch (error) {
      console.error('Error loading statistics:', error);
    }
    setLoading(false);
  };

  const loadBestPlayersByPosition = async (userId: string, deporteId: string) => {
    try {
      console.log('Loading best players for deporteId:', deporteId);

      // Obtener todas las posiciones del deporte (usando una consulta directa)
      const { data: posiciones, error: posicionesError } = await supabase
        .from('posiciones')
        .select('id, nombre')
        .eq('deporte_id', deporteId);

      console.log('Posiciones encontradas:', posiciones);

      if (posicionesError) {
        console.error('Error loading positions:', posicionesError);
        return;
      }

      if (!posiciones || posiciones.length === 0) {
        console.log('No positions found for deporteId:', deporteId);
        setBestPlayersByPosition([]);
        return;
      }

      // Obtener todos los análisis del deporte con información de posiciones
      const { data: todosAnalisis, error: analisisError } = await supabase
        .from('analisis_videos')
        .select(`
          *,
          jugadores(nombre),
          posicion_movimientos(
            posicion_id,
            posiciones(
              id,
              nombre
            )
          )
        `)
        .eq('usuario_id', userId)
        .eq('deporte_id', deporteId);

      console.log('Análisis encontrados:', todosAnalisis);

      if (analisisError) {
        console.error('Error loading analysis:', analisisError);
        return;
      }

      const bestPlayers: BestPlayerByPosition[] = [];

      // Procesar cada posición del deporte
      for (const posicion of posiciones) {
        console.log(`Procesando posición: ${posicion.nombre} (ID: ${posicion.id})`);

        // Filtrar análisis para esta posición específica
        const analisisPosicion = todosAnalisis?.filter(analisis => 
          analisis.posicion_movimientos?.posiciones?.id === posicion.id
        ) || [];

        console.log(`Análisis para ${posicion.nombre}:`, analisisPosicion);

        if (analisisPosicion.length === 0) {
          // Añadir posición sin análisis
          bestPlayers.push({
            position: posicion.nombre,
            playerName: 'Sin análisis',
            averageScore: 0,
            analysisCount: 0
          });
          continue;
        }

        // Agrupar por jugador y calcular promedios
        const jugadoresConPuntuacion: { [key: string]: { scores: number[], count: number } } = {};

        analisisPosicion.forEach(analisis => {
          const jugadorNombre = analisis.jugadores?.nombre || 'Sin nombre';
          const resultados = analisis.resultados_analisis as any;
          
          // Buscar la puntuación en diferentes campos posibles
          let puntuacion = 0;
          if (resultados) {
            puntuacion = resultados.overall_score || 
                        resultados.puntuacion || 
                        resultados.score || 
                        (typeof resultados === 'number' ? resultados : 0);
          }

          console.log(`Jugador: ${jugadorNombre}, Puntuación: ${puntuacion}`, resultados);

          if (!jugadoresConPuntuacion[jugadorNombre]) {
            jugadoresConPuntuacion[jugadorNombre] = { scores: [], count: 0 };
          }
          jugadoresConPuntuacion[jugadorNombre].scores.push(puntuacion);
          jugadoresConPuntuacion[jugadorNombre].count++;
        });

        // Encontrar el mejor jugador para esta posición
        let mejorJugador = '';
        let mejorPromedio = 0;
        let totalAnalisis = 0;

        Object.entries(jugadoresConPuntuacion).forEach(([jugador, data]) => {
          const promedio = data.scores.reduce((sum, score) => sum + score, 0) / data.scores.length;
          if (promedio > mejorPromedio) {
            mejorJugador = jugador;
            mejorPromedio = promedio;
            totalAnalisis = data.count;
          }
        });

        console.log(`Mejor jugador para ${posicion.nombre}: ${mejorJugador} (${mejorPromedio})`);

        bestPlayers.push({
          position: posicion.nombre,
          playerName: mejorJugador || 'Sin análisis',
          averageScore: mejorPromedio,
          analysisCount: totalAnalisis
        });
      }

      console.log('Best players final:', bestPlayers);
      setBestPlayersByPosition(bestPlayers);
    } catch (error) {
      console.error('Error loading best players by position:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center space-y-4">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto"></div>
          <p className="text-muted-foreground">{t('loading')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="w-full max-w-none mx-auto">
        <div className="max-w-6xl mx-auto">
          {/* Primera fila: Estadísticas principales */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {statistics.map((stat) => {
              const Icon = stat.icon;
              return (
                <Card key={stat.id} className="glass-card hover:shadow-lg transition-shadow">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      {stat.title}
                    </CardTitle>
                    <Icon className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stat.value}</div>
                    <p className="text-xs text-muted-foreground">
                      {stat.description}
                    </p>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Segunda fila: Mejores jugadores por posición (solo en modo deporte individual) */}
          {features.skipSportsConfig && database.sportFilter !== 'all' && bestPlayersByPosition.length > 0 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-center mb-6">Mejores Jugadores por Posición</h2>
              <div className="max-h-96 overflow-y-auto">
                <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {bestPlayersByPosition.map((player, index) => (
                    <Card key={index} className="glass-card hover:shadow-lg transition-shadow">
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                          Mejor {player.position}
                        </CardTitle>
                        <Star className="h-4 w-4 text-muted-foreground" />
                      </CardHeader>
                      <CardContent>
                        <div className="text-lg font-bold">{player.playerName}</div>
                        {player.analysisCount > 0 ? (
                          <>
                            <p className="text-sm text-muted-foreground">
                              Promedio: {player.averageScore.toFixed(1)}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {player.analysisCount} análisis
                            </p>
                          </>
                        ) : (
                          <p className="text-xs text-muted-foreground">
                            Sin análisis realizados
                          </p>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </div>
          )}

          {statistics.length === 0 && (
            <Card>
              <CardContent className="p-8 text-center">
                <Trophy className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No hay estadísticas disponibles</h3>
                <p className="text-muted-foreground">
                  Realiza algunos análisis para ver las estadísticas
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
