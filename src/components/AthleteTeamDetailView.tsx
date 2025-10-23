import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Users, Trophy, Calendar, User, Eye } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/contexts/LanguageContext';
import { AppHeader } from '@/components/AppHeader';
import { AppFooter } from '@/components/AppFooter';
import { PageHeader } from '@/components/PageHeader';
import { TrainingCalendar } from '@/components/TrainingCalendar';
import { supabase } from '@/integrations/supabase/client';

interface TeamPlayer {
  id: string;
  nombre: string;
  fecha_nacimiento: string | null;
  altura: number | null;
  peso: number | null;
  posiciones: string[];
}

interface TeamInfo {
  id: string;
  nombre: string;
  deporte_id: string;
  deporte_nombre: string;
  entrenador_nombre: string;
  categoria: string;
  created_at: string;
}

interface AthleteTeamDetailViewProps {
  teamId: string;
  teamName: string;
  deporteId: string;
  deporteName: string;
  onBack: () => void;
  userName?: string;
  onLogout?: () => Promise<void>;
}

export function AthleteTeamDetailView({ 
  teamId, 
  teamName, 
  deporteId, 
  deporteName, 
  onBack, 
  userName, 
  onLogout 
}: AthleteTeamDetailViewProps) {
  const [players, setPlayers] = useState<TeamPlayer[]>([]);
  const [teamInfo, setTeamInfo] = useState<TeamInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const { t } = useLanguage();

  useEffect(() => {
    loadTeamData();
  }, [teamId]);

  const loadTeamData = async () => {
    try {
      // Obtener el usuario actual
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        console.error('No user found');
        setLoading(false);
        return;
      }

      // Obtener el ID del deportista en la tabla usuarios
      const { data: userData, error: userError } = await supabase
        .from('usuarios')
        .select('id')
        .eq('auth_user_id', user.id)
        .single();

      if (userError || !userData) {
        console.error('Error fetching user data:', userError);
        setLoading(false);
        return;
      }

      // Obtener el jugador_id del usuario
      const { data: jugadorData, error: jugadorError } = await supabase
        .from('jugadores')
        .select('id')
        .eq('user_id', userData.id)
        .single();

      if (jugadorError || !jugadorData) {
        console.error('Error fetching jugador data:', jugadorError);
        setLoading(false);
        return;
      }

      // Verificar que el deportista pertenece a este equipo
      const { data: teamMembership, error: membershipError } = await supabase
        .from('jugador_equipos')
        .select('id')
        .eq('jugador_id', jugadorData.id)
        .eq('equipo_id', teamId)
        .single();

      if (membershipError || !teamMembership) {
        console.error('Athlete is not a member of this team:', membershipError);
        toast({
          variant: "destructive",
          title: "Acceso denegado",
          description: "No tienes acceso a este equipo"
        });
        onBack();
        return;
      }

      // Cargar información del equipo
      const { data: teamData, error: teamError } = await supabase
        .from('equipos')
        .select(`
          id,
          nombre,
          deporte_id,
          entrenador,
          categoria,
          deportes(nombre),
          created_at
        `)
        .eq('id', teamId)
        .single();

      if (teamError) {
        console.error('Error loading team info:', teamError);
        toast({
          variant: "destructive",
          title: "Error",
          description: "No se pudo cargar la información del equipo"
        });
        setLoading(false);
        return;
      }

      // Procesar información del equipo
      const teamInfoData: TeamInfo = {
        id: teamData.id,
        nombre: teamData.nombre,
        deporte_id: teamData.deporte_id,
        deporte_nombre: teamData.deportes?.nombre || deporteName,
        entrenador_nombre: teamData.entrenador || 'Sin especificar',
        categoria: teamData.categoria || 'Sin especificar',
        created_at: teamData.created_at
      };

      setTeamInfo(teamInfoData);

      // Obtener todos los jugadores del equipo
      const { data: playersData, error: playersError } = await supabase
        .from('jugador_equipos')
        .select(`
          jugador_id,
          jugadores (
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

      if (playersError) {
        console.error('Error loading team players:', playersError);
        toast({
          variant: "destructive",
          title: "Error",
          description: "No se pudieron cargar los jugadores del equipo"
        });
        setLoading(false);
        return;
      }

      // Procesar los datos de jugadores
      const playersList = playersData?.map(item => ({
        id: item.jugadores.id,
        nombre: item.jugadores.nombre,
        fecha_nacimiento: item.jugadores.fecha_nacimiento,
        altura: item.jugadores.altura,
        peso: item.jugadores.peso,
        posiciones: item.jugadores.jugador_posiciones?.map((jp: any) => jp.posiciones.nombre) || []
      })) || [];

      setPlayers(playersList);
    } catch (error) {
      console.error('Error loading team players:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Error al cargar los jugadores del equipo"
      });
    }
    setLoading(false);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
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
          {/* Información del equipo */}
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Trophy className="h-5 w-5 mr-2 text-primary" />
                Descripción
              </CardTitle>
              <CardDescription>
                Información básica del equipo
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-3">
                <div>
                  <h4 className="font-medium text-sm text-muted-foreground">Nombre</h4>
                  <p className="text-lg font-semibold">{teamInfo?.nombre || teamName}</p>
                </div>
                <div>
                  <h4 className="font-medium text-sm text-muted-foreground">Entrenador</h4>
                  <p className="text-lg">{teamInfo?.entrenador_nombre || 'Sin especificar'}</p>
                </div>
                <div>
                  <h4 className="font-medium text-sm text-muted-foreground">Categoría</h4>
                  <p className="text-lg">{teamInfo?.categoria || 'Sin especificar'}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Lista de jugadores */}
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Users className="h-5 w-5 mr-2 text-primary" />
                Jugadores del Equipo
              </CardTitle>
              <CardDescription>
                Lista de todos los jugadores del equipo
              </CardDescription>
            </CardHeader>
            <CardContent>
              {players.length === 0 ? (
                <div className="text-center py-8">
                  <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">No hay jugadores en este equipo</p>
                </div>
              ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {players.map((player) => (
                    <Card key={player.id} className="bg-muted/50">
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-lg flex items-center">
                            <User className="h-4 w-4 mr-2" />
                            {player.nombre}
                          </CardTitle>
                          <Badge variant="outline" className="flex items-center">
                            <Eye className="h-3 w-3 mr-1" />
                            Solo lectura
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="pt-0">
                        <div className="space-y-2 text-sm text-muted-foreground">
                          {player.fecha_nacimiento && (
                            <p><strong>Fecha de nacimiento:</strong> {formatDate(player.fecha_nacimiento)}</p>
                          )}
                          {player.altura && (
                            <p><strong>Altura:</strong> {player.altura}m</p>
                          )}
                          {player.peso && (
                            <p><strong>Peso:</strong> {player.peso}kg</p>
                          )}
                          {player.posiciones.length > 0 && (
                            <div>
                              <p><strong>Posiciones:</strong></p>
                              <div className="flex flex-wrap gap-1 mt-1">
                                {player.posiciones.map((pos, index) => (
                                  <Badge key={index} variant="secondary" className="text-xs">
                                    {pos}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Entrenos Card - Solo lectura para deportistas */}
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Calendar className="h-5 w-5 mr-2 text-primary" />
                Entrenos
              </CardTitle>
              <CardDescription>
                Visualiza los entrenamientos del equipo
              </CardDescription>
            </CardHeader>
            <CardContent>
              <TrainingCalendar 
                teamId={teamId} 
                canEdit={false} 
              />
            </CardContent>
          </Card>
    </div>
  );
}
