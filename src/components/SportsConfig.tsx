
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Trophy, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Deporte {
  id: string;
  nombre: string;
  descripcion: string;
}

interface UserDeporte {
  deporte_id: string;
}

export function SportsConfig({ onComplete }: { onComplete: () => void }) {
  const [deportes, setDeportes] = useState<Deporte[]>([]);
  const [selectedSports, setSelectedSports] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadDeportes();
    loadUserDeportes();
  }, []);

  const loadDeportes = async () => {
    const { data, error } = await supabase
      .from('deportes')
      .select('*')
      .order('nombre');

    if (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudieron cargar los deportes"
      });
    } else {
      setDeportes(data || []);
    }
    setLoading(false);
  };

  const loadUserDeportes = async () => {
    const { data: userData } = await supabase
      .from('usuarios')
      .select('id')
      .eq('auth_user_id', (await supabase.auth.getUser()).data.user?.id)
      .single();

    if (userData) {
      const { data } = await supabase
        .from('usuario_deportes')
        .select('deporte_id')
        .eq('usuario_id', userData.id);

      if (data) {
        setSelectedSports(data.map(item => item.deporte_id));
      }
    }
  };

  const handleSportToggle = (deporteId: string) => {
    setSelectedSports(prev => 
      prev.includes(deporteId) 
        ? prev.filter(id => id !== deporteId)
        : [...prev, deporteId]
    );
  };

  const handleSave = async () => {
    setSaving(true);
    
    try {
      const { data: userData } = await supabase
        .from('usuarios')
        .select('id')
        .eq('auth_user_id', (await supabase.auth.getUser()).data.user?.id)
        .single();

      if (!userData) {
        throw new Error('Usuario no encontrado');
      }

      // Eliminar deportes no seleccionados
      await supabase
        .from('usuario_deportes')
        .delete()
        .eq('usuario_id', userData.id)
        .not('deporte_id', 'in', `(${selectedSports.join(',')})`);

      // Insertar nuevos deportes seleccionados
      const newSports = selectedSports.map(deporteId => ({
        usuario_id: userData.id,
        deporte_id: deporteId
      }));

      if (newSports.length > 0) {
        await supabase
          .from('usuario_deportes')
          .upsert(newSports, { onConflict: 'usuario_id,deporte_id' });
      }

      toast({
        title: "Configuración guardada",
        description: "Tus deportes han sido configurados correctamente"
      });

      onComplete();
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudo guardar la configuración"
      });
    }
    
    setSaving(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-accent/5 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-accent/5 p-4">
      <div className="max-w-4xl mx-auto py-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">Configura tus Deportes</h1>
          <p className="text-muted-foreground">
            Selecciona los deportes que quieres gestionar en tu cuenta
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Trophy className="h-5 w-5" />
              <span>Deportes Disponibles</span>
            </CardTitle>
            <CardDescription>
              Puedes cambiar esta selección en cualquier momento desde la configuración
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              {deportes.map((deporte) => (
                <div
                  key={deporte.id}
                  className="flex items-center space-x-3 p-4 border rounded-lg hover:bg-accent/50 transition-colors"
                >
                  <Checkbox
                    id={deporte.id}
                    checked={selectedSports.includes(deporte.id)}
                    onCheckedChange={() => handleSportToggle(deporte.id)}
                  />
                  <div className="flex-1">
                    <label
                      htmlFor={deporte.id}
                      className="font-medium cursor-pointer"
                    >
                      {deporte.nombre}
                    </label>
                    <p className="text-sm text-muted-foreground">
                      {deporte.descripcion}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-end space-x-4 pt-4">
              <Button
                onClick={handleSave}
                disabled={saving || selectedSports.length === 0}
                className="sports-gradient"
              >
                {saving ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Guardando...
                  </>
                ) : (
                  'Guardar Configuración'
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
