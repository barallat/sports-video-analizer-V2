import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowLeft, Save, Users } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/contexts/LanguageContext';

interface TeamFormViewProps {
  deporteId: string;
  deporteName: string;
  onBack: () => void;
  onSaved: () => void;
  teamId?: string;
}

export function TeamFormView({ 
  deporteId, 
  deporteName, 
  onBack, 
  onSaved, 
  teamId 
}: TeamFormViewProps) {
  const [nombre, setNombre] = useState('');
  const [entrenador, setEntrenador] = useState('');
  const [categoria, setCategoria] = useState('');
  const [saving, setSaving] = useState(false);
  
  const { toast } = useToast();
  const { t } = useLanguage();

  const handleSave = async () => {
    if (!nombre.trim()) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "El nombre del equipo es obligatorio"
      });
      return;
    }

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

      if (teamId) {
        // Actualizar equipo existente
        const { error } = await supabase
          .from('equipos')
          .update({
            nombre: nombre.trim(),
            entrenador: entrenador.trim() || null,
            categoria: categoria.trim() || null,
            updated_at: new Date().toISOString()
          })
          .eq('id', teamId);

        if (error) throw error;

        toast({
          title: "Éxito",
          description: "Equipo actualizado correctamente"
        });
      } else {
        // Crear nuevo equipo
        const { data, error } = await supabase
          .from('equipos')
          .insert({
            nombre: nombre.trim(),
            entrenador: entrenador.trim() || null,
            categoria: categoria.trim() || null,
            deporte_id: deporteId,
            usuario_id: userData.id
          })
          .select()
          .single();

        if (error) throw error;

        toast({
          title: "Éxito",
          description: "Equipo creado correctamente"
        });
      }

      onSaved();
    } catch (error) {
      console.error('Error saving team:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error instanceof Error ? error.message : "Error al guardar el equipo"
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-accent/5">
      <div className="max-w-6xl mx-auto py-8 px-4">
        <div className="grid gap-8">
          {/* Team Form Card */}
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Users className="h-5 w-5 mr-2" />
                Descripción
              </CardTitle>
              <CardDescription>
                Información básica del equipo
              </CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="nombre">Nombre *</Label>
                <Input
                  id="nombre"
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  placeholder="Nombre del equipo"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="entrenador">Entrenador</Label>
                <Input
                  id="entrenador"
                  value={entrenador}
                  onChange={(e) => setEntrenador(e.target.value)}
                  placeholder="Nombre del entrenador"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="categoria">Categoría</Label>
                <Input
                  id="categoria"
                  value={categoria}
                  onChange={(e) => setCategoria(e.target.value)}
                  placeholder="Ej: Sub 20, Senior, etc."
                />
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-4">
            <Button variant="outline" onClick={onBack} disabled={saving}>
              Cancelar
            </Button>
            <Button onClick={handleSave} disabled={saving} className="gap-2">
              <Save className="h-4 w-4" />
              {saving ? 'Guardando...' : 'Crear'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
