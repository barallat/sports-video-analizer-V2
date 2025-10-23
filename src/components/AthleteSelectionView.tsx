import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { User, ArrowLeft, Plus } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/contexts/LanguageContext';

interface Athlete {
  id: string;
  nombre: string;
  fecha_nacimiento: string | null;
  altura: number | null;
  peso: number | null;
  posiciones?: string[];
  isSelected?: boolean;
  isAlreadyInTeam?: boolean;
  currentTeams?: string[];
}

interface AthleteSelectionViewProps {
  teamId: string;
  teamName: string;
  deporteId: string;
  deporteName?: string;
  onBack: () => void;
  onAthletesSelected: (athleteIds: string[]) => void;
}

export function AthleteSelectionView({ 
  teamId, 
  teamName, 
  deporteId, 
  deporteName, 
  onBack, 
  onAthletesSelected
}: AthleteSelectionViewProps) {
  const [athletes, setAthletes] = useState<Athlete[]>([]);
  const [selectedAthletes, setSelectedAthletes] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();
  const { t } = useLanguage();

  useEffect(() => {
    loadAthletes();
  }, [deporteId, teamId]);

  const loadAthletes = async () => {
    try {
      // Obtener el usuario actual con clave_club y role
      const { data: userData } = await supabase
        .from('usuarios')
        .select('id, clave_club, role')
        .eq('auth_user_id', (await supabase.auth.getUser()).data.user?.id)
        .single();

      if (!userData) {
        console.error('No user data found');
        setLoading(false);
        return;
      }

      let query = supabase
        .from('jugadores')
        .select(`
          id,
          nombre,
          fecha_nacimiento,
          altura,
          peso,
          jugador_posiciones(
            posicion_id,
            posiciones(nombre)
          )
        `);

      // Aplicar filtro según el rol del usuario
      if (userData.role === 'athlete') {
        // Para deportistas: solo ver su propio perfil (filtro por user_id)
        query = query.eq('user_id', userData.id);
      } else {
        // Para gestores: ver todos los deportistas del club (filtro por clave_club)
        query = query.eq('clave_club', userData.clave_club);
      }

      const { data: athletesData, error } = await query;

      if (error) {
        console.error('Error loading athletes:', error);
        setLoading(false);
        return;
      }

      // Obtener los deportistas que YA están en el equipo actual
      const { data: currentTeamAthletes } = await supabase
        .from('jugador_equipos')
        .select('jugador_id')
        .eq('equipo_id', teamId);

      const currentTeamAthleteIds = new Set(
        currentTeamAthletes?.map(item => item.jugador_id) || []
      );

      // Obtener información de equipos para cada deportista
      const athletesWithTeams = await Promise.all(
        athletesData?.map(async (athlete) => {
          // Obtener equipos donde está este deportista
          const { data: athleteTeams } = await supabase
            .from('jugador_equipos')
            .select(`
              equipos!inner(
                id,
                nombre
              )
            `)
            .eq('jugador_id', athlete.id);

          const currentTeams = athleteTeams?.map(item => item.equipos.nombre) || [];
          const isAlreadyInTeam = currentTeamAthleteIds.has(athlete.id);

          return {
            id: athlete.id,
            nombre: athlete.nombre,
            fecha_nacimiento: athlete.fecha_nacimiento,
            altura: athlete.altura,
            peso: athlete.peso,
            posiciones: athlete.jugador_posiciones?.map((jp: any) => jp.posiciones.nombre) || [],
            isSelected: false,
            isAlreadyInTeam,
            currentTeams
          };
        }) || []
      );

      // Filtrar solo los que NO están ya en el equipo actual
      const availableAthletes = athletesWithTeams.filter(athlete => !athlete.isAlreadyInTeam);

      setAthletes(availableAthletes);
    } catch (error) {
      console.error('Error loading athletes:', error);
    }
    setLoading(false);
  };

  const handleAthleteToggle = (athleteId: string) => {
    setSelectedAthletes(prev => 
      prev.includes(athleteId) 
        ? prev.filter(id => id !== athleteId)
        : [...prev, athleteId]
    );
  };

  const handleSelectAll = () => {
    if (selectedAthletes.length === athletes.length) {
      setSelectedAthletes([]);
    } else {
      setSelectedAthletes(athletes.map(athlete => athlete.id));
    }
  };

  const handleAddAthletes = async () => {
    if (selectedAthletes.length === 0) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Selecciona al menos un deportista"
      });
      return;
    }

    setSaving(true);
    try {
      // Añadir deportistas al equipo
      const athleteTeamData = selectedAthletes.map(athleteId => ({
        jugador_id: athleteId,
        equipo_id: teamId
      }));

      const { error } = await supabase
        .from('jugador_equipos')
        .insert(athleteTeamData);

      if (error) {
        throw error;
      }

      toast({
        title: "Deportistas añadidos",
        description: `${selectedAthletes.length} deportista(s) añadido(s) al equipo ${teamName}`
      });

      onAthletesSelected(selectedAthletes);
    } catch (error) {
      console.error('Error adding athletes to team:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudieron añadir los deportistas al equipo"
      });
    }
    setSaving(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-accent/5 flex flex-col">
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center space-y-4">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto"></div>
            <p className="text-muted-foreground">{t('loading')}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-accent/5 flex flex-col">
      <div className="flex-1 max-w-6xl mx-auto py-8 px-4">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-semibold">
            Deportistas disponibles ({athletes.length})
          </h3>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleSelectAll}>
              {selectedAthletes.length === athletes.length ? 'Deseleccionar todos' : 'Seleccionar todos'}
            </Button>
            <Button 
              onClick={handleAddAthletes} 
              disabled={selectedAthletes.length === 0 || saving}
              className="gap-2"
            >
              <Plus className="h-4 w-4" />
              {saving ? 'Añadiendo...' : `Añadir ${selectedAthletes.length} deportista(s)`}
            </Button>
          </div>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {athletes.map((athlete) => (
            <Card 
              key={athlete.id} 
              className={`glass-card cursor-pointer transition-all duration-200 hover:shadow-lg ${
                selectedAthletes.includes(athlete.id) ? 'ring-2 ring-primary' : ''
              }`}
              onClick={() => handleAthleteToggle(athlete.id)}
            >
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <User className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-base">{athlete.nombre}</CardTitle>
                      <CardDescription>
                        {athlete.posiciones && athlete.posiciones.length > 0 
                          ? athlete.posiciones.join(', ')
                          : 'Deportista'
                        }
                      </CardDescription>
                    </div>
                  </div>
                  <Checkbox 
                    checked={selectedAthletes.includes(athlete.id)}
                    onChange={() => handleAthleteToggle(athlete.id)}
                    onClick={(e) => e.stopPropagation()}
                  />
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-2 text-sm text-muted-foreground">
                  {athlete.fecha_nacimiento && (
                    <p>Nacimiento: {new Date(athlete.fecha_nacimiento).toLocaleDateString()}</p>
                  )}
                  {athlete.altura && (
                    <p>Altura: {athlete.altura} cm</p>
                  )}
                  {athlete.peso && (
                    <p>Peso: {athlete.peso} kg</p>
                  )}
                  {athlete.currentTeams && athlete.currentTeams.length > 0 && (
                    <p className="text-xs text-blue-600">
                      En equipos: {athlete.currentTeams.join(', ')}
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {athletes.length === 0 && (
          <Card>
            <CardContent className="p-8 text-center">
              <User className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No hay deportistas disponibles</h3>
              <p className="text-muted-foreground mb-4">
                Todos los deportistas de {deporteName} ya están en este equipo o no hay deportistas registrados
              </p>
              <Button onClick={onBack} variant="outline">
                Volver
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
