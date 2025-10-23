import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Trophy, Users, BarChart3, Settings, Plus, FileText, UserCheck, Target, TrendingUp, Activity } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/contexts/LanguageContext';
import { useSportConfigContext } from '@/contexts/SportConfigContext';
import { useAuth } from '@/hooks/useAuth';

interface DashboardProps {
  onNavigate: (section: string) => void;
  onLogout: () => Promise<void>;
  userName?: string;
}

interface DashboardMetrics {
  teamsCount: number;
  playersCount: number;
  analysisCount: number;
  bestScore: number;
  recentAnalysis: any[];
  topPlayers: any[];
}

export function Dashboard({ onNavigate, onLogout, userName }: DashboardProps) {
  const { t } = useLanguage();
  const { user } = useAuth();
  const { 
    features, 
    database,
    sportName, 
    appName, 
    appDescription, 
    isMultiSport 
  } = useSportConfigContext();
  const [loading, setLoading] = useState(false);
  const [clubName, setClubName] = useState<string>('');
  const [userRole, setUserRole] = useState<string>('');
  const [isInTeam, setIsInTeam] = useState<boolean>(false);
  const [hasResults, setHasResults] = useState<boolean>(false);
  const [metrics, setMetrics] = useState<DashboardMetrics>({
    teamsCount: 0,
    playersCount: 0,
    analysisCount: 0,
    bestScore: 0,
    recentAnalysis: [],
    topPlayers: []
  });
  const [metricsLoading, setMetricsLoading] = useState(true);

  // Fetch user's club name and role
  useEffect(() => {
    const fetchUserData = async () => {
      if (user?.id) {
        try {
          const { data: userData, error } = await supabase
            .from('usuarios')
            .select('club_name, role, id')
            .eq('auth_user_id', user.id)
            .single();
          
          if (error) {
            console.error('Error fetching user data:', error);
          } else {
            if (userData?.club_name) {
              setClubName(userData.club_name);
            }
            if (userData?.role) {
              setUserRole(userData.role);
              
              // Si es deportista, verificar si está en algún equipo y si tiene resultados
              if (userData.role === 'athlete' && userData.id) {
                await checkIfAthleteInTeam(userData.id);
                await checkIfAthleteHasResults(userData.id);
              }
            }
          }
        } catch (error) {
          console.error('Error fetching user data:', error);
        }
      }
    };

    fetchUserData();
  }, [user]);

  // Load dashboard metrics when user data is available
  useEffect(() => {
    if (user?.id && userRole) {
      loadDashboardMetrics();
    }
  }, [user?.id, userRole]);

  // Función para verificar si un deportista está en algún equipo
  const checkIfAthleteInTeam = async (userId: string) => {
    try {
      // Primero obtener el jugador_id del usuario
      const { data: jugadorData, error: jugadorError } = await supabase
        .from('jugadores')
        .select('id')
        .eq('user_id', userId)
        .single();

      if (jugadorError || !jugadorData) {
        console.error('Error fetching jugador data:', jugadorError);
        setIsInTeam(false);
        return;
      }

      // Luego verificar si el jugador está en algún equipo
      const { data, error } = await supabase
        .from('jugador_equipos')
        .select('id')
        .eq('jugador_id', jugadorData.id)
        .limit(1);

      if (error) {
        console.error('Error checking team membership:', error);
        return;
      }

      setIsInTeam(data && data.length > 0);
    } catch (error) {
      console.error('Error checking team membership:', error);
    }
  };

  // Función para verificar si un deportista tiene resultados
  const checkIfAthleteHasResults = async (userId: string) => {
    try {
      // Primero obtener el jugador_id del usuario
      const { data: jugadorData, error: jugadorError } = await supabase
        .from('jugadores')
        .select('id')
        .eq('user_id', userId)
        .single();

      if (jugadorError || !jugadorData) {
        console.error('Error fetching jugador data for results check:', jugadorError);
        setHasResults(false);
        return;
      }

      // Verificar si el jugador tiene análisis de videos
      const { data, error } = await supabase
        .from('analisis_videos')
        .select('id')
        .eq('jugador_id', jugadorData.id)
        .limit(1);

      if (error) {
        console.error('Error checking athlete results:', error);
        return;
      }

      setHasResults(data && data.length > 0);
    } catch (error) {
      console.error('Error checking athlete results:', error);
    }
  };

  const handleLogout = async () => {
    setLoading(true);
    try {
      await onLogout();
    } catch (error) {
      console.error('Error during logout:', error);
    } finally {
      setLoading(false);
    }
  };

  // Load dashboard metrics
  const loadDashboardMetrics = async () => {
    if (!user?.id) return;
    
    setMetricsLoading(true);
    try {
      const { data: userData, error: userError } = await supabase
        .from('usuarios')
        .select('id, clave_club')
        .eq('auth_user_id', user.id)
        .single();

      if (userError || !userData) {
        console.error('Error fetching user data for metrics:', userError);
        return;
      }

      // Load teams count
      let teamsQuery = supabase
        .from('equipos')
        .select('id', { count: 'exact' })
        .eq('usuario_id', userData.id);

      if (features.skipSportsConfig && database.sportFilter !== 'all') {
        teamsQuery = teamsQuery.eq('deporte_id', database.sportFilter);
      }

      const { count: teamsCount } = await teamsQuery;

      // Load players count
      let playersQuery = supabase
        .from('jugadores')
        .select('id', { count: 'exact' })
        .eq('clave_club', userData.clave_club);

      if (features.skipSportsConfig && database.sportFilter !== 'all') {
        // Filtrar por deporte a través de la relación con equipos
        playersQuery = playersQuery
          .select(`
            id,
            equipos!inner(deporte_id)
          `)
          .eq('equipos.deporte_id', database.sportFilter);
      }

      const { count: playersCount } = await playersQuery;

      // Load analysis count and best score
      let analysisQuery = supabase
        .from('analisis_videos')
        .select(`
          id, 
          resultados_analisis
        `)
        .eq('usuario_id', userData.id);

      if (features.skipSportsConfig && database.sportFilter !== 'all') {
        analysisQuery = analysisQuery.eq('deporte_id', database.sportFilter);
      }

      const { data: analysisData } = await analysisQuery;
      const analysisCount = analysisData?.length || 0;
      
      // Extract scores from resultados_analisis
      const scores = analysisData?.map(analysis => {
        const resultados = analysis.resultados_analisis;
        if (resultados && typeof resultados === 'object' && resultados.overall_score) {
          return parseFloat(resultados.overall_score);
        }
        return 0;
      }) || [];
      
      const bestScore = scores.length > 0 ? Math.max(...scores) : 0;

      // Load recent analysis (last 3)
      let recentAnalysisQuery = supabase
        .from('analisis_videos')
        .select(`
          id,
          titulo,
          resultados_analisis,
          created_at,
          jugadores(nombre),
          equipos(nombre)
        `)
        .eq('usuario_id', userData.id)
        .order('created_at', { ascending: false })
        .limit(3);

      if (features.skipSportsConfig && database.sportFilter !== 'all') {
        recentAnalysisQuery = recentAnalysisQuery.eq('deporte_id', database.sportFilter);
      }

      const { data: recentAnalysis } = await recentAnalysisQuery;

      // Load top players by average score
      let topPlayersQuery = supabase
        .from('analisis_videos')
        .select(`
          jugador_id,
          resultados_analisis,
          jugadores(nombre)
        `)
        .eq('usuario_id', userData.id);

      if (features.skipSportsConfig && database.sportFilter !== 'all') {
        topPlayersQuery = topPlayersQuery.eq('deporte_id', database.sportFilter);
      }

      const { data: topPlayersData } = await topPlayersQuery;

      // Calculate average scores per player
      const playerScores = topPlayersData?.reduce((acc: any, analysis) => {
        const playerId = analysis.jugador_id;
        if (!acc[playerId]) {
          acc[playerId] = { name: analysis.jugadores?.nombre, scores: [], total: 0 };
        }
        
        // Extract score from resultados_analisis
        const resultados = analysis.resultados_analisis;
        let score = 0;
        if (resultados && typeof resultados === 'object' && resultados.overall_score) {
          score = parseFloat(resultados.overall_score);
        }
        
        acc[playerId].scores.push(score);
        acc[playerId].total += score;
        return acc;
      }, {}) || {};

      const topPlayers = Object.values(playerScores)
        .map((player: any) => ({
          name: player.name,
          averageScore: player.total / player.scores.length,
          analysisCount: player.scores.length
        }))
        .sort((a: any, b: any) => b.averageScore - a.averageScore)
        .slice(0, 3);

      setMetrics({
        teamsCount: teamsCount || 0,
        playersCount: playersCount || 0,
        analysisCount,
        bestScore,
        recentAnalysis: recentAnalysis || [],
        topPlayers
      });
    } catch (error) {
      console.error('Error loading dashboard metrics:', error);
    } finally {
      setMetricsLoading(false);
    }
  };

  // Construir menú basado en la configuración y rol del usuario
  const baseMenuItems = [
    {
      id: 'teams',
      title: t('teams'),
      description: userRole === 'athlete' 
        ? 'Ver los equipos en los que participas' 
        : features.skipSportsConfig 
          ? `Gestiona tus equipos y jugadores de ${sportName}` 
          : 'Gestiona tus equipos y jugadores',
      icon: Users,
      color: 'bg-green-500',
      show: true, // Siempre visible para todos los usuarios
      disabled: userRole === 'athlete' && !isInTeam, // Solo deshabilitado para deportistas que no están en equipos
    },
    {
      id: 'deportistas',
      title: 'Deportistas',
      description: features.skipSportsConfig 
        ? `Gestiona los deportistas de ${sportName}` 
        : 'Gestiona los deportistas por deporte',
      icon: UserCheck,
      color: 'bg-teal-500',
      show: true, // Siempre visible
      disabled: false,
    },
    {
      id: 'analysis',
      title: t('analysis'),
      description: features.skipSportsConfig 
        ? `Crear nuevos análisis de movimientos de ${sportName}` 
        : 'Crear nuevos análisis de movimientos',
      icon: Plus,
      color: 'bg-purple-500',
      show: true, // Siempre visible para todos los usuarios
      disabled: userRole === 'athlete', // Solo deshabilitado para deportistas
    },
    {
      id: 'sports-management',
      title: t('sports'),
      description: 'Configura los deportes que quieres analizar',
      icon: Trophy,
      color: 'bg-blue-500',
      show: false, // Oculto según requerimiento
      disabled: true,
    },
    {
      id: 'results',
      title: t('results'),
      description: userRole === 'athlete' 
        ? 'Ver tus resultados de análisis' 
        : 'Ver resultados de análisis anteriores',
      icon: FileText,
      color: 'bg-orange-500',
      show: true, // Siempre visible para todos los usuarios
      disabled: userRole === 'athlete' && !hasResults, // Solo deshabilitado para deportistas sin resultados
    },
    {
      id: 'statistics',
      title: t('statistics'),
      description: 'Estadísticas y métricas detalladas',
      icon: BarChart3,
      color: 'bg-red-500',
      show: true, // Siempre visible para todos los usuarios
      disabled: userRole === 'athlete', // Solo deshabilitado para deportistas
    },
    {
      id: 'config',
      title: t('configuration'),
      description: userRole === 'athlete' 
        ? 'Ver y editar tu perfil de usuario' 
        : 'Configuración general de la aplicación',
      icon: Settings,
      color: 'bg-gray-500',
      show: true, // Siempre visible para todos los usuarios
      disabled: false, // Habilitado para todos los usuarios
    },
  ];

  // Filtrar elementos según la configuración (solo ocultar sports-management)
  const menuItems = baseMenuItems.filter(item => item.show);

  // Manejar navegación especial para equipos y deportistas
  const handleNavigate = (section: string) => {
    // Mapear las secciones del dashboard a las rutas del sistema de navegación
    const routeMap: { [key: string]: string } = {
      'teams': 'teams',
      'athletes': 'athletes',
      'analysis': 'analysis',
      'results': 'results',
      'profile': 'profile',
      'settings': 'settings',
      'athlete-teams': 'athlete-teams',
      'sport-teams': 'sport-teams',
      'sport-athletes': 'sport-athletes',
      'athletes-selection': 'athletes-selection',
      'athlete-results': 'athlete-results',
      'deportistas': 'athletes-selection'
    };
    
    // Lógica específica para deportistas
    if (section === 'teams' && userRole === 'athlete') {
      onNavigate('athlete-teams');
    } else if (section === 'teams' && features.skipSportsConfig) {
      onNavigate('teams'); // Pasar 'teams' directamente para que Index.tsx lo maneje
    } else if (section === 'deportistas' && features.skipSportsConfig) {
      onNavigate('deportistas'); // Pasar 'deportistas' directamente para que Index.tsx lo maneje
    } else if (section === 'deportistas') {
      onNavigate('athletes-selection');
    } else if (section === 'results' && userRole === 'athlete') {
      onNavigate('athlete-results');
    } else if (section === 'config' && userRole === 'athlete') {
      onNavigate('profile');
    } else {
      const route = routeMap[section] || section;
      onNavigate(route);
    }
  };

  return (
    <div className="space-y-6">
      {/* Main Content */}
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h2 className="text-3xl font-bold tracking-tight text-foreground mb-2">
            {clubName || appName}
          </h2>
          <p className="text-muted-foreground">
            {appDescription}
          </p>
        </div>

        {/* Dashboard Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Teams Count */}
          <Card className="glass-card border-2">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Equipos</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {metricsLoading ? '...' : metrics.teamsCount}
              </div>
              <p className="text-xs text-muted-foreground">
                Equipos registrados
              </p>
            </CardContent>
          </Card>

          {/* Players Count */}
          <Card className="glass-card border-2">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Jugadores</CardTitle>
              <UserCheck className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {metricsLoading ? '...' : metrics.playersCount}
              </div>
              <p className="text-xs text-muted-foreground">
                Jugadores registrados
              </p>
            </CardContent>
          </Card>

          {/* Analysis Count */}
          <Card className="glass-card border-2">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Análisis</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {metricsLoading ? '...' : metrics.analysisCount}
              </div>
              <p className="text-xs text-muted-foreground">
                Análisis realizados
              </p>
            </CardContent>
          </Card>

          {/* Best Score */}
          <Card className="glass-card border-2">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Mejor Puntuación</CardTitle>
              <Trophy className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {metricsLoading ? '...' : metrics.bestScore.toFixed(1)}
              </div>
              <p className="text-xs text-muted-foreground">
                Puntuación máxima
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Recent Analysis and Top Players */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Analysis */}
          <Card className="glass-card border-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Análisis Recientes
              </CardTitle>
              <CardDescription>
                Últimos análisis realizados
              </CardDescription>
            </CardHeader>
            <CardContent>
              {metricsLoading ? (
                <div className="text-center py-4">Cargando...</div>
              ) : metrics.recentAnalysis.length > 0 ? (
                <div className="space-y-3">
                  {metrics.recentAnalysis.map((analysis, index) => (
                    <div key={analysis.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                      <div className="flex-1">
                        <p className="font-medium text-sm">{analysis.titulo}</p>
                        <p className="text-xs text-muted-foreground">
                          {analysis.jugadores?.nombre} • {analysis.equipos?.nombre}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-sm">
                          {(() => {
                            const resultados = analysis.resultados_analisis;
                            if (resultados && typeof resultados === 'object' && resultados.overall_score) {
                              return resultados.overall_score.toFixed(1);
                            }
                            return 'N/A';
                          })()}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(analysis.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-4 text-muted-foreground">
                  No hay análisis recientes
                </div>
              )}
            </CardContent>
          </Card>

          {/* Top Players */}
          <Card className="glass-card border-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Mejores Jugadores
              </CardTitle>
              <CardDescription>
                Jugadores con mejor puntuación promedio
              </CardDescription>
            </CardHeader>
            <CardContent>
              {metricsLoading ? (
                <div className="text-center py-4">Cargando...</div>
              ) : metrics.topPlayers.length > 0 ? (
                <div className="space-y-3">
                  {metrics.topPlayers.map((player, index) => (
                    <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-bold">
                          {index + 1}
                        </div>
                        <div>
                          <p className="font-medium text-sm">{player.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {player.analysisCount} análisis
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-sm">{player.averageScore.toFixed(1)}</p>
                        <p className="text-xs text-muted-foreground">promedio</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-4 text-muted-foreground">
                  No hay datos de jugadores
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
