import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Search, Filter, Eye, Trash2, ArrowUpDown } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useLanguage } from '@/contexts/LanguageContext';
import { useToast } from '@/hooks/use-toast';
import { useSportConfigContext } from '@/contexts/SportConfigContext';

interface Analisis {
  id: string;
  titulo: string;
  fecha_analisis: string;
  descripcion: string;
  resultados_analisis: any;
  url_video: string;
  deporte_id: string;
  equipo_id: string | null;
  jugador: {
    nombre: string;
    equipo_id: string | null;
    user_id: string;
    clave_club: string;
    equipos?: {
      nombre: string;
      deportes: {
        nombre: string;
      };
    } | null;
    jugador_posiciones: Array<{
      posiciones: {
        nombre: string;
      };
    }>;
  };
  equipo?: {
    nombre: string;
    deportes: {
      nombre: string;
    };
  } | null;
  posicion_movimientos: {
    nombre_movimiento: string;
    posiciones: {
      nombre: string;
    };
  };
  deportes: {
    nombre: string;
  };
}

interface ResultsViewProps {
  onBack: () => void;
  onViewAnalysis: (analysisId: string) => void;
  userName?: string;
  onLogout?: () => Promise<void>;
  isAthleteView?: boolean;
}

export function ResultsView({ onBack, onViewAnalysis, userName, onLogout, isAthleteView = false }: ResultsViewProps) {
  const [analisis, setAnalisis] = useState<Analisis[]>([]);
  const [filteredAnalisis, setFilteredAnalisis] = useState<Analisis[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSport, setSelectedSport] = useState('all');
  const [selectedTeam, setSelectedTeam] = useState('all');
  const [sortBy, setSortBy] = useState('fecha_desc');
  const [deportes, setDeportes] = useState<any[]>([]);
  const [equipos, setEquipos] = useState<any[]>([]);
  const [userRole, setUserRole] = useState<string>('');
  const { t } = useLanguage();
  const { toast } = useToast();
  const { features, database, sportDisplayName } = useSportConfigContext();

  useEffect(() => {
    loadAnalisis();
    loadFilters();
    loadUserRole();
  }, []);

  const loadUserRole = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: userData, error } = await supabase
        .from('usuarios')
        .select('role')
        .eq('auth_user_id', user.id)
        .single();

      if (error) {
        console.error('Error fetching user role:', error);
        return;
      }

      if (userData?.role) {
        setUserRole(userData.role);
      }
    } catch (error) {
      console.error('Error in loadUserRole:', error);
    }
  };

  useEffect(() => {
    // En modo deporte individual, no establecer filtro por deporte ya que se filtra por deporte_id en la consulta
    if (features.skipSportsConfig && database.sportFilter !== 'all') {
      setSelectedSport('all'); // No filtrar por deporte en el frontend
    }
  }, [features.skipSportsConfig, database.sportFilter, sportDisplayName]);

  useEffect(() => {
    applyFilters();
  }, [analisis, searchTerm, selectedSport, selectedTeam, sortBy]);

  const loadAnalisis = async () => {
    try {
      console.log('🔍 Loading analysis with config:', { features, database, isAthleteView });
      
      const { data: userData } = await supabase
        .from('usuarios')
        .select('id')
        .eq('auth_user_id', (await supabase.auth.getUser()).data.user?.id)
        .single();

      console.log('👤 User data for analysis:', userData);

      if (userData) {
        let query = supabase
          .from('analisis_videos')
          .select(`
            *,
            jugador:jugadores(
              nombre,
              equipo_id,
              user_id,
              clave_club,
              jugador_posiciones(
                posiciones(nombre)
              )
            ),
            equipo:equipos(
              nombre
            ),
            posicion_movimientos(
              nombre_movimiento,
              posiciones(nombre)
            ),
            deportes(
              nombre
            )
          `);

        // Si es vista de deportista, filtrar solo los análisis donde el jugador es el usuario actual
        if (isAthleteView) {
          console.log('🏃 Filtering for athlete view - only own analyses');
          // Obtener el jugador_id del usuario actual
          const { data: jugadorData, error: jugadorError } = await supabase
            .from('jugadores')
            .select('id')
            .eq('user_id', userData.id)
            .single();

          if (jugadorError || !jugadorData) {
            console.error('Error fetching jugador data for athlete view:', jugadorError);
            setAnalisis([]);
            setLoading(false);
            return;
          }

          // Filtrar solo los análisis donde el jugador_id coincide
          query = query.eq('jugador_id', jugadorData.id);
          console.log('🔍 Athlete query created for jugador_id:', jugadorData.id);
        } else {
          // Para gestores, filtrar por usuario_id
          query = query.eq('usuario_id', userData.id);
          console.log('🔍 Manager query created for usuario_id:', userData.id);
        }

        // En modo deporte individual, filtrar por deporte
        if (features.skipSportsConfig && database.sportFilter !== 'all') {
          console.log('🏀 Filtering by sport ID:', database.sportFilter);
          query = query.eq('deporte_id', database.sportFilter);
        }

        console.log('🔍 Executing final query...');
        const { data, error } = await query.order('fecha_analisis', { ascending: false });

        console.log('📊 Analysis query result:', { data, error });

        if (data) {
          setAnalisis(data);
          console.log('✅ Analysis loaded:', data.length, 'records');
        }
      }
    } catch (error) {
      console.error('❌ Error loading analysis:', error);
    }
    setLoading(false);
  };

  const loadFilters = async () => {
    try {
      // En modo deportista, no cargar filtros de deportes y equipos
      if (isAthleteView) {
        setDeportes([]);
        setEquipos([]);
        return;
      }

      const { data: userData } = await supabase
        .from('usuarios')
        .select('id')
        .eq('auth_user_id', (await supabase.auth.getUser()).data.user?.id)
        .single();

      if (userData) {
        let deportesQuery = supabase
          .from('usuario_deportes')
          .select('deporte:deportes(id, nombre)')
          .eq('usuario_id', userData.id);

        let equiposQuery = supabase
          .from('equipos')
          .select('id, nombre, deporte_id')
          .eq('usuario_id', userData.id);

        // En modo deporte individual, filtrar por deporte
        if (features.skipSportsConfig && database.sportFilter !== 'all') {
          equiposQuery = equiposQuery.eq('deporte_id', database.sportFilter);
        }

        const { data: deportesData } = await deportesQuery;
        const { data: equiposData } = await equiposQuery;

        if (deportesData) {
          setDeportes(deportesData.map(d => d.deporte));
        }
        if (equiposData) {
          setEquipos(equiposData);
        }
      }
    } catch (error) {
      console.error('Error loading filters:', error);
    }
  };

  const applyFilters = () => {
    console.log('🔍 Applying filters to analysis:', analisis.length, 'records');
    console.log('🔍 Filter values:', { searchTerm, selectedSport, selectedTeam, sortBy });
    
    let filtered = [...analisis];

    // Filtro por término de búsqueda
    if (searchTerm) {
      filtered = filtered.filter(a => 
        a.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        a.jugador?.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
        a.descripcion?.toLowerCase().includes(searchTerm.toLowerCase())
      );
      console.log('🔍 After search filter:', filtered.length, 'records');
    }

    // Filtro por deporte
    if (selectedSport !== 'all') {
      console.log('🔍 Filtering by sport:', selectedSport);
      console.log('🔍 Available sports in data:', analisis.map(a => a.deportes?.nombre));
      filtered = filtered.filter(a => a.deportes?.nombre === selectedSport);
      console.log('🔍 After sport filter:', filtered.length, 'records');
    }

    // Filtro por equipo
    if (selectedTeam !== 'all') {
      console.log('🔍 Filtering by team:', selectedTeam);
      filtered = filtered.filter(a => a.equipo?.nombre === selectedTeam);
      console.log('🔍 After team filter:', filtered.length, 'records');
    }

    // Ordenamiento
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'fecha_desc':
          return new Date(b.fecha_analisis).getTime() - new Date(a.fecha_analisis).getTime();
        case 'fecha_asc':
          return new Date(a.fecha_analisis).getTime() - new Date(b.fecha_analisis).getTime();
        case 'jugador':
          return a.jugador?.nombre.localeCompare(b.jugador?.nombre);
        case 'titulo':
          return a.titulo.localeCompare(b.titulo);
        default:
          return 0;
      }
    });

    setFilteredAnalisis(filtered);
  };

  const handleDeleteAnalysis = async (analysisId: string) => {
    if (!confirm('¿Estás seguro de que quieres eliminar este análisis?')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('analisis_videos')
        .delete()
        .eq('id', analysisId);

      if (error) {
        throw error;
      }

      toast({
        title: 'Análisis eliminado',
        description: 'El análisis se ha eliminado correctamente'
      });

      // Reload the analysis list
      loadAnalisis();
    } catch (error) {
      console.error('Error deleting analysis:', error);
      toast({
        variant: "destructive",
        title: 'Error',
        description: 'No se pudo eliminar el análisis'
      });
    }
  };

  const getScoreFromResults = (resultados: any) => {
    if (!resultados) return 'N/A';
    if (typeof resultados === 'object' && resultados.overall_score) {
      return `${resultados.overall_score.toFixed(1)}`;
    }
    return 'N/A';
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES') + ' ' + date.toLocaleTimeString('es-ES', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center space-y-4">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto"></div>
          <p className="text-muted-foreground">Cargando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 relative">
      <div className="w-full max-w-none mx-auto">
        <div className="max-w-7xl mx-auto">
          {/* Filtros */}
          <Card className="glass-card mb-6">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Filter className="h-5 w-5 mr-2" />
                Filtros y Búsqueda
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <Label htmlFor="search">Buscar</Label>
                  <div className="relative">
                    <Search className="h-4 w-4 absolute left-3 top-3 text-muted-foreground" />
                    <Input
                      id="search"
                      placeholder="Buscar por título, atleta..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>

                {/* Campo deporte solo visible en modo multideporte y no en vista de deportista */}
                {!features.skipSportsConfig && !isAthleteView && (
                  <div>
                    <Label htmlFor="sport">Deporte</Label>
                    <Select value={selectedSport} onValueChange={setSelectedSport}>
                      <SelectTrigger>
                        <SelectValue placeholder="Todos los deportes" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Todos los deportes</SelectItem>
                        {deportes.map((deporte) => (
                          <SelectItem key={deporte.id} value={deporte.nombre}>
                            {deporte.nombre}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                <div>
                  <Label htmlFor="team">Equipo</Label>
                  <Select value={selectedTeam} onValueChange={setSelectedTeam}>
                    <SelectTrigger>
                      <SelectValue placeholder="Todos los equipos" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos los equipos</SelectItem>
                      {equipos
                        .filter(equipo => selectedSport === 'all' || 
                          deportes.find(d => d.id === equipo.deporte_id)?.nombre === selectedSport)
                        .map((equipo) => (
                          <SelectItem key={equipo.id} value={equipo.nombre}>
                            {equipo.nombre}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="sort">Ordenar por</Label>
                  <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="fecha_desc">Fecha (más reciente)</SelectItem>
                      <SelectItem value="fecha_asc">Fecha (más antiguo)</SelectItem>
                      <SelectItem value="jugador">Atleta (A-Z)</SelectItem>
                      <SelectItem value="titulo">Título (A-Z)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Tabla de resultados */}
          <Card className="glass-card">
            <CardHeader>
              <CardTitle>Análisis Realizados</CardTitle>
              <CardDescription>
                {filteredAnalisis.length} análisis encontrados
              </CardDescription>
            </CardHeader>
            <CardContent className="relative">
              <div className="table-container">
                <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[180px]">
                      <Button variant="ghost" className="h-auto p-0 font-medium">
                        Fecha <ArrowUpDown className="ml-2 h-4 w-4" />
                      </Button>
                    </TableHead>
                    <TableHead>Atleta</TableHead>
                    <TableHead>Deporte</TableHead>
                    <TableHead>Equipo</TableHead>
                    <TableHead>Posición</TableHead>
                    <TableHead>Movimiento</TableHead>
                    <TableHead className="text-center">Nota</TableHead>
                    <TableHead className="text-center">Acción</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredAnalisis.map((analisis) => (
                    <TableRow key={analisis.id}>
                      <TableCell className="font-medium">
                        {formatDate(analisis.fecha_analisis)}
                      </TableCell>
                      <TableCell>
                        {analisis.jugador?.nombre}
                      </TableCell>
                      <TableCell>
                        {analisis.deportes?.nombre || analisis.jugador?.equipos?.deportes?.nombre || 'N/A'}
                      </TableCell>
                      <TableCell>
                        {analisis.equipo?.nombre || 'N/A'}
                      </TableCell>
                      <TableCell>
                        {analisis.posicion_movimientos?.posiciones?.nombre || 'N/A'}
                      </TableCell>
                      <TableCell>
                        {analisis.posicion_movimientos?.nombre_movimiento}
                      </TableCell>
                      <TableCell className="text-center">
                        {(() => {
                          const scoreStr = getScoreFromResults(analisis.resultados_analisis);
                          const match = scoreStr.match(/([\d.]+)/);
                          const score = match ? parseFloat(match[1]) : null;
                          let color = 'text-gray-500';
                          if (score !== null) {
                            color = score >= 7 ? 'text-green-600' : score >= 4 ? 'text-yellow-600' : 'text-red-600';
                          }
                          return (
                            <span className={`font-bold ${color}`}>
                              {scoreStr}
                            </span>
                          );
                        })()}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2 justify-center">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => onViewAnalysis(analisis.id)}
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            Ver
                          </Button>
                          {userRole !== 'athlete' && (
                            <Button 
                              variant="destructive" 
                              size="sm"
                              onClick={() => handleDeleteAnalysis(analisis.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              </div>

              {filteredAnalisis.length === 0 && (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">No se encontraron análisis que coincidan con los filtros</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
