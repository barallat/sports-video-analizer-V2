import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/contexts/LanguageContext';
import { useSportConfigContext } from '@/contexts/SportConfigContext';
import { supabase } from '@/integrations/supabase/client';

interface NewAnalysisViewProps {
  onBack: () => void;
  userName?: string;
  onLogout?: () => Promise<void>;
  onAnalysisComplete: (analysisId: string) => void;
  preselectedPlayerId?: string;
  preselectedDeporteId?: string;
}

// Helper function to convert file to base64
function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const base64String = reader.result as string;
      // Remove the data:video/mp4;base64, part
      const base64Data = base64String.split(',')[1];
      resolve(base64Data);
    };
    reader.onerror = error => reject(error);
  });
}

export function NewAnalysisView({ onBack, userName, onLogout, onAnalysisComplete, preselectedPlayerId, preselectedDeporteId }: NewAnalysisViewProps) {
  const [analysisTitle, setAnalysisTitle] = useState('');
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoUrl, setVideoUrl] = useState<string>('');
  const [deportes, setDeportes] = useState<any[]>([]);
  const [equipos, setEquipos] = useState<any[]>([]);
  const [posiciones, setPosiciones] = useState<any[]>([]);
  const [jugadores, setJugadores] = useState<any[]>([]);
  const [movimientos, setMovimientos] = useState<any[]>([]);
  const [selectedDeporte, setSelectedDeporte] = useState<string>('');
  const [selectedEquipo, setSelectedEquipo] = useState<string>('');
  const [selectedPosicion, setSelectedPosicion] = useState<string>('');
  const [selectedPlayer, setSelectedPlayer] = useState<string>('');
  const [selectedMovement, setSelectedMovement] = useState<string>('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { t } = useLanguage();
  const { features, database, sportDisplayName } = useSportConfigContext();

  useEffect(() => {
    // Siempre limpiar el estado primero
    clearFormState();
    
    // Solo cargar datos preseleccionados si realmente hay un jugador preseleccionado
    // y no es un acceso desde dashboard (que debería tener editingPlayer undefined)
    if (preselectedPlayerId && preselectedDeporteId) {
      // Si hay jugador y deporte preseleccionados, cargar sus datos
      setSelectedPlayer(preselectedPlayerId);
      loadPlayerDataAndSport(preselectedPlayerId);
      // Hacer scroll hacia arriba
      window.scrollTo(0, 0);
    } else {
      // Acceso desde dashboard - cargar datos normales
      if (features.skipSportsConfig) {
        // En modo deporte individual, usar el deporte configurado
        setSelectedDeporte(database.sportFilter);
        loadJugadoresForSport();
        loadPosicionesForSport(database.sportFilter);
      } else {
        // En modo multideporte, cargar todos los deportes
        loadDeportes();
      }
    }
  }, [features.skipSportsConfig, database.sportFilter, preselectedPlayerId, preselectedDeporteId]);

  const clearFormState = () => {
    setSelectedDeporte('');
    setSelectedPlayer('');
    setSelectedEquipo('');
    setSelectedPosicion('');
    setSelectedMovement('');
    setEquipos([]);
    setJugadores([]);
    setPosiciones([]);
    setMovimientos([]);
  };

  useEffect(() => {
    if (selectedDeporte && !features.skipSportsConfig) {
      loadPosiciones();
    }
  }, [selectedDeporte, features.skipSportsConfig]);

  // Reset dependent fields when sport changes
  useEffect(() => {
    if (selectedDeporte) {
      setSelectedPlayer('');
      setSelectedEquipo('');
      setEquipos([]);
    }
  }, [selectedDeporte]);

  // Reset dependent fields when player changes
  useEffect(() => {
    if (selectedPlayer) {
      setSelectedEquipo('');
      setEquipos([]);
    }
  }, [selectedPlayer]);

  useEffect(() => {
    if (preselectedPlayerId) {
      // Si hay un jugador preseleccionado, cargar sus datos
      loadPreselectedPlayer();
    } else if (selectedDeporte) {
      // Cargar jugadores del deporte seleccionado
      loadJugadoresForSport();
    } else {
      setJugadores([]);
      setSelectedPlayer('');
    }
  }, [selectedDeporte, preselectedPlayerId]);

  useEffect(() => {
    if (selectedPlayer && !preselectedPlayerId) {
      // Cargar equipos del jugador seleccionado manualmente
      loadEquiposForPlayer(selectedPlayer);
    } else if (!selectedPlayer) {
      // Si no hay jugador seleccionado, limpiar equipos
      setEquipos([]);
      setSelectedEquipo('');
    }
  }, [selectedPlayer, preselectedPlayerId]);

  const loadPreselectedPlayer = async () => {
    if (!preselectedPlayerId) return;
    
    try {
      const { data, error } = await supabase
        .from('jugadores')
        .select('id, nombre')
        .eq('id', preselectedPlayerId)
        .single();

      if (error) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "No se pudo cargar el jugador seleccionado"
        });
      } else {
        setJugadores([data]);
        setSelectedPlayer(data.id);
        // Cargar los equipos del jugador preseleccionado
        await loadEquiposForPlayer(data.id);
      }
    } catch (error) {
      console.error('Error loading preselected player:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Error al cargar el jugador seleccionado"
      });
    }
  };

  useEffect(() => {
    if (selectedPosicion) {
      loadMovimientos();
    } else {
      setMovimientos([]);
      setSelectedMovement('');
    }
  }, [selectedPosicion]);

  const loadDeportes = async () => {
    try {
      const { data: userData } = await supabase
        .from('usuarios')
        .select('id')
        .eq('auth_user_id', (await supabase.auth.getUser()).data.user?.id)
        .single();

      if (userData) {
        const { data, error } = await supabase
          .from('usuario_deportes')
          .select(`
            deportes (
              id,
              nombre
            )
          `)
          .eq('usuario_id', userData.id);

        if (error) {
          toast({
            variant: "destructive",
            title: "Error",
            description: "No se pudieron cargar los deportes"
          });
        } else {
          const deportesData = data?.map(item => item.deportes).filter(Boolean) || [];
          setDeportes(deportesData);
        }
      }
    } catch (error) {
      console.error('Error loading deportes:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Error al cargar los deportes"
      });
    }
  };

  const loadEquiposForSport = async (deporteId: string) => {
    try {
      const { data: userData } = await supabase
        .from('usuarios')
        .select('id')
        .eq('auth_user_id', (await supabase.auth.getUser()).data.user?.id)
        .single();

      if (userData) {
        const { data, error } = await supabase
          .from('equipos')
          .select('id, nombre')
          .eq('deporte_id', deporteId)
          .eq('usuario_id', userData.id);

        if (error) {
          toast({
            variant: "destructive",
            title: "Error",
            description: "No se pudieron cargar los equipos"
          });
        } else {
          setEquipos(data || []);
        }
      }
    } catch (error) {
      console.error('Error loading equipos:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Error al cargar los equipos"
      });
    }
  };

  const loadEquipos = async () => {
    await loadEquiposForSport(selectedDeporte);
  };

  const loadPlayerDataAndSport = async (playerId: string) => {
    try {
      // Obtener el jugador, sus equipos y el deporte de los equipos
      const { data, error } = await supabase
        .from('jugador_equipos')
        .select(`
          equipos!inner(
            id,
            nombre,
            deporte_id,
            deportes!inner(
              id,
              nombre
            )
          )
        `)
        .eq('jugador_id', playerId);

      if (error) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "No se pudieron cargar los datos del jugador"
        });
        return;
      }

      if (!data || data.length === 0) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "El jugador no pertenece a ningún equipo"
        });
        return;
      }

      // Obtener el deporte del primer equipo (todos los equipos del jugador deben ser del mismo deporte)
      const firstTeam = data[0].equipos;
      const deporteId = firstTeam.deporte_id;
      const deporteNombre = firstTeam.deportes.nombre;

      // Cargar la lista de deportes primero para que se pueda mostrar el valor
      await loadDeportes();

      // Configurar el deporte
      setSelectedDeporte(deporteId);
      
      // Cargar posiciones para este deporte
      await loadPosicionesForSport(deporteId);

      // Configurar los equipos
      const equiposData = data.map(item => ({
        id: item.equipos.id,
        nombre: item.equipos.nombre
      }));
      setEquipos(equiposData);
      
      // Si solo hay un equipo, seleccionarlo automáticamente
      if (equiposData.length === 1) {
        setSelectedEquipo(equiposData[0].id);
      }

      // Cargar los datos del jugador para mostrarlo en el desplegable
      const { data: playerData, error: playerError } = await supabase
        .from('jugadores')
        .select('id, nombre')
        .eq('id', playerId)
        .single();

      if (!playerError && playerData) {
        setJugadores([playerData]);
        setSelectedPlayer(playerId);
      }

      console.log('Player data loaded:', {
        deporteId,
        deporteNombre,
        equipos: equiposData,
        player: playerData
      });

    } catch (error) {
      console.error('Error loading player data and sport:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Error al cargar los datos del jugador"
      });
    }
  };

  const loadEquiposForPlayer = async (playerId: string) => {
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
        toast({
          variant: "destructive",
          title: "Error",
          description: "No se pudieron cargar los equipos del jugador"
        });
      } else {
        const equiposData = data?.map(item => item.equipos).filter(Boolean) || [];
        setEquipos(equiposData);
        // Si solo hay un equipo, seleccionarlo automáticamente
        if (equiposData.length === 1) {
          setSelectedEquipo(equiposData[0].id);
        }
      }
    } catch (error) {
      console.error('Error loading player teams:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Error al cargar los equipos del jugador"
      });
    }
  };

  const loadPosicionesForSport = async (deporteId: string) => {
    try {
      const { data, error } = await supabase
        .from('posiciones')
        .select('id, nombre')
        .eq('deporte_id', deporteId);

      if (error) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "No se pudieron cargar las posiciones"
        });
      } else {
        setPosiciones(data || []);
      }
    } catch (error) {
      console.error('Error loading posiciones:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Error al cargar las posiciones"
      });
    }
  };

  const loadPosiciones = async () => {
    await loadPosicionesForSport(selectedDeporte);
  };

  const loadJugadoresForSport = async () => {
    try {
      // Obtener el usuario actual
      const { data: userData } = await supabase
        .from('usuarios')
        .select('id')
        .eq('auth_user_id', (await supabase.auth.getUser()).data.user?.id)
        .single();

      if (!userData) {
        console.error('No user data found');
        setJugadores([]);
        return;
      }

      // Obtener todos los equipos del usuario para el deporte seleccionado
      const { data: userTeams } = await supabase
        .from('equipos')
        .select('id')
        .eq('usuario_id', userData.id)
        .eq('deporte_id', selectedDeporte);

      if (!userTeams || userTeams.length === 0) {
        setJugadores([]);
        return;
      }

      const teamIds = userTeams.map(team => team.id);

      // Obtener todos los jugadores de todos los equipos del usuario para este deporte
      const { data: athletesData, error } = await supabase
        .from('jugador_equipos')
        .select(`
          jugadores!inner(
            id,
            nombre
          )
        `)
        .in('equipo_id', teamIds);

      if (error) {
        console.error('Error loading athletes:', error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "No se pudieron cargar los deportistas"
        });
        return;
      }

      // Procesar los datos para obtener jugadores únicos
      const athletesMap = new Map();
      athletesData?.forEach(item => {
        const athlete = item.jugadores;
        if (!athletesMap.has(athlete.id)) {
          athletesMap.set(athlete.id, athlete);
        }
      });

      const athletesList = Array.from(athletesMap.values());
      setJugadores(athletesList);
    } catch (error) {
      console.error('Error loading athletes for sport:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Error al cargar los deportistas del deporte"
      });
    }
  };

  const loadJugadores = async () => {
    try {
      // Primero obtener los IDs de los jugadores del equipo
      const { data: jugadorEquipos, error: jugadorEquiposError } = await supabase
        .from('jugador_equipos')
        .select('jugador_id')
        .eq('equipo_id', selectedEquipo);

      if (jugadorEquiposError) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "No se pudieron cargar los jugadores del equipo"
        });
        return;
      }

      if (!jugadorEquipos || jugadorEquipos.length === 0) {
        setJugadores([]);
        return;
      }

      const jugadorIds = jugadorEquipos.map(item => item.jugador_id);

      // Ahora obtener los datos de los jugadores
      const { data, error } = await supabase
        .from('jugadores')
        .select('id, nombre')
        .in('id', jugadorIds);

      if (error) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "No se pudieron cargar los jugadores"
        });
      } else {
        setJugadores(data || []);
      }
    } catch (error) {
      console.error('Error loading jugadores:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Error al cargar los jugadores"
      });
    }
  };

  const loadMovimientos = async () => {
    try {
      const { data, error } = await supabase
        .from('posicion_movimientos')
        .select('id, nombre_movimiento')
        .eq('posicion_id', selectedPosicion);

      if (error) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "No se pudieron cargar los movimientos"
        });
      } else {
        setMovimientos(data || []);
      }
    } catch (error) {
      console.error('Error loading movements:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Error al cargar los movimientos"
      });
    }
  };

  const handleVideoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Limitar a 20 MB
      const maxSizeMB = 20;
      const maxSizeBytes = maxSizeMB * 1024 * 1024;
      if (file.size > maxSizeBytes) {
        toast({
          variant: "destructive",
          title: "Archivo demasiado grande",
          description: `El tamaño del video no puede ser superior a ${maxSizeMB} MB.`
        });
        // Limpiar selección
        e.target.value = '';
        setVideoFile(null);
        setVideoUrl('');
        return;
      }
      setVideoFile(file);
      const url = URL.createObjectURL(file);
      setVideoUrl(url);
    }
  };

  const uploadVideoToStorage = async (file: File): Promise<string> => {
    // Generate a UUID for the filename
    const uuid = crypto.randomUUID();
    const fileExtension = file.name.split('.').pop() || 'mp4';
    const fileName = `${uuid}.${fileExtension}`;
    const filePath = `raw/${fileName}`;

    console.log('Uploading video to storage with UUID filename:', filePath);

    const { data, error } = await supabase.storage
      .from('videos')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (error) {
      console.error('Error uploading video:', error);
      throw new Error('Error al subir el video al almacenamiento');
    }

    console.log('Video uploaded successfully:', data.path);
    return data.path;
  };

  const getVideoUrlFromStorage = async (path: string): Promise<string> => {
    const { data } = supabase.storage
      .from('videos')
      .getPublicUrl(path);

    return data.publicUrl;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!videoFile || !selectedPlayer || !selectedMovement || (!features.skipSportsConfig && !selectedDeporte)) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Por favor completa todos los campos requeridos"
      });
      return;
    }

    setIsAnalyzing(true);

    try {
      console.log('Starting analysis process...');

      // Subir video al Storage primero
      const videoStoragePath = await uploadVideoToStorage(videoFile);
      const videoStorageUrl = await getVideoUrlFromStorage(videoStoragePath);
      
      console.log('Video uploaded to storage:', videoStoragePath);
      console.log('Video public URL:', videoStorageUrl);

      // Convert video file to base64 for Gemini
      const videoBase64 = await fileToBase64(videoFile);
      console.log('Video converted to base64, size:', videoBase64.length);
      
      // Get movement characteristics using the correct column names
      const { data: movementData, error: movementError } = await supabase
        .from('posicion_movimientos')
        .select('caracteristica_1, caracteristica_2, caracteristica_3, caracteristica_4, caracteristica_5, caracteristica_6, caracteristica_7')
        .eq('id', selectedMovement)
        .single();

      if (movementError || !movementData) {
        throw new Error('No se pudieron obtener las características del movimiento');
      }

      // Build characteristics array from the individual columns
      const characteristics = [
        movementData.caracteristica_1,
        movementData.caracteristica_2,
        movementData.caracteristica_3,
        movementData.caracteristica_4,
        movementData.caracteristica_5,
        movementData.caracteristica_6,
        movementData.caracteristica_7
      ].filter(Boolean); // Remove null/empty values

      console.log('Movement characteristics:', characteristics);

      // Get player and sport information
      const { data: playerData, error: playerError } = await supabase
        .from('jugadores')
        .select(`
          nombre,
          equipo_id,
          user_id,
          clave_club,
          equipos(
            nombre,
            deporte_id,
            deportes(nombre)
          )
        `)
        .eq('id', selectedPlayer)
        .single();

      if (playerError || !playerData) {
        throw new Error('No se pudieron obtener los datos del jugador');
      }

      const athleteName = playerData.nombre || "el atleta";
      const sport = playerData.equipos?.deportes?.nombre || "atletismo";
      const teamName = playerData.equipos?.nombre || "equipo";

      console.log('Player info:', { athleteName, sport, teamName });

      // Get movement name
      const { data: movementInfo, error: movementInfoError } = await supabase
        .from('posicion_movimientos')
        .select('nombre_movimiento')
        .eq('id', selectedMovement)
        .single();

      if (movementInfoError || !movementInfo) {
        throw new Error('No se pudo obtener información del movimiento');
      }

      const movementName = movementInfo.nombre_movimiento;

      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('Usuario no autenticado');
      }

      const { data: userData, error: userError } = await supabase
        .from('usuarios')
        .select('id')
        .eq('auth_user_id', user.id)
        .single();

      if (userError || !userData) {
        throw new Error('No se pudo obtener información del usuario');
      }

      // Use Supabase edge function with video base64 data
      console.log('Calling Gemini analysis via edge function with video data...');
      
      const { data: analysisResult, error: analysisError } = await supabase.functions.invoke('gemini-analysis', {
        body: {
          video_base64: videoBase64,
          video_mime_type: videoFile.type,
          movement_type: movementName,
          characteristics: characteristics,
          athlete_name: athleteName,
          sport: sport,
          position: teamName
        }
      });

      if (analysisError) {
        console.error('Analysis error:', analysisError);
        throw new Error('Error en el análisis con Gemini');
      }

      console.log('Analysis result:', analysisResult);

      // Save analysis to database with video storage path
      console.log('Saving analysis to database...');
      const { data: analysisData, error: saveError } = await supabase
        .from('analisis_videos')
        .insert({
          titulo: analysisTitle,
          url_video: videoStorageUrl,
          raw_video_path: videoStoragePath,
          jugador_id: selectedPlayer,
          posicion_movimiento_id: selectedMovement,
          deporte_id: selectedDeporte,
          equipo_id: selectedEquipo || null,
          usuario_id: userData.id,
          resultados_analisis: analysisResult as any
        })
        .select('id')
        .single();

      if (saveError) {
        console.error('Save error:', saveError);
        throw new Error('Error al guardar el análisis');
      }

      console.log('Analysis saved successfully with ID:', analysisData.id);
      
      toast({
        title: "¡Análisis completado!",
        description: "El análisis se ha realizado correctamente"
      });

      // Navigate to results
      onAnalysisComplete(analysisData.id);

    } catch (error) {
      console.error('Analysis error:', error);
      toast({
        variant: "destructive",
        title: "Error en el análisis",
        description: error instanceof Error ? error.message : "Error desconocido"
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="w-full max-w-none mx-auto">
        <div className="max-w-7xl mx-auto">
          <Card className="glass-card">
            <CardHeader>
              <CardTitle>Detalles del Análisis</CardTitle>
              <CardDescription>
                Completa todos los campos para crear un nuevo análisis.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4">
              {/* Título del Análisis - Full width */}
              <div className="grid gap-2">
                <Label htmlFor="title">Título del Análisis</Label>
                <Input
                  id="title"
                  placeholder="Ej: Análisis de Salto de Altura"
                  value={analysisTitle}
                  onChange={(e) => setAnalysisTitle(e.target.value)}
                />
              </div>

              {/* Deporte y Jugador - Two columns */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Campo deporte solo visible en modo multideporte */}
                {!features.skipSportsConfig && (
                  <div className="grid gap-2">
                    <Label htmlFor="deporte">Deporte</Label>
                    <Select 
                      onValueChange={setSelectedDeporte} 
                      value={selectedDeporte}
                      disabled={preselectedPlayerId ? true : false}
                    >
                      <SelectTrigger className="w-full">
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
                )}

                <div className="grid gap-2">
                  <Label htmlFor="player">Jugador</Label>
                  <Select onValueChange={setSelectedPlayer} value={selectedPlayer} disabled={preselectedPlayerId ? true : !selectedDeporte}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Selecciona un jugador" />
                    </SelectTrigger>
                    <SelectContent>
                      {jugadores.map((player) => (
                        <SelectItem key={player.id} value={player.id}>
                          {player.nombre}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Equipo y Posición - Two columns */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="equipo">Equipo</Label>
                  <Select onValueChange={setSelectedEquipo} value={selectedEquipo} disabled={preselectedPlayerId ? false : !selectedPlayer}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Selecciona un equipo" />
                    </SelectTrigger>
                    <SelectContent>
                      {equipos.map((equipo) => (
                        <SelectItem key={equipo.id} value={equipo.id}>
                          {equipo.nombre}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="posicion">Posición</Label>
                  <Select onValueChange={setSelectedPosicion} disabled={!selectedDeporte}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Selecciona una posición" />
                    </SelectTrigger>
                    <SelectContent>
                      {posiciones.map((posicion) => (
                        <SelectItem key={posicion.id} value={posicion.id}>
                          {posicion.nombre}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Movimiento - Full width */}
              <div className="grid gap-2">
                <Label htmlFor="movement">Movimiento</Label>
                <Select onValueChange={setSelectedMovement} disabled={!selectedPosicion}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Selecciona un movimiento" />
                  </SelectTrigger>
                  <SelectContent>
                    {movimientos.map((movement) => (
                      <SelectItem key={movement.id} value={movement.id}>
                        {movement.nombre_movimiento}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="video">Video</Label>
                <Input
                  type="file"
                  id="video"
                  accept="video/*"
                  onChange={handleVideoUpload}
                />
                {videoFile && (
                  <div className="mt-4">
                    <p className="text-sm text-muted-foreground mb-2">
                      Vista previa del video:
                    </p>
                    <video 
                      src={videoUrl} 
                      controls 
                      className="w-full max-w-md mx-auto rounded-lg border"
                      style={{ maxHeight: '300px' }}
                    >
                      Tu navegador no soporta la reproducción de video.
                    </video>
                  </div>
                )}
              </div>
            </CardContent>
            <CardFooter>
              <Button disabled={isAnalyzing} onClick={handleSubmit}>
                {isAnalyzing ? 'Analizando...' : 'Comenzar Análisis'}
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
}
