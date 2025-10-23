import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Users, Plus, Edit, Trash2, Check, X, ArrowLeft } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/contexts/LanguageContext';
import { useSportConfigContext } from '@/contexts/SportConfigContext';
import { PageHeader } from '@/components/PageHeader';

interface Equipo {
  id: string;
  nombre: string;
  deporte_id: string;
  usuario_id: string;
  created_at: string;
  updated_at: string;
}

interface Deporte {
  id: string;
  nombre: string;
  descripcion: string;
}

interface SportTeamsViewProps {
  deporte: Deporte;
  onBack: () => void;
  onTeamSelect: (teamId: string, teamName: string) => void;
  onTeamForm?: () => void;
  userName?: string;
  onLogout?: () => Promise<void>;
}

export function SportTeamsView({ deporte, onBack, onTeamSelect, onTeamForm, userName, onLogout }: SportTeamsViewProps) {
  const [equipos, setEquipos] = useState<Equipo[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingTeam, setEditingTeam] = useState<string | null>(null);
  const [editingTeamName, setEditingTeamName] = useState('');
  const [newTeamName, setNewTeamName] = useState('');
  const { toast } = useToast();
  const { t } = useLanguage();
  const { features, sportDisplayName } = useSportConfigContext();

  useEffect(() => {
    loadEquipos();
  }, [deporte.id]);

  const loadEquipos = async () => {
    try {
      console.log('🔍 Loading teams for deporte:', deporte);
      console.log('🔍 Deporte ID:', deporte.id);
      
      const { data: userData } = await supabase
        .from('usuarios')
        .select('id')
        .eq('auth_user_id', (await supabase.auth.getUser()).data.user?.id)
        .single();

      console.log('👤 User data:', userData);

      if (userData) {
        console.log('🔍 Querying equipos with usuario_id:', userData.id, 'and deporte_id:', deporte.id);
        
        const { data, error } = await supabase
          .from('equipos')
          .select('*')
          .eq('usuario_id', userData.id)
          .eq('deporte_id', deporte.id)
          .order('nombre');

        console.log('📊 Equipos query result:', { data, error });

        if (data) {
          setEquipos(data);
          console.log('✅ Teams loaded:', data.length);
        }
      }
    } catch (error) {
      console.error('❌ Error loading teams:', error);
    }
    setLoading(false);
  };

  const handleCreateTeam = async () => {
    if (!newTeamName.trim()) return;

    try {
      const { data: userData } = await supabase
        .from('usuarios')
        .select('id')
        .eq('auth_user_id', (await supabase.auth.getUser()).data.user?.id)
        .single();

      if (userData) {
        const { data, error } = await supabase
          .from('equipos')
          .insert({
            nombre: newTeamName.trim(),
            deporte_id: deporte.id,
            usuario_id: userData.id
          })
          .select()
          .single();

        if (error) throw error;

        if (data) {
          setEquipos([...equipos, data]);
          setNewTeamName('');
          toast({
            title: t('teamCreated'),
            description: t('teamCreatedDescription')
          });
        }
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: t('error'),
        description: t('couldNotCreateTeam')
      });
    }
  };

  const handleEditTeam = async (teamId: string) => {
    if (!editingTeamName.trim()) return;

    try {
      const { error } = await supabase
        .from('equipos')
        .update({ nombre: editingTeamName.trim() })
        .eq('id', teamId);

      if (error) throw error;

      setEquipos(equipos.map(equipo => 
        equipo.id === teamId 
          ? { ...equipo, nombre: editingTeamName.trim() }
          : equipo
      ));
      
      setEditingTeam(null);
      setEditingTeamName('');
      
      toast({
        title: t('teamUpdated'),
        description: t('teamUpdatedDescription')
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: t('error'),
        description: t('couldNotUpdateTeam')
      });
    }
  };

  const handleDeleteTeam = async (teamId: string) => {
    try {
      await supabase
        .from('equipos')
        .delete()
        .eq('id', teamId);

      setEquipos(equipos.filter(equipo => equipo.id !== teamId));
      toast({
        title: t('teamDeleted'),
        description: t('teamDeletedDescription')
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: t('error'),
        description: t('couldNotDeleteTeam')
      });
    }
  };

  const startEditing = (teamId: string, currentName: string) => {
    setEditingTeam(teamId);
    setEditingTeamName(currentName);
  };

  const cancelEditing = () => {
    setEditingTeam(null);
    setEditingTeamName('');
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
      <div className="max-w-6xl mx-auto">
        {/* Teams header with count and new team button */}
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-semibold">
            Equipos ({equipos.length})
          </h3>
          <Button onClick={onTeamForm} className="gap-2">
            <Plus className="h-4 w-4" />
            nuevo equipo
          </Button>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {equipos.map((equipo) => (
            <Card 
              key={equipo.id} 
              className="glass-card hover:shadow-lg transition-shadow cursor-pointer"
              onClick={() => editingTeam !== equipo.id && onTeamSelect(equipo.id, equipo.nombre)}
            >
              <CardHeader>
                <div className="flex items-center justify-between">
                  <Users className="h-6 w-6 text-primary" />
                  <div className="flex space-x-2">
                    {editingTeam === equipo.id ? (
                      <>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEditTeam(equipo.id);
                          }}
                        >
                          <Check className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={(e) => {
                            e.stopPropagation();
                            cancelEditing();
                          }}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </>
                    ) : (
                      <>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={(e) => {
                            e.stopPropagation();
                            startEditing(equipo.id, equipo.nombre);
                          }}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteTeam(equipo.id);
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </>
                    )}
                  </div>
                </div>
                {editingTeam === equipo.id ? (
                  <Input
                    value={editingTeamName}
                    onChange={(e) => setEditingTeamName(e.target.value)}
                    onClick={(e) => e.stopPropagation()}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        handleEditTeam(equipo.id);
                      } else if (e.key === 'Escape') {
                        cancelEditing();
                      }
                    }}
                    autoFocus
                    className="text-lg font-semibold"
                  />
                ) : (
                  <CardTitle>{equipo.nombre}</CardTitle>
                )}
              </CardHeader>
              <CardContent>
                <Button variant="outline" className="w-full">
                  Detalle
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {equipos.length === 0 && (
          <Card className="glass-card">
            <CardContent className="p-8 text-center">
              <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No hay equipos</h3>
              <p className="text-muted-foreground mb-4">
                Crea tu primer equipo para comenzar
              </p>
              <Button onClick={onTeamForm}>nuevo equipo</Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
