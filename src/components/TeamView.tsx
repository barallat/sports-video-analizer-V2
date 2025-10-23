import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { User, Plus, Edit, Trash2, Users, Calendar, BarChart3, Trophy } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/contexts/LanguageContext';
import { useSportConfigContext } from '@/contexts/SportConfigContext';
import { useAuth } from '@/hooks/useAuth';
import { PageHeader } from '@/components/PageHeader';
import { TrainingCalendar } from '@/components/TrainingCalendar';

interface Jugador {
  id: string;
  nombre: string;
  fecha_nacimiento: string | null;
  altura: number | null;
  peso: number | null;
  posiciones?: string[];
  equipos?: string[];
}

interface Equipo {
  id: string;
  nombre: string;
  entrenador: string | null;
  categoria: string | null;
}

interface TeamViewProps {
  teamId: string;
  teamName: string;
  deporteId: string;
  deporteName?: string;
  onBack: () => void;
  onPlayerForm: (playerId?: string) => void;
  onAthleteSelection?: () => void;
  userName?: string;
  onLogout?: () => Promise<void>;
  isAthletesMode?: boolean;
  title?: string;
  addButtonText?: string;
}

export function TeamView({ 
  teamId, 
  teamName, 
  deporteId, 
  deporteName, 
  onBack, 
  onPlayerForm, 
  onAthleteSelection,
  userName, 
  onLogout,
  isAthletesMode = false,
  title,
  addButtonText
}: TeamViewProps) {
  const [jugadores, setJugadores] = useState<Jugador[]>([]);
  const [equipo, setEquipo] = useState<Equipo | null>(null);
  const [loading, setLoading] = useState(true);
  const [sportName, setSportName] = useState(deporteName || '');
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    nombre: '',
    entrenador: '',
    categoria: ''
  });
  const [userRole, setUserRole] = useState<string>('');
  const { toast } = useToast();
  const { t } = useLanguage();
  const { user } = useAuth();

  useEffect(() => {
    loadData();
    loadUserRole();
    if (!deporteName) {
      loadSportName();
    }
  }, [teamId, deporteId, isAthletesMode, user]);

  const loadUserRole = async () => {
    if (!user) return;
    
    try {
      const { data: userData, error } = await supabase
        .from('usuarios')
        .select('role')
        .eq('auth_user_id', user.id)
        .single();

      if (error) {
        console.error('Error loading user role:', error);
        return;
      }

      if (userData?.role) {
        setUserRole(userData.role);
      }
    } catch (error) {
      console.error('Error loading user role:', error);
    }
  };

  const loadSportName = async () => {
    try {
      // En versiones de un solo deporte, usar el nombre del contexto de configuración
      // En versiones multideporte, cargar desde la base de datos
      const { features, sportName: configSportName } = useSportConfigContext();
      
      if (features.skipSportsConfig && configSportName) {
        // Versión de un solo deporte - usar nombre de configuración
        setSportName(configSportName);
      } else {
        // Versión multideporte - cargar desde BD
        const { data } = await supabase
          .from('deportes')
          .select('nombre')
          .eq('id', deporteId)
          .single();

        if (data) {
          setSportName(data.nombre);
        }
      }
    } catch (error) {
      console.error('Error loading sport name:', error);
    }
  };

  const loadData = async () => {
    try {
      if (isAthletesMode) {
        // En modo deportistas, cargar TODOS los deportistas del deporte
        await loadAllAthletes();
      } else {
        // En modo equipos, cargar datos del equipo y jugadores
        await Promise.all([loadTeamData(), loadTeamPlayers()]);
      }
    } catch (error) {
      console.error('Error loading data:', error);
    }
    setLoading(false);
  };

  const loadTeamData = async () => {
    try {
      const { data, error } = await supabase
        .from('equipos')
        .select('id, nombre, entrenador, categoria')
        .eq('id', teamId)
        .single();

      if (error) {
        console.error('Error loading team data:', error);
        return;
      }

      if (data) {
        setEquipo(data);
        setEditForm({
          nombre: data.nombre,
          entrenador: data.entrenador || '',
          categoria: data.categoria || ''
        });
      }
    } catch (error) {
      console.error('Error loading team data:', error);
    }
  };

  const loadAllAthletes = async () => {
    try {
      // Obtener el usuario actual
      const { data: userData } = await supabase
        .from('usuarios')
        .select('id')
        .eq('auth_user_id', (await supabase.auth.getUser()).data.user?.id)
        .single();

      if (!userData) {
        console.error('No user data found');
        return;
      }

      // Obtener todos los equipos del usuario para este deporte
      const { data: userTeams } = await supabase
        .from('equipos')
        .select('id, nombre')
        .eq('usuario_id', userData.id)
        .eq('deporte_id', deporteId);

      if (!userTeams || userTeams.length === 0) {
        setJugadores([]);
        return;
      }

      const teamIds = userTeams.map(team => team.id);

      // Obtener todos los deportistas de todos los equipos del usuario para este deporte
      const { data: athletesData, error } = await supabase
        .from('jugador_equipos')
        .select(`
          jugadores!inner(
            id,
            nombre,
            fecha_nacimiento,
            altura,
            peso,
            jugador_posiciones(
              posicion_id,
              posiciones(nombre)
            )
          ),
          equipos!inner(
            id,
            nombre
          )
        `)
        .in('equipo_id', teamIds);

      if (error) {
        console.error('Error loading athletes:', error);
        return;
      }

      // Procesar los datos para agrupar por deportista
      const athletesMap = new Map<string, Jugador>();

      athletesData?.forEach(item => {
        const athleteId = item.jugadores.id;
        
        if (!athletesMap.has(athleteId)) {
          athletesMap.set(athleteId, {
            ...item.jugadores,
            posiciones: item.jugadores.jugador_posiciones?.map((jp: any) => jp.posiciones.nombre) || [],
            equipos: []
          });
        }

        // Añadir información del equipo actual
        const athlete = athletesMap.get(athleteId)!;
        athlete.equipos!.push(item.equipos.nombre);
      });

      const athletesList = Array.from(athletesMap.values());
      setJugadores(athletesList);
    } catch (error) {
      console.error('Error loading all athletes:', error);
    }
  };

  const loadTeamPlayers = async () => {
    try {
      let query = supabase
        .from('jugador_equipos')
        .select(`
          jugadores!inner(
            id,
            nombre,
            fecha_nacimiento,
            altura,
            peso,
            jugador_posiciones(
              posicion_id,
              posiciones(nombre)
            )
          )
        `)
        .eq('equipo_id', teamId);

      const { data } = await query;

      if (data) {
        const jugadoresConPosiciones = data.map(item => ({
          ...item.jugadores,
          posiciones: item.jugadores.jugador_posiciones?.map((jp: any) => jp.posiciones.nombre) || []
        }));
        setJugadores(jugadoresConPosiciones);
      }
    } catch (error) {
      console.error('Error loading team players:', error);
    }
  };

  const handleSaveTeamData = async () => {
    try {
      const { error } = await supabase
        .from('equipos')
        .update({
          nombre: editForm.nombre,
          entrenador: editForm.entrenador || null,
          categoria: editForm.categoria || null
        })
        .eq('id', teamId);

      if (error) {
        throw error;
      }

      setEquipo(prev => prev ? {
        ...prev,
        nombre: editForm.nombre,
        entrenador: editForm.entrenador || null,
        categoria: editForm.categoria || null
      } : null);

      setIsEditing(false);
      toast({
        title: 'Equipo actualizado',
        description: 'Los datos del equipo han sido actualizados correctamente'
      });
    } catch (error) {
      console.error('Error updating team:', error);
      toast({
        variant: "destructive",
        title: 'Error',
        description: 'No se pudo actualizar el equipo'
      });
    }
  };

  const handleDeletePlayer = async (playerId: string) => {
    try {
      if (isAthletesMode) {
        // En modo deportistas, eliminar de TODOS los equipos del deporte
        const { data: userData } = await supabase
          .from('usuarios')
          .select('id')
          .eq('auth_user_id', (await supabase.auth.getUser()).data.user?.id)
          .single();

        if (userData) {
          const { data: userTeams } = await supabase
            .from('equipos')
            .select('id')
            .eq('usuario_id', userData.id)
            .eq('deporte_id', deporteId);

          if (userTeams) {
            const teamIds = userTeams.map(team => team.id);
            await supabase
              .from('jugador_equipos')
              .delete()
              .eq('jugador_id', playerId)
              .in('equipo_id', teamIds);
          }
        }
      } else {
        // En modo equipos, eliminar solo de este equipo
        await supabase
          .from('jugador_equipos')
          .delete()
          .eq('jugador_id', playerId)
          .eq('equipo_id', teamId);
      }

      toast({
        title: isAthletesMode ? 'Deportista eliminado' : t('playerDeleted'),
        description: isAthletesMode ? 'El deportista ha sido eliminado de todos los equipos' : t('playerDeletedDescription')
      });

      loadData();
    } catch (error) {
      toast({
        variant: "destructive",
        title: t('error'),
        description: isAthletesMode ? 'No se pudo eliminar el deportista' : t('couldNotDeletePlayer')
      });
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

  const displayTitle = title || `${t('players')} - ${teamName}`;
  const displayAddButtonText = addButtonText || t('addPlayer');

  return (
    <div className="space-y-6">
      <div className="w-full max-w-none mx-auto">
        <div className="max-w-7xl mx-auto">
          <div className="space-y-6">
          {/* Descripción Card - Solo para modo equipos */}
          {!isAthletesMode && equipo && (
            <Card className="glass-card">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center">
                      <Users className="h-5 w-5 mr-2" />
                      Descripción
                    </CardTitle>
                    <CardDescription>
                      Información básica del equipo
                    </CardDescription>
                  </div>
                  {!isEditing && (
                    <Button onClick={() => setIsEditing(true)} variant="outline">
                      <Edit className="h-4 w-4 mr-2" />
                      Editar
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {isEditing ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="nombre">Nombre *</Label>
                        <Input
                          id="nombre"
                          value={editForm.nombre}
                          onChange={(e) => setEditForm(prev => ({ ...prev, nombre: e.target.value }))}
                          placeholder="Nombre del equipo"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="entrenador">Entrenador</Label>
                        <Input
                          id="entrenador"
                          value={editForm.entrenador}
                          onChange={(e) => setEditForm(prev => ({ ...prev, entrenador: e.target.value }))}
                          placeholder="Nombre del entrenador"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="categoria">Categoría</Label>
                        <Input
                          id="categoria"
                          value={editForm.categoria}
                          onChange={(e) => setEditForm(prev => ({ ...prev, categoria: e.target.value }))}
                          placeholder="Categoría del equipo"
                        />
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button onClick={handleSaveTeamData}>
                        Guardar
                      </Button>
                      <Button onClick={() => setIsEditing(false)} variant="outline">
                        Cancelar
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label className="text-sm font-medium text-muted-foreground">Nombre</Label>
                      <p className="text-lg font-semibold">{equipo.nombre}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-muted-foreground">Entrenador</Label>
                      <p className="text-lg">{equipo.entrenador || 'No especificado'}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-muted-foreground">Categoría</Label>
                      <p className="text-lg">{equipo.categoria || 'No especificada'}</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Jugadores Card */}
          <Card className="glass-card">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center">
                    <User className="h-5 w-5 mr-2" />
                    {isAthletesMode ? `Deportistas (${jugadores.length})` : `Jugadores (${jugadores.length})`}
                  </CardTitle>
                  <CardDescription>
                    {isAthletesMode ? `Gestiona los deportistas de ${sportName}` : `Gestiona los jugadores del equipo`}
                  </CardDescription>
                </div>
                <div className="flex gap-2">
                  {onAthleteSelection && !isAthletesMode && (
                    <Button onClick={onAthleteSelection} variant="outline" className="gap-2">
                      <Plus className="h-4 w-4" />
                      Añadir Deportistas
                    </Button>
                  )}
                  {isAthletesMode && (
                    <Button onClick={() => onPlayerForm()} className="gap-2">
                      <Plus className="h-4 w-4" />
                      {displayAddButtonText}
                    </Button>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {jugadores.length > 0 ? (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {jugadores.map((jugador) => (
                    <Card key={jugador.id} className="hover:shadow-md transition-shadow">
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-primary/10 rounded-lg">
                              <User className="h-5 w-5 text-primary" />
                            </div>
                            <div>
                              <CardTitle className="text-base">{jugador.nombre}</CardTitle>
                              <CardDescription>
                                {jugador.posiciones && jugador.posiciones.length > 0 
                                  ? jugador.posiciones.join(', ')
                                  : isAthletesMode ? 'Deportista' : t('noPosition')
                                }
                              </CardDescription>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            {isAthletesMode && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => onPlayerForm(jugador.id)}
                                className="h-8 w-8 p-0"
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                            )}
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeletePlayer(jugador.id)}
                              className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="pt-0">
                        <div className="space-y-2 text-sm text-muted-foreground">
                          {jugador.fecha_nacimiento && (
                            <p>{t('birthDate')}: {new Date(jugador.fecha_nacimiento).toLocaleDateString()}</p>
                          )}
                          {jugador.altura && (
                            <p>{t('height')}: {jugador.altura} cm</p>
                          )}
                          {jugador.peso && (
                            <p>{t('weight')}: {jugador.peso} kg</p>
                          )}
                          {isAthletesMode && jugador.equipos && jugador.equipos.length > 0 && (
                            <p className="text-xs text-blue-600">
                              En equipos: {jugador.equipos.join(', ')}
                            </p>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <User className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">
                    {isAthletesMode ? 'No hay deportistas registrados' : t('noPlayers')}
                  </h3>
                  <p className="text-muted-foreground mb-4">
                    {isAthletesMode 
                      ? `Comienza añadiendo deportistas para ${sportName}`
                      : `${t('startByAddingPlayers')} ${teamName}`
                    }
                  </p>
                  <div className="flex gap-2 justify-center">
                    {onAthleteSelection && !isAthletesMode && (
                      <Button onClick={onAthleteSelection} variant="outline" className="gap-2">
                        <Plus className="h-4 w-4" />
                        Añadir Deportistas
                      </Button>
                    )}
                    {isAthletesMode && (
                      <Button onClick={() => onPlayerForm()} className="gap-2">
                        <Plus className="h-4 w-4" />
                        {displayAddButtonText}
                      </Button>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Entrenos Card - Mostrar para todos los usuarios cuando ven un equipo específico */}
          {!isAthletesMode && (
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Calendar className="h-5 w-5 mr-2" />
                  Entrenos
                </CardTitle>
                <CardDescription>
                  {userRole === 'athlete' 
                    ? 'Visualiza los entrenamientos del equipo' 
                    : 'Gestiona los entrenamientos del equipo'
                  }
                </CardDescription>
              </CardHeader>
              <CardContent>
                <TrainingCalendar 
                  teamId={teamId} 
                  canEdit={userRole !== 'athlete'} 
                />
              </CardContent>
            </Card>
          )}

          {/* Resultados Card - Solo para modo equipos */}
          {!isAthletesMode && (
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Trophy className="h-5 w-5 mr-2" />
                  Resultados
                </CardTitle>
                <CardDescription>
                  Historial de partidos y resultados
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-muted-foreground">
                  <Trophy className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Próximamente: Historial de resultados</p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Estadísticas Card - Solo para modo equipos */}
          {!isAthletesMode && (
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <BarChart3 className="h-5 w-5 mr-2" />
                  Estadísticas
                </CardTitle>
                <CardDescription>
                  Análisis y métricas del equipo
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-muted-foreground">
                  <BarChart3 className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Próximamente: Estadísticas del equipo</p>
                </div>
              </CardContent>
            </Card>
          )}
          </div>
        </div>
      </div>
    </div>
  );
}
