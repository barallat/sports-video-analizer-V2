import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Users, Plus, Edit, Trash2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Deporte {
  id: string;
  nombre: string;
}

interface Equipo {
  id: string;
  nombre: string;
  deporte_id: string;
  deportes: { nombre: string };
}

export function TeamsManagement({ onBack }: { onBack: () => void }) {
  const [deportes, setDeportes] = useState<Deporte[]>([]);
  const [equipos, setEquipos] = useState<Equipo[]>([]);
  const [selectedDeporte, setSelectedDeporte] = useState('');
  const [teamName, setTeamName] = useState('');
  const [editingTeam, setEditingTeam] = useState<Equipo | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadUserDeportes();
    loadEquipos();
  }, []);

  const loadUserDeportes = async () => {
    const { data: userData } = await supabase
      .from('usuarios')
      .select('id')
      .eq('auth_user_id', (await supabase.auth.getUser()).data.user?.id)
      .single();

    if (userData) {
      const { data } = await supabase
        .from('usuario_deportes')
        .select('deporte_id, deportes(id, nombre)')
        .eq('usuario_id', userData.id);

      if (data) {
        setDeportes(data.map(item => ({
          id: item.deporte_id,
          nombre: item.deportes?.nombre || ''
        })));
      }
    }
  };

  const loadEquipos = async () => {
    const { data: userData } = await supabase
      .from('usuarios')
      .select('id')
      .eq('auth_user_id', (await supabase.auth.getUser()).data.user?.id)
      .single();

    if (userData) {
      const { data } = await supabase
        .from('equipos')
        .select('*, deportes(nombre)')
        .eq('usuario_id', userData.id)
        .order('nombre');

      if (data) {
        setEquipos(data);
      }
    }
  };

  const handleSaveTeam = async () => {
    if (!teamName || !selectedDeporte) return;

    const { data: userData } = await supabase
      .from('usuarios')
      .select('id')
      .eq('auth_user_id', (await supabase.auth.getUser()).data.user?.id)
      .single();

    if (!userData) return;

    try {
      if (editingTeam) {
        // Actualizar equipo existente
        await supabase
          .from('equipos')
          .update({
            nombre: teamName,
            deporte_id: selectedDeporte
          })
          .eq('id', editingTeam.id);

        toast({
          title: "Equipo actualizado",
          description: "El equipo se ha actualizado correctamente"
        });
      } else {
        // Crear nuevo equipo
        await supabase
          .from('equipos')
          .insert({
            nombre: teamName,
            deporte_id: selectedDeporte,
            usuario_id: userData.id
          });

        toast({
          title: "Equipo creado",
          description: "El equipo se ha creado correctamente"
        });
      }

      setTeamName('');
      setSelectedDeporte('');
      setEditingTeam(null);
      setDialogOpen(false);
      loadEquipos();
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudo guardar el equipo"
      });
    }
  };

  const handleDeleteTeam = async (teamId: string) => {
    try {
      await supabase
        .from('equipos')
        .delete()
        .eq('id', teamId);

      toast({
        title: "Equipo eliminado",
        description: "El equipo se ha eliminado correctamente"
      });

      loadEquipos();
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudo eliminar el equipo"
      });
    }
  };

  const openEditDialog = (team: Equipo) => {
    setEditingTeam(team);
    setTeamName(team.nombre);
    setSelectedDeporte(team.deporte_id);
    setDialogOpen(true);
  };

  const openCreateDialog = () => {
    setEditingTeam(null);
    setTeamName('');
    setSelectedDeporte('');
    setDialogOpen(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-accent/5 p-4">
      <div className="max-w-6xl mx-auto py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <Button onClick={onBack} variant="ghost" className="mb-4">
              ← Volver
            </Button>
            <h1 className="text-3xl font-bold">Gestión de Equipos</h1>
            <p className="text-muted-foreground">
              Administra tus equipos deportivos
            </p>
          </div>

          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={openCreateDialog} className="sports-gradient">
                <Plus className="h-4 w-4 mr-2" />
                Nuevo Equipo
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  {editingTeam ? 'Editar Equipo' : 'Crear Nuevo Equipo'}
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="team-name">Nombre del Equipo</Label>
                  <Input
                    id="team-name"
                    value={teamName}
                    onChange={(e) => setTeamName(e.target.value)}
                    placeholder="Ej: Real Madrid"
                  />
                </div>
                <div>
                  <Label htmlFor="sport">Deporte</Label>
                  <Select value={selectedDeporte} onValueChange={setSelectedDeporte}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona un deporte" />
                    </SelectTrigger>
                    <SelectContent>
                      {deportes.map((deporte) => (
                        <SelectItem key={deporte.id} value={deporte.id}>
                          {deporte.nombre}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <Button 
                  onClick={handleSaveTeam}
                  disabled={!teamName || !selectedDeporte}
                  className="w-full"
                >
                  {editingTeam ? 'Actualizar' : 'Crear'} Equipo
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {equipos.map((equipo) => (
            <Card key={equipo.id} className="glass-card hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <Users className="h-6 w-6 text-primary" />
                  <div className="flex space-x-2">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => openEditDialog(equipo)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleDeleteTeam(equipo.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <CardTitle>{equipo.nombre}</CardTitle>
                <CardDescription>{equipo.deportes.nombre}</CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="outline" className="w-full">
                  Gestionar Jugadores
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {equipos.length === 0 && (
          <Card>
            <CardContent className="p-8 text-center">
              <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No hay equipos configurados</h3>
              <p className="text-muted-foreground mb-4">
                Crea tu primer equipo para comenzar a gestionar jugadores
              </p>
              <Button onClick={openCreateDialog}>Crear Equipo</Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
