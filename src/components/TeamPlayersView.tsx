import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { User, Plus, Edit, Trash2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/contexts/LanguageContext';
import { useSportConfigContext } from '@/contexts/SportConfigContext';
import { useAuth } from '@/hooks/useAuth';

interface Jugador {
  id: string;
  nombre: string;
  fecha_nacimiento: string | null;
  altura: number | null;
  peso: number | null;
  user_id?: string;
  posiciones?: string[];
  equipos?: string[];
}

interface TeamPlayersViewProps {
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

export function TeamPlayersView({ 
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
}: TeamPlayersViewProps) {
  const [jugadores, setJugadores] = useState<Jugador[]>([]);
  const [loading, setLoading] = useState(true);
  const [sportName, setSportName] = useState(deporteName || '');
  const [userRole, setUserRole] = useState<string>('');
  const [userId, setUserId] = useState<string>('');
  const { toast } = useToast();
  const { t } = useLanguage();
  const { user } = useAuth();

  useEffect(() => {
    loadJugadores();
    if (!deporteName) {
      loadSportName();
    }
    loadUserRole();
  }, [teamId, deporteId, isAthletesMode, user]);

  const loadUserRole = async () => {
    if (!user) return;

    try {
      const { data: userData, error } = await supabase
        .from('usuarios')
        .select('role, id')
        .eq('auth_user_id', user.id)
        .single();

      if (error) {
        console.error('Error fetching user role:', error);
        return;
      }

      if (userData?.role) {
        setUserRole(userData.role);
      }
      if (userData?.id) {
        setUserId(userData.id);
      }
    } catch (error) {
      console.error('Error in loadUserRole:', error);
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

  const loadJugadores = async () => {
    try {
      if (isAthletesMode) {
        // En modo deportistas, cargar TODOS los deportistas del deporte
        await loadAllAthletes();
      } else {
        // En modo equipos, cargar solo los jugadores del equipo específico
        await loadTeamPlayers();
      }
    } catch (error) {
      console.error('Error loading players:', error);
    }
    setLoading(false);
  };

  const loadAllAthletes = async () => {
    try {
      // Obtener el usuario actual con clave_club y role
      const { data: userData } = await supabase
        .from('usuarios')
        .select('id, clave_club, role')
        .eq('auth_user_id', (await supabase.auth.getUser()).data.user?.id)
        .single();

      if (!userData) {
        console.error('No user data found');
        return;
      }

      // Si es atleta, solo mostrar su propio perfil
      if (userData.role === 'athlete') {
        // Obtener el jugador del usuario actual
        const { data: jugadorData, error: jugadorError } = await supabase
          .from('jugadores')
          .select(`
            id,
            nombre,
            fecha_nacimiento,
            altura,
            peso,
            user_id,
            jugador_posiciones(
              posicion_id,
              posiciones(nombre)
            )
          `)
          .eq('user_id', userData.id)
          .single();

        if (jugadorError) {
          console.error('Error loading athlete data:', jugadorError);
          return;
        }

        if (jugadorData) {
          // Verificar si el jugador pertenece a algún equipo del deporte especificado
          const { data: teamMembership } = await supabase
            .from('jugador_equipos')
            .select(`
              equipos!inner(
                deporte_id
              )
            `)
            .eq('jugador_id', jugadorData.id)
            .eq('equipos.deporte_id', deporteId);

          // Solo mostrar el atleta si pertenece a un equipo del deporte especificado
          if (teamMembership && teamMembership.length > 0) {
            setJugadores([{
              ...jugadorData,
              posiciones: jugadorData.jugador_posiciones?.map((jp: any) => jp.posiciones.nombre) || [],
              equipos: []
            }]);
          } else {
            setJugadores([]);
          }
        } else {
          setJugadores([]);
        }
        return;
      }

      // Para gestores, obtener todos los equipos del usuario para este deporte
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
            user_id,
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
            user_id,
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

      loadJugadores();
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
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-semibold">
              {isAthletesMode ? `Deportistas (${jugadores.length})` : `${t('players')} (${jugadores.length})`}
            </h3>
            <div className="flex gap-2">
              {onAthleteSelection && !isAthletesMode && (
                <Button onClick={onAthleteSelection} variant="outline" className="gap-2">
                  <Plus className="h-4 w-4" />
                  Añadir Deportistas
                </Button>
              )}
              {isAthletesMode && (
                <Button 
                  onClick={() => onPlayerForm()} 
                  className="gap-2"
                  disabled={userRole === 'athlete'}
                  title={userRole === 'athlete' ? 'Los deportistas no pueden crear otros deportistas' : ''}
                >
                  <Plus className="h-4 w-4" />
                  nuevo deportista
                </Button>
              )}
            </div>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {jugadores.map((jugador) => (
              <Card key={jugador.id} className="glass-card">
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
                          className="h-8 w-8 p-0"
                          disabled={userRole === 'athlete' && jugador.user_id !== userId}
                          title={
                            userRole === 'athlete' && jugador.user_id !== userId 
                              ? 'Solo puedes editar tu propio perfil' 
                              : userRole === 'athlete' 
                                ? 'Editar tu perfil' 
                                : 'Editar deportista'
                          }
                          onClick={() => {
                            console.log('Edit button clicked:', {
                              userRole,
                              userId,
                              jugadorUserId: jugador.user_id,
                              isDisabled: userRole === 'athlete' && jugador.user_id !== userId
                            });
                            onPlayerForm(jugador.id);
                          }}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeletePlayer(jugador.id)}
                        className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                        disabled={userRole === 'athlete'}
                        title={userRole === 'athlete' ? 'Los deportistas no pueden eliminar otros deportistas' : ''}
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

          {jugadores.length === 0 && (
            <Card>
              <CardContent className="p-8 text-center">
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
                      nuevo deportista
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
