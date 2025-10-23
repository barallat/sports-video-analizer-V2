import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Users, Trophy, Calendar, MapPin } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/contexts/LanguageContext';
import { AppHeader } from '@/components/AppHeader';
import { AppFooter } from '@/components/AppFooter';
import { PageHeader } from '@/components/PageHeader';
import { supabase } from '@/integrations/supabase/client';

interface Team {
  id: string;
  nombre: string;
  deporte_id: string;
  deporte_nombre: string;
  created_at: string;
}

interface AthleteTeamsViewProps {
  onBack: () => void;
  onTeamClick?: (teamId: string, teamName: string, deporteId: string) => void;
  userName?: string;
  onLogout?: () => Promise<void>;
}

export function AthleteTeamsView({ onBack, onTeamClick, userName, onLogout }: AthleteTeamsViewProps) {
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const { t } = useLanguage();

  useEffect(() => {
    loadAthleteTeams();
  }, []);

  const loadAthleteTeams = async () => {
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

      // Primero obtener el jugador_id del usuario
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

      // Obtener los equipos del deportista
      const { data: teamData, error: teamError } = await supabase
        .from('jugador_equipos')
        .select(`
          equipo_id,
          equipos (
            id,
            nombre,
            deporte_id,
            deportes (
              nombre
            ),
            created_at
          )
        `)
        .eq('jugador_id', jugadorData.id);

      if (teamError) {
        console.error('Error loading teams:', teamError);
        toast({
          variant: "destructive",
          title: "Error",
          description: "No se pudieron cargar los equipos"
        });
        setLoading(false);
        return;
      }

      // Procesar los datos de equipos
      const teamsList = teamData?.map(item => ({
        id: item.equipos.id,
        nombre: item.equipos.nombre,
        deporte_id: item.equipos.deporte_id,
        deporte_nombre: item.equipos.deportes?.nombre || 'Sin especificar',
        created_at: item.equipos.created_at
      })) || [];

      setTeams(teamsList);
    } catch (error) {
      console.error('Error loading athlete teams:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Error al cargar los equipos"
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
      <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-accent/5 flex flex-col">
        <AppHeader userName={userName} onLogout={onLogout} />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center space-y-4">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto"></div>
            <p className="text-muted-foreground">{t('loading')}</p>
          </div>
        </div>
        <AppFooter />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-accent/5 flex flex-col">
      <AppHeader userName={userName} onLogout={onLogout} />

      <div className="flex-1 max-w-6xl mx-auto py-8 px-4">
        <PageHeader
          title="Mis Equipos"
          description="Equipos en los que participas"
          onBack={onBack}
        />

        {teams.length === 0 ? (
          <Card className="glass-card max-w-md mx-auto">
            <CardContent className="p-6 text-center">
              <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No estás en ningún equipo</h3>
              <p className="text-muted-foreground mb-4">
                Contacta con tu entrenador para ser añadido a un equipo.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {teams.map((team) => (
              <Card 
                key={team.id} 
                className="glass-card hover:shadow-lg transition-shadow cursor-pointer hover:scale-105"
                onClick={() => onTeamClick?.(team.id, team.nombre, team.deporte_id)}
              >
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center">
                      <Trophy className="h-5 w-5 mr-2 text-primary" />
                      {team.nombre}
                    </CardTitle>
                    <Badge variant="secondary">
                      {team.deporte_nombre}
                    </Badge>
                  </div>
                  <CardDescription>
                    Equipo de {team.deporte_nombre}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Calendar className="h-4 w-4 mr-2" />
                      <span>Miembro desde {formatDate(team.created_at)}</span>
                    </div>
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Users className="h-4 w-4 mr-2" />
                      <span>Vista de solo lectura</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      <AppFooter />
    </div>
  );
}
