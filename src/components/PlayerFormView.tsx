import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft, Save, User, Activity, Users, Target, FileText, BarChart3 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/contexts/LanguageContext';

interface Posicion {
  id: string;
  nombre: string;
  descripcion: string;
}

interface Equipo {
  id: string;
  nombre: string;
}

interface PlayerFormViewProps {
  teamId: string;
  teamName: string;
  deporteId: string;
  playerId?: string;
  onBack: () => void;
  onSaved: () => void;
  isAthletesMode?: boolean;
  title?: string;
  onAnalyze?: (playerId: string, deporteId: string) => void;
}

export function PlayerFormView({ 
  teamId, 
  teamName, 
  deporteId, 
  playerId, 
  onBack, 
  onSaved, 
  isAthletesMode = false,
  title,
  onAnalyze
}: PlayerFormViewProps) {
  // Estados para posiciones y equipos
  const [posiciones, setPosiciones] = useState<Posicion[]>([]);
  const [equipos, setEquipos] = useState<Equipo[]>([]);
  
  // Estados para datos personales
  const [playerName, setPlayerName] = useState('');
  const [apellidos, setApellidos] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [email, setEmail] = useState('');
  const [movil, setMovil] = useState('');
  
  // Estados para datos biométricos
  const [height, setHeight] = useState('');
  const [weight, setWeight] = useState('');
  const [envergadura, setEnvergadura] = useState('');
  const [numeroPie, setNumeroPie] = useState('');
  const [fcReposo, setFcReposo] = useState('');
  const [fcMax, setFcMax] = useState('');
  
  // Estados para equipos y posiciones
  const [selectedPositions, setSelectedPositions] = useState<string[]>([]);
  const [selectedTeams, setSelectedTeams] = useState<string[]>([]);
  
  // Estados para notas
  const [notas, setNotas] = useState('');
  
  // Estados de control
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  // Estados calculados
  const [edad, setEdad] = useState<number | null>(null);
  const [imc, setImc] = useState<number | null>(null);
  
  // Estados de validación
  const [emailError, setEmailError] = useState('');
  const [movilError, setMovilError] = useState('');
  
  const { toast } = useToast();
  const { t } = useLanguage();

  useEffect(() => {
    const initializeData = async () => {
      setLoading(true);
      try {
        console.log('Initializing data for playerId:', playerId, 'isAthletesMode:', isAthletesMode);
        
        // Cargar posiciones siempre
        await loadPosiciones();
        
        if (playerId) {
          // Si estamos editando un jugador existente
          console.log('Loading existing player data...');
          await loadPlayerData();
          await loadEquipos();
        } else {
          // Modo normal de equipos o deportistas
          console.log('Loading teams...');
          await loadEquipos();
        }
      } catch (error) {
        console.error('Error initializing data:', error);
      } finally {
        setLoading(false);
      }
    };

    initializeData();
  }, [teamId, deporteId, playerId, isAthletesMode]);

  // Calcular edad cuando cambie la fecha de nacimiento
  useEffect(() => {
    if (birthDate) {
      const today = new Date();
      const birth = new Date(birthDate);
      const age = today.getFullYear() - birth.getFullYear();
      const monthDiff = today.getMonth() - birth.getMonth();
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
        setEdad(age - 1);
      } else {
        setEdad(age);
      }
    } else {
      setEdad(null);
    }
  }, [birthDate]);

  // Calcular IMC cuando cambien peso o altura
  useEffect(() => {
    if (weight && height) {
      const peso = parseFloat(weight);
      const altura = parseFloat(height);
      if (peso > 0 && altura > 0) {
        const imcValue = peso / (altura * altura);
        setImc(Math.round(imcValue * 100) / 100);
      } else {
        setImc(null);
      }
    } else {
      setImc(null);
    }
  }, [weight, height]);

  // Calcular FC Max cuando cambie la edad (solo si no se ha editado manualmente)
  useEffect(() => {
    if (edad !== null && edad > 0 && !fcMax) {
      setFcMax((220 - edad).toString());
    }
  }, [edad, fcMax]);


  const loadPosiciones = async () => {
    try {
      const { data, error } = await supabase
        .from('posiciones')
        .select('id, nombre, descripcion')
        .eq('deporte_id', deporteId);

      if (error) {
        console.error('Error loading posiciones:', error);
        return;
      }

      setPosiciones(data || []);
    } catch (error) {
      console.error('Error loading posiciones:', error);
    }
  };

  const loadEquipos = async () => {
    if (!playerId) {
      return;
    }

    try {
      const { data, error } = await supabase
        .from('jugador_equipos')
        .select(`
          equipos!inner(
            id,
            nombre
          )
        `)
        .eq('jugador_id', playerId);

      if (error) {
        console.error('Error loading teams:', error);
        return;
      }

      const equiposData = data?.map(item => item.equipos).filter(Boolean) || [];
      setEquipos(equiposData);
      setSelectedTeams(equiposData.map(equipo => equipo.id));
    } catch (error) {
      console.error('Error loading teams:', error);
    }
  };

  const loadPlayerData = async () => {
    try {
      console.log('Loading player data for ID:', playerId);
      
      const { data: playerData, error } = await supabase
        .from('jugadores')
        .select('*')
        .eq('id', playerId)
        .single();

      if (error) {
        console.error('Error loading player:', error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "No se pudo cargar la información del deportista"
        });
        return;
      }

      if (!playerData) {
        console.error('No player data found');
        toast({
          variant: "destructive",
          title: "Error",
          description: "No se encontraron datos del deportista"
        });
        return;
      }

      console.log('Player data loaded successfully:', playerData);

      // Cargar todos los campos, incluyendo los nuevos
      setPlayerName(playerData.nombre || '');
      setApellidos(playerData.apellidos || '');
      setBirthDate(playerData.fecha_nacimiento || '');
      setEmail(playerData.email || '');
      setMovil(playerData.movil || '');
      setHeight(playerData.altura?.toString() || '');
      setWeight(playerData.peso?.toString() || '');
      setEnvergadura(playerData.envergadura?.toString() || '');
      setNumeroPie(playerData.numero_pie?.toString() || '');
      setFcReposo(playerData.fc_reposo?.toString() || '');
      setFcMax(playerData.fc_max?.toString() || '');
      setNotas(playerData.notas || '');

      // Load player positions
      const { data: playerPositions } = await supabase
        .from('jugador_posiciones')
        .select('posicion_id')
        .eq('jugador_id', playerId);

      if (playerPositions) {
        setSelectedPositions(playerPositions.map(item => item.posicion_id));
      }
    } catch (error) {
      console.error('Error loading player:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Error al cargar los datos del deportista"
      });
    }
  };

  const validateEmail = (email: string) => {
    const emailRegex = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;
    return emailRegex.test(email);
  };

  const validateMovil = (movil: string) => {
    const movilRegex = /^[0-9]{9,15}$/;
    return movilRegex.test(movil);
  };

  const handleEmailChange = (value: string) => {
    setEmail(value);
    if (value && !validateEmail(value)) {
      setEmailError('Formato de email inválido');
    } else {
      setEmailError('');
    }
  };

  const handleMovilChange = (value: string) => {
    setMovil(value);
    if (value && !validateMovil(value)) {
      setMovilError('Formato de móvil inválido (9-15 dígitos)');
    } else {
      setMovilError('');
    }
  };

  const handleSavePlayer = async () => {
    if (!playerName.trim()) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "El nombre es obligatorio"
      });
      return;
    }

    if (email && !validateEmail(email)) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "El formato del email es inválido"
      });
      return;
    }

    if (movil && !validateMovil(movil)) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "El formato del móvil es inválido"
      });
      return;
    }

    setSaving(true);

    try {
      // Obtener información del usuario autenticado
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('Usuario no autenticado');
      }

      // Obtener datos del usuario de la tabla usuarios
      const { data: usuarioData, error: usuarioError } = await supabase
        .from('usuarios')
        .select('id, clave_club')
        .eq('auth_user_id', user.id)
        .single();

      if (usuarioError || !usuarioData) {
        throw new Error('No se pudo obtener la información del usuario');
      }

      let playerData;
      
      if (playerId) {
        // Actualizar jugador existente
        const { data, error } = await supabase
          .from('jugadores')
          .update({
            nombre: playerName.trim(),
            apellidos: apellidos.trim() || null,
            fecha_nacimiento: birthDate || null,
            email: email.trim() || null,
            movil: movil.trim() || null,
            altura: height ? parseFloat(height) : null,
            peso: weight ? parseFloat(weight) : null,
            envergadura: envergadura ? parseFloat(envergadura) : null,
            numero_pie: numeroPie ? parseInt(numeroPie) : null,
            fc_reposo: fcReposo ? parseInt(fcReposo) : null,
            fc_max: fcMax ? parseInt(fcMax) : null,
            notas: notas.trim() || null,
            user_id: usuarioData.id,
            clave_club: usuarioData.clave_club
          })
          .eq('id', playerId)
          .select('id')
          .single();

        if (error) throw error;
        playerData = data;
      } else {
        // Crear nuevo jugador con user_id y clave_club
        const { data, error } = await supabase
          .from('jugadores')
          .insert({
            nombre: playerName.trim(),
            apellidos: apellidos.trim() || null,
            fecha_nacimiento: birthDate || null,
            email: email.trim() || null,
            movil: movil.trim() || null,
            altura: height ? parseFloat(height) : null,
            peso: weight ? parseFloat(weight) : null,
            envergadura: envergadura ? parseFloat(envergadura) : null,
            numero_pie: numeroPie ? parseInt(numeroPie) : null,
            fc_reposo: fcReposo ? parseInt(fcReposo) : null,
            fc_max: fcMax ? parseInt(fcMax) : null,
            notas: notas.trim() || null,
            user_id: usuarioData.id,
            clave_club: usuarioData.clave_club
          })
          .select('id')
          .single();

        if (error) throw error;
        playerData = data;

        // Solo para nuevos jugadores, añadir al equipo actual si hay teamId
        if (playerData?.id && teamId) {
          await supabase
            .from('jugador_equipos')
            .insert({
              jugador_id: playerData.id,
              equipo_id: teamId
            });
        }
      }

      // Gestionar posiciones
      if (playerData?.id) {
        if (playerId) {
          // Eliminar posiciones existentes
          await supabase
            .from('jugador_posiciones')
            .delete()
            .eq('jugador_id', playerData.id);
        }

        // Añadir posiciones seleccionadas
        for (const posicionId of selectedPositions) {
          await supabase
            .from('jugador_posiciones')
            .insert({
              jugador_id: playerData.id,
              posicion_id: posicionId
            });
        }
      }

      toast({
        title: "Éxito",
        description: playerId ? "Deportista actualizado correctamente" : "Deportista creado correctamente"
      });

      onSaved();
    } catch (error) {
      console.error('Error saving player:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error instanceof Error ? error.message : "Error al guardar el deportista"
      });
    } finally {
      setSaving(false);
    }
  };

  const togglePosition = (posicionId: string) => {
    setSelectedPositions(prev => 
      prev.includes(posicionId) 
        ? prev.filter(id => id !== posicionId)
        : [...prev, posicionId]
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-accent/5 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto"></div>
          <p className="text-muted-foreground">Cargando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-accent/5">
      <div className="max-w-6xl mx-auto py-8 px-4">
        <div className="grid gap-8">
          {/* Datos Personales */}
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="flex items-center">
                <User className="h-5 w-5 mr-2" />
                Datos Personales
              </CardTitle>
              <CardDescription>
                Información básica del deportista
              </CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="nombre">Nombre *</Label>
                <Input
                  id="nombre"
                  value={playerName}
                  onChange={(e) => setPlayerName(e.target.value)}
                  placeholder="Nombre del deportista"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="apellidos">Apellidos</Label>
                <Input
                  id="apellidos"
                  value={apellidos}
                  onChange={(e) => setApellidos(e.target.value)}
                  placeholder="Apellidos del deportista"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="fechaNacimiento">Fecha de Nacimiento</Label>
                <Input
                  id="fechaNacimiento"
                  type="date"
                  value={birthDate}
                  onChange={(e) => setBirthDate(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edad">Edad</Label>
                <Input
                  id="edad"
                  value={edad !== null ? `${edad} años` : ''}
                  disabled
                  className="bg-muted"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Correo Electrónico</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => handleEmailChange(e.target.value)}
                  placeholder="email@ejemplo.com"
                />
                {emailError && <p className="text-sm text-red-500">{emailError}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="movil">Móvil</Label>
                <Input
                  id="movil"
                  value={movil}
                  onChange={(e) => handleMovilChange(e.target.value)}
                  placeholder="123456789"
                />
                {movilError && <p className="text-sm text-red-500">{movilError}</p>}
              </div>
            </CardContent>
          </Card>

          {/* Datos Biométricos */}
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Activity className="h-5 w-5 mr-2" />
                Datos Biométricos
              </CardTitle>
              <CardDescription>
                Medidas físicas y parámetros de rendimiento
              </CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="altura">Altura (m)</Label>
                <Input
                  id="altura"
                  type="number"
                  step="0.01"
                  min="0"
                  value={height}
                  onChange={(e) => setHeight(e.target.value)}
                  placeholder="1.75"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="peso">Peso (kg)</Label>
                <Input
                  id="peso"
                  type="number"
                  step="0.1"
                  min="0"
                  value={weight}
                  onChange={(e) => setWeight(e.target.value)}
                  placeholder="70.5"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="imc">IMC</Label>
                <Input
                  id="imc"
                  value={imc !== null ? imc.toString() : ''}
                  disabled
                  className="bg-muted"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="envergadura">Envergadura (m)</Label>
                <Input
                  id="envergadura"
                  type="number"
                  step="0.01"
                  min="0"
                  value={envergadura}
                  onChange={(e) => setEnvergadura(e.target.value)}
                  placeholder="1.80"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="numeroPie">Nº Pie</Label>
                <Input
                  id="numeroPie"
                  type="number"
                  min="1"
                  value={numeroPie}
                  onChange={(e) => setNumeroPie(e.target.value)}
                  placeholder="42"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="fcReposo">FC Reposo (ppm)</Label>
                <Input
                  id="fcReposo"
                  type="number"
                  min="1"
                  value={fcReposo}
                  onChange={(e) => setFcReposo(e.target.value)}
                  placeholder="60"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="fcMax">FC Máxima (ppm)</Label>
                <Input
                  id="fcMax"
                  type="number"
                  min="1"
                  value={fcMax}
                  onChange={(e) => setFcMax(e.target.value)}
                  placeholder="220"
                />
              </div>
            </CardContent>
          </Card>

          {/* Equipos - Solo visualización */}
          {equipos.length > 0 && (
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Users className="h-5 w-5 mr-2" />
                  Equipos
                </CardTitle>
                <CardDescription>
                  Equipos a los que pertenece el deportista
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {equipos.map((equipo) => (
                    <div
                      key={equipo.id}
                      className="p-3 border rounded-lg bg-muted/50"
                    >
                      <div className="font-medium text-sm">{equipo.nombre}</div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Posiciones - Botones como antes */}
          {posiciones.length > 0 && (
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Target className="h-5 w-5 mr-2" />
                  Posiciones
                </CardTitle>
                <CardDescription>
                  Selecciona las posiciones que puede jugar el deportista
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {posiciones.map((posicion) => (
                    <div
                      key={posicion.id}
                      className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                        selectedPositions.includes(posicion.id)
                          ? 'border-primary bg-primary/10'
                          : 'border-border hover:border-primary/50'
                      }`}
                      onClick={() => togglePosition(posicion.id)}
                    >
                      <div className="font-medium text-sm">{posicion.nombre}</div>
                      {posicion.descripcion && (
                        <div className="text-xs text-muted-foreground mt-1">
                          {posicion.descripcion}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Notas */}
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="flex items-center">
                <FileText className="h-5 w-5 mr-2" />
                Notas
              </CardTitle>
              <CardDescription>
                Información adicional sobre el deportista
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Textarea
                value={notas}
                onChange={(e) => setNotas(e.target.value)}
                placeholder="Añade notas adicionales sobre el deportista..."
                className="min-h-[100px]"
              />
            </CardContent>
          </Card>

          {/* Botones de acción */}
          <div className="flex justify-between gap-4">
            <div className="flex gap-4">
              {playerId && onAnalyze && !isAthletesMode && (
                <Button 
                  onClick={() => onAnalyze(playerId, deporteId)}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  <BarChart3 className="h-4 w-4 mr-2" />
                  Analizar
                </Button>
              )}
            </div>
            <div className="flex gap-4">
              <Button variant="outline" onClick={onBack}>
                Cancelar
              </Button>
              <Button onClick={handleSavePlayer} disabled={saving}>
                <Save className="h-4 w-4 mr-2" />
                {saving ? 'Guardando...' : (playerId ? 'Actualizar' : 'Crear')}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
