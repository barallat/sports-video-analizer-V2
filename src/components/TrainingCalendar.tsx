import { useState, useEffect } from 'react';
import { Calendar } from '@/components/ui/calendar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar as CalendarIcon, Clock, MapPin, FileText, Save, Edit, Trash2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { Database } from '@/integrations/supabase/types';

type Entreno = Database['public']['Tables']['entrenos']['Row'];

interface TrainingCalendarProps {
  teamId: string;
  canEdit: boolean;
}

export function TrainingCalendar({ teamId, canEdit }: TrainingCalendarProps) {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [entrenos, setEntrenos] = useState<Entreno[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentEntreno, setCurrentEntreno] = useState<Entreno | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    hora: '',
    lugar: '',
    entrada: ''
  });
  const [userId, setUserId] = useState<string>('');
  const { toast } = useToast();
  const { user } = useAuth();

  // Load user ID and entrenos
  useEffect(() => {
    if (user) {
      loadUserId();
    }
  }, [user]);

  useEffect(() => {
    if (teamId && userId) {
      loadEntrenos();
    }
  }, [teamId, userId]);

  const loadUserId = async () => {
    if (!user) return;
    
    try {
      const { data: userData, error } = await supabase
        .from('usuarios')
        .select('id')
        .eq('auth_user_id', user.id)
        .single();

      if (error) {
        console.error('Error loading user ID:', error);
        return;
      }

      if (userData?.id) {
        setUserId(userData.id);
      }
    } catch (error) {
      console.error('Error loading user ID:', error);
    }
  };

  const loadEntrenos = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('entrenos')
        .select('*')
        .eq('equipo_id', teamId)
        .order('fecha', { ascending: true });

      if (error) {
        throw error;
      }

      setEntrenos(data || []);
    } catch (error) {
      console.error('Error loading entrenos:', error);
      toast({
        variant: "destructive",
        title: 'Error',
        description: 'No se pudieron cargar los entrenos'
      });
    } finally {
      setLoading(false);
    }
  };

  const getEntrenosForDate = (date: Date) => {
    // Crear la fecha en el mismo formato que se guarda en la BD
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const dateStr = `${year}-${month}-${day}`;
    
    return entrenos.filter(entreno => entreno.fecha === dateStr);
  };

  const handleDateSelect = (date: Date | undefined) => {
    if (!date) return;
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Don't allow selection of past dates
    if (date < today) {
      toast({
        variant: "destructive",
        title: 'Fecha no válida',
        description: 'No se pueden crear entrenos en días pasados'
      });
      return;
    }

    setSelectedDate(date);
    const entrenosForDate = getEntrenosForDate(date);
    
    if (entrenosForDate.length > 0) {
      // Show existing entreno
      setCurrentEntreno(entrenosForDate[0]);
      setFormData({
        hora: entrenosForDate[0].hora,
        lugar: entrenosForDate[0].lugar,
        entrada: entrenosForDate[0].entrada || ''
      });
      setIsEditing(true);
    } else {
      // New entreno
      setCurrentEntreno(null);
      setFormData({
        hora: '',
        lugar: '',
        entrada: ''
      });
      setIsEditing(false);
    }
  };

  const handleSave = async () => {
    if (!selectedDate || !formData.hora || !formData.lugar) {
      toast({
        variant: "destructive",
        title: 'Campos requeridos',
        description: 'Hora y lugar son obligatorios'
      });
      return;
    }

    if (!userId) {
      toast({
        variant: "destructive",
        title: 'Error',
        description: 'Usuario no autenticado'
      });
      return;
    }

    try {
      setLoading(true);
      // Crear la fecha en el mismo formato que se guarda en la BD
      const year = selectedDate.getFullYear();
      const month = String(selectedDate.getMonth() + 1).padStart(2, '0');
      const day = String(selectedDate.getDate()).padStart(2, '0');
      const fecha = `${year}-${month}-${day}`;
      
      console.log('Fecha seleccionada:', selectedDate);
      console.log('Fecha formateada para BD:', fecha);
      
      if (currentEntreno) {
        // Update existing entreno
        const { error } = await supabase
          .from('entrenos')
          .update({
            fecha: fecha,
            hora: formData.hora,
            lugar: formData.lugar,
            entrada: formData.entrada || null
          })
          .eq('id', currentEntreno.id);

        if (error) throw error;

        toast({
          title: 'Entreno actualizado',
          description: 'El entrenamiento ha sido actualizado correctamente'
        });
      } else {
        // Create new entreno
        const { error } = await supabase
          .from('entrenos')
          .insert({
            equipo_id: teamId,
            user_id: userId,
            fecha,
            hora: formData.hora,
            lugar: formData.lugar,
            entrada: formData.entrada || null
          });

        if (error) throw error;

        toast({
          title: 'Entreno creado',
          description: 'El entrenamiento ha sido creado correctamente'
        });
      }

      // Reload entrenos and reset form
      await loadEntrenos();
      setCurrentEntreno(null);
      setFormData({ hora: '', lugar: '', entrada: '' });
      setIsEditing(false);
    } catch (error) {
      console.error('Error saving entreno:', error);
      toast({
        variant: "destructive",
        title: 'Error',
        description: 'No se pudo guardar el entrenamiento'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!currentEntreno) return;

    try {
      setLoading(true);
      const { error } = await supabase
        .from('entrenos')
        .delete()
        .eq('id', currentEntreno.id);

      if (error) throw error;

      toast({
        title: 'Entreno eliminado',
        description: 'El entrenamiento ha sido eliminado correctamente'
      });

      // Reload entrenos and reset form
      await loadEntrenos();
      setCurrentEntreno(null);
      setFormData({ hora: '', lugar: '', entrada: '' });
      setIsEditing(false);
    } catch (error) {
      console.error('Error deleting entreno:', error);
      toast({
        variant: "destructive",
        title: 'Error',
        description: 'No se pudo eliminar el entrenamiento'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setCurrentEntreno(null);
    setFormData({ hora: '', lugar: '', entrada: '' });
    setIsEditing(false);
    setSelectedDate(undefined);
  };

  // Get dates with entrenos for calendar highlighting
  const datesWithEntrenos = entrenos.map(entreno => {
    // Crear la fecha correctamente para evitar problemas de zona horaria
    // Usar solo la parte de la fecha sin agregar tiempo
    const [year, month, day] = entreno.fecha.split('-');
    const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
    return date;
  });

  // Debug: mostrar las fechas con entrenos
  console.log('Entrenos cargados:', entrenos);
  console.log('Fechas con entrenos para calendario:', datesWithEntrenos);
  console.log('Fechas formateadas:', datesWithEntrenos.map(d => d.toISOString().split('T')[0]));

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Calendar */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <CalendarIcon className="h-5 w-5 mr-2" />
            Calendario de Entrenos
          </CardTitle>
          <CardDescription>
            {canEdit ? 'Selecciona un día para crear o editar un entrenamiento' : 'Visualiza los entrenamientos programados'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={handleDateSelect}
            disabled={(date) => {
              const today = new Date();
              today.setHours(0, 0, 0, 0);
              return date < today;
            }}
            modifiers={{
              hasEntreno: datesWithEntrenos
            }}
            modifiersStyles={{
              hasEntreno: {
                backgroundColor: '#10b981', // Verde para indicar que hay entrenos
                color: 'white',
                fontWeight: 'bold',
                borderRadius: '6px',
                boxShadow: '0 2px 4px rgba(16, 185, 129, 0.3)'
              }
            }}
            className="rounded-md border"
          />
          
          {/* Leyenda del calendario */}
          <div className="mt-4 flex items-center justify-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded" style={{ backgroundColor: '#10b981' }}></div>
              <span>Días con entrenos</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Training Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Clock className="h-5 w-5 mr-2" />
            {currentEntreno ? 'Editar Entrenamiento' : 'Nuevo Entrenamiento'}
          </CardTitle>
          <CardDescription>
            {selectedDate 
              ? `Entrenamiento para el ${selectedDate.toLocaleDateString('es-ES', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}`
              : 'Selecciona una fecha en el calendario'
            }
          </CardDescription>
        </CardHeader>
        <CardContent>
          {selectedDate ? (
            <div className="space-y-4">
              {canEdit ? (
                // Vista de edición para gestores
                <>
                  <div className="space-y-2">
                    <Label htmlFor="hora">Hora *</Label>
                    <Input
                      id="hora"
                      type="time"
                      value={formData.hora}
                      onChange={(e) => setFormData(prev => ({ ...prev, hora: e.target.value }))}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="lugar">Lugar *</Label>
                    <Input
                      id="lugar"
                      value={formData.lugar}
                      onChange={(e) => setFormData(prev => ({ ...prev, lugar: e.target.value }))}
                      placeholder="Ej: Campo de fútbol, Pabellón..."
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="entrada">Entrada</Label>
                    <Textarea
                      id="entrada"
                      value={formData.entrada}
                      onChange={(e) => setFormData(prev => ({ ...prev, entrada: e.target.value }))}
                      placeholder="Notas adicionales sobre el entrenamiento..."
                      rows={3}
                    />
                  </div>

                  <div className="flex gap-2">
                    <Button 
                      onClick={handleSave} 
                      disabled={loading || !formData.hora || !formData.lugar}
                      className="flex-1"
                    >
                      <Save className="h-4 w-4 mr-2" />
                      {currentEntreno ? 'Actualizar' : 'Guardar'}
                    </Button>
                    
                    {currentEntreno && (
                      <Button 
                        onClick={handleDelete} 
                        variant="destructive"
                        disabled={loading}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                    
                    <Button 
                      onClick={handleCancel} 
                      variant="outline"
                      disabled={loading}
                    >
                      Cancelar
                    </Button>
                  </div>
                </>
              ) : (
                // Vista de solo lectura para deportistas
                <div className="flex flex-col items-center justify-center py-8">
                  {currentEntreno ? (
                    <div className="space-y-4 w-full max-w-md">
                      <div className="text-center">
                        <h3 className="text-lg font-semibold mb-2">Detalles del Entrenamiento</h3>
                        <p className="text-sm text-muted-foreground">
                          {selectedDate.toLocaleDateString('es-ES', { 
                            weekday: 'long', 
                            year: 'numeric', 
                            month: 'long', 
                            day: 'numeric' 
                          })}
                        </p>
                      </div>
                      
                      <div className="space-y-3 p-6 bg-muted rounded-lg">
                        <div className="flex items-center gap-3">
                          <Clock className="h-5 w-5 text-primary" />
                          <span className="font-medium">{currentEntreno.hora}</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <MapPin className="h-5 w-5 text-primary" />
                          <span>{currentEntreno.lugar}</span>
                        </div>
                        {currentEntreno.entrada && (
                          <div className="flex items-start gap-3">
                            <FileText className="h-5 w-5 text-primary mt-0.5" />
                            <div className="text-sm whitespace-pre-line">{currentEntreno.entrada}</div>
                          </div>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="text-center">
                      <CalendarIcon className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                      <p className="text-muted-foreground">No hay entrenamiento programado para este día</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <CalendarIcon className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Selecciona una fecha en el calendario para {canEdit ? 'crear o editar' : 'ver'} un entrenamiento</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
