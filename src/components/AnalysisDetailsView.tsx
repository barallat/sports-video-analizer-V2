import { useState, useEffect, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Trophy, User, Calendar, Clock, FileText } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useLanguage } from '@/contexts/LanguageContext';

interface AnalysisDetails {
  id: string;
  titulo: string;
  fecha_analisis: string;
  descripcion: string;
  resultados_analisis: any;
  url_video: string;
  processed_video_path: string;
  duracion_segundos: number;
  comentarios: string;
  deporte_id: string;
  equipo_id: string | null;
  jugador: {
    nombre: string;
    equipo_id: string | null;
    user_id: string;
    clave_club: string;
    equipos?: {
      nombre: string;
      deportes: {
        nombre: string;
      };
    } | null;
  };
  equipo?: {
    nombre: string;
    deportes: {
      nombre: string;
    };
  } | null;
  posicion_movimientos: {
    nombre_movimiento: string;
    posiciones: {
      nombre: string;
    };
  };
  deportes: {
    nombre: string;
  };
}

interface AnalysisDetailsViewProps {
  analysisId: string;
  onBack: () => void;
  userName?: string;
  onLogout?: () => Promise<void>;
}

interface FormattedCharacteristic {
  name: string;
  analysis: string;
  score: number;
  time: string;
}

export function AnalysisDetailsView({ analysisId, onBack, userName, onLogout }: AnalysisDetailsViewProps) {
  const [analysis, setAnalysis] = useState<AnalysisDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [videoReady, setVideoReady] = useState(false);
  const { t } = useLanguage();

  useEffect(() => {
    loadAnalysisDetails();
  }, [analysisId]);

  const loadAnalysisDetails = async () => {
    try {
      const { data, error } = await supabase
        .from('analisis_videos')
        .select(`
          *,
          jugador:jugadores(
            nombre,
            equipo_id,
            user_id,
            clave_club,
            equipos(
              nombre,
              deportes(nombre)
            )
          ),
          equipo:equipos(
            nombre,
            deportes(nombre)
          ),
          posicion_movimientos(
            nombre_movimiento,
            posiciones!inner(nombre)
          ),
          deportes(
            nombre
          )
        `)
        .eq('id', analysisId)
        .single();

      if (error) {
        console.error('Error loading analysis details:', error);
        return;
      }

      // Obtener URL prefirmada para el video procesado
      const { data: signedUrlData, error: signedUrlError } = await supabase
        .storage
        .from('videos')
        .createSignedUrl(data.processed_video_path, 3600); // URL válida por 1 hora

      if (signedUrlError) {
        console.error('Error getting signed URL:', signedUrlError);
        return;
      }

      console.log('Analysis data loaded:', data);
      console.log('Processed video path:', data.processed_video_path);
      console.log('Signed URL:', signedUrlData.signedUrl);
      console.log('Raw video path:', data.url_video);
      
      // Actualizar el objeto data con la URL prefirmada
      data.processed_video_path = signedUrlData.signedUrl;
      
      setAnalysis(data);
    } catch (error) {
      console.error('Error loading analysis details:', error);
    }
    setLoading(false);
  };

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  // Helper function to format time from seconds to MM:SS format
  const formatTimeFromSeconds = (timeString: string): string => {
    const seconds = typeof timeString === 'string' ? parseFloat(timeString) : timeString;
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const getScoreFromResults = (resultados: any) => {
    if (!resultados) return 'N/A';
    
    console.log('Getting score from results:', resultados);
    
    // Si es string, intentar parsearlo
    if (typeof resultados === 'string') {
      try {
        const parsed = JSON.parse(resultados);
        if (parsed.overall_score) return `${parsed.overall_score}`;
        if (parsed.score) return `${parsed.score}`;
      } catch (e) {
        console.error('Error parsing results string:', e);
      }
    }
    
    // Si es objeto
    if (typeof resultados === 'object') {
      if (resultados.overall_score) return `${resultados.overall_score}`;
      if (resultados.score) return `${resultados.score}`;
    }
    
    return 'N/A';
  };

  const getFormattedResults = (resultados: any) => {
    if (!resultados) return null;
    
    console.log('Formatting results:', resultados);
    
    let parsedResults = resultados;
    
    // Si es string, intentar parsearlo
    if (typeof resultados === 'string') {
      try {
        parsedResults = JSON.parse(resultados);
      } catch (e) {
        console.error('Error parsing results:', e);
        return null;
      }
    }
    
    console.log('Parsed results:', parsedResults);
    
    // Inicializar secciones
    const sections = {
      positiveAspects: [] as FormattedCharacteristic[],
      areasForImprovement: [] as FormattedCharacteristic[],
      conclusion: '',
      finalNote: ''
    };

    // Si tiene la estructura de características
    if (parsedResults.characteristics && Array.isArray(parsedResults.characteristics)) {
      console.log('Processing characteristics:', parsedResults.characteristics);
      
      // Procesar todas las características
      const allCharacteristics: FormattedCharacteristic[] = parsedResults.characteristics.map((characteristic: any) => ({
        name: characteristic.name,
        analysis: characteristic.feedback || characteristic.analysis || '',
        score: characteristic.score || 0,
        time: characteristic.time || '0:00'
      }));

      // Ordenar por puntuación de mayor a menor
      allCharacteristics.sort((a, b) => b.score - a.score);

      // Las 3 mejores son aspectos positivos
      sections.positiveAspects = allCharacteristics.slice(0, 3);
      
      // Las 2 peores son áreas de mejora
      sections.areasForImprovement = allCharacteristics.slice(-2);
    }

    // Procesar conclusión
    if (parsedResults.conclusion) {
      sections.conclusion = parsedResults.conclusion;
    }

    // Procesar puntuación final
    if (parsedResults.overall_score) {
      sections.finalNote = `${parsedResults.overall_score}/10`;
    }

    console.log('Final sections:', sections);
    return sections;
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

  if (!analysis) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-accent/5 flex flex-col">
        <div className="flex-1 flex items-center justify-center">
          <Card>
            <CardContent className="p-8 text-center">
              <h3 className="text-lg font-semibold mb-2">{t('error')}</h3>
              <p className="text-muted-foreground mb-4">
                No se pudo cargar el análisis
              </p>
              <Button onClick={onBack}>
                {t('back')}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const formattedResults = getFormattedResults(analysis.resultados_analisis);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-accent/5 flex flex-col">
      <div className="flex-1 max-w-6xl mx-auto py-8 px-4">
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Video Section */}
          <Card className="glass-card">
            <CardHeader>
              <CardTitle>
                <div>
                  <span>Video analizado de {analysis.jugador.nombre}- </span>
                  <span className="text-sm text-muted-foreground">{analysis.posicion_movimientos.nombre_movimiento}</span>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="aspect-video bg-black rounded-lg overflow-hidden mb-4 relative">
                {!videoReady && (
                  <div className="absolute inset-0 flex items-center justify-center bg-gray-800 text-white">
                    <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
                    <p className="ml-2">Cargando video...</p>
                  </div>
                )}
                <video
                  src={analysis.processed_video_path}
                  controls
                  className={`w-full h-full object-cover ${!videoReady ? 'invisible' : ''}`}
                  crossOrigin="anonymous"
                  autoPlay
                  muted
                  preload="auto"
                  onError={(e) => {
                    const videoElement = e.target as HTMLVideoElement;
                    console.error('Error loading video:', e);
                    console.log('Video source:', videoElement.src);
                    console.log('Video error code:', videoElement.error?.code);
                    console.log('Video error message:', videoElement.error?.message);
                    setVideoReady(true);
                  }}
                  onLoadedData={() => {
                    console.log('Video loaded successfully (onLoadedData)');
                    setVideoReady(true);
                  }}
                  onLoadedMetadata={(e) => {
                    console.log('Video metadata loaded (onLoadedMetadata)');
                    const videoElement = e.target as HTMLVideoElement;
                    videoElement.play().then(() => {
                      videoElement.pause();
                      videoElement.currentTime = 0;
                    }).catch(error => {
                      console.error('Error during play/pause in onLoadedMetadata:', error);
                    });
                  }}
                >
                  Tu navegador no soporta la reproducción de video.
                </video>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center">
                    <Clock className="h-4 w-4 mr-1" />
                    {analysis.duracion_segundos ? formatDuration(analysis.duracion_segundos) : 'N/A'}
                  </div>
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 mr-1" />
                    {new Date(analysis.fecha_analisis).toLocaleDateString()}
                  </div>
                </div>
                <Button
                  onClick={async () => {
                    try {
                      console.log('Starting video download from:', analysis.processed_video_path);
                      
                      // Verificar si la URL es válida antes de intentar la descarga
                      try {
                        const url = new URL(analysis.processed_video_path);
                        console.log('Video URL is valid:', url.toString());
                      } catch (e) {
                        console.error('Invalid video URL:', analysis.processed_video_path);
                        throw new Error('Invalid video URL');
                      }
                      
                      const response = await fetch(analysis.processed_video_path);
                      console.log('Fetch response status:', response.status);
                      console.log('Fetch response headers:', Object.fromEntries(response.headers.entries()));
                      
                      if (!response.ok) {
                        throw new Error(`HTTP error! status: ${response.status}`);
                      }
                      
                      const blob = await response.blob();
                      console.log('Blob size:', blob.size);
                      console.log('Blob type:', blob.type);
                      
                      if (blob.size === 0) {
                        throw new Error('Downloaded file is empty');
                      }
                      
                      const url = window.URL.createObjectURL(blob);
                      const link = document.createElement('a');
                      link.href = url;
                      link.download = `analisis-${analysis.titulo}.mp4`;
                      document.body.appendChild(link);
                      link.click();
                      document.body.removeChild(link);
                      window.URL.revokeObjectURL(url);
                    } catch (error) {
                      console.error('Error downloading video:', error);
                      alert('Error al descargar el video. Por favor, inténtelo de nuevo.');
                    }
                  }}
                  variant="outline"
                  size="sm"
                >
                  Descargar video
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Player Info */}
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="flex items-center">
                <User className="h-5 w-5 mr-2" />
                Información del Jugador
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="font-medium">Jugador:</span>
                  <span>{analysis.jugador.nombre}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Deporte:</span>
                  <span>{analysis.deportes?.nombre || analysis.jugador.equipos?.deportes?.nombre || 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Equipo:</span>
                  <span>{analysis.equipo?.nombre || 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Posición:</span>
                  <span>{analysis.posicion_movimientos.posiciones.nombre}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Movimiento:</span>
                  <span>{analysis.posicion_movimientos.nombre_movimiento}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Detailed Results */}
        <div className="mt-8 space-y-6">
          {formattedResults && (formattedResults.positiveAspects.length > 0 || formattedResults.areasForImprovement.length > 0 || formattedResults.conclusion || formattedResults.finalNote) ? (
            <>
              {/* Aspectos Positivos */}
              {formattedResults.positiveAspects.length > 0 && (
                <Card className="glass-card">
                  <CardHeader>
                    <CardTitle className="flex items-center text-green-700">
                      ✓ Aspectos Positivos
                    </CardTitle>
                    <CardDescription>Las mejores puntuaciones del análisis</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {formattedResults.positiveAspects.map((aspect, index) => (
                      <div key={index} className="bg-green-50 border border-green-200 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-semibold text-green-900">{aspect.name}</h4>
                          <div className="flex items-center space-x-2">
                            <span className="text-sm text-green-600">Tiempo: {formatTimeFromSeconds(aspect.time)}</span>
                            <Badge variant="default" className="bg-green-500 hover:bg-green-600">
                              {aspect.score}/10
                            </Badge>
                          </div>
                        </div>
                        <p className="text-sm text-green-800 leading-relaxed">{aspect.analysis}</p>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              )}

              {/* Áreas de Mejora */}
              {formattedResults.areasForImprovement.length > 0 && (
                <Card className="glass-card">
                  <CardHeader>
                    <CardTitle className="flex items-center text-red-700">
                      ↗ Áreas de Mejora
                    </CardTitle>
                    <CardDescription>Aspectos a trabajar para mejorar el rendimiento</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {formattedResults.areasForImprovement.map((area, index) => (
                      <div key={index} className="bg-red-50 border border-red-200 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-semibold text-red-900">{area.name}</h4>
                          <div className="flex items-center space-x-2">
                            <span className="text-sm text-red-600">Tiempo: {formatTimeFromSeconds(area.time)}</span>
                            <Badge variant="destructive">
                              {area.score}/10
                            </Badge>
                          </div>
                        </div>
                        <p className="text-sm text-red-800 leading-relaxed">{area.analysis}</p>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              )}

              {/* Conclusión General */}
              {formattedResults.conclusion && (
                <Card className="glass-card">
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <FileText className="h-5 w-5 mr-2" />
                      Conclusión General
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <p className="text-sm text-blue-800 leading-relaxed">{formattedResults.conclusion}</p>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Puntuación General */}
              {formattedResults.finalNote && (
                <Card className="glass-card">
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Trophy className="h-5 w-5 mr-2" />
                      Puntuación General
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="text-center">
                    {(() => {
                      const scoreStr = formattedResults.finalNote || '';
                      const match = scoreStr.match(/([\d.]+)/);
                      const score = match ? parseFloat(match[1]) : null;
                      let color = 'text-gray-500';
                      if (score !== null) {
                        color = score >= 7 ? 'text-green-600' : score >= 4 ? 'text-yellow-600' : 'text-red-600';
                      }
                      return (
                        <div className={`text-6xl font-bold mb-2 ${color}`}>
                          {scoreStr}
                        </div>
                      );
                    })()}
                    <p className="text-sm text-gray-600">Evaluación técnica completa</p>
                  </CardContent>
                </Card>
              )}

              {/* Botón de descarga del análisis */}
              <div className="flex justify-end mt-4">
                <Button
                  onClick={() => {
                    try {
                      // Crear el contenido del archivo de texto
                      const analysisText = [
                        `ANÁLISIS DE VIDEO`,
                        `=================`,
                        ``,
                        `Título: ${analysis.titulo}`,
                        `Fecha: ${new Date(analysis.fecha_analisis).toLocaleDateString()}`,
                        ``,
                        `INFORMACIÓN DEL JUGADOR`,
                        `----------------------`,
                        `Jugador: ${analysis.jugador.nombre}`,
                        `Deporte: ${analysis.deportes?.nombre || analysis.jugador.equipos?.deportes?.nombre || 'N/A'}`,
                        `Equipo: ${analysis.jugador.equipos?.nombre || 'N/A'}`,
                        `Posición: ${analysis.posicion_movimientos.posiciones.nombre}`,
                        `Movimiento: ${analysis.posicion_movimientos.nombre_movimiento}`,
                        ``,
                        `ASPECTOS POSITIVOS`,
                        `-----------------`,
                        ...(formattedResults?.positiveAspects || []).map(aspect => 
                          `- ${aspect.name} (${aspect.score}/10)\n  ${aspect.analysis}`
                        ),
                        ``,
                        `ÁREAS DE MEJORA`,
                        `---------------`,
                        ...(formattedResults?.areasForImprovement || []).map(area => 
                          `- ${area.name} (${area.score}/10)\n  ${area.analysis}`
                        ),
                        ``,
                        `CONCLUSIÓN`,
                        `----------`,
                        formattedResults?.conclusion || 'No disponible',
                        ``,
                        `PUNTUACIÓN FINAL`,
                        `----------------`,
                        formattedResults?.finalNote || 'No disponible',
                        ``,
                        `COMENTARIOS ADICIONALES`,
                        `----------------------`,
                        analysis.comentarios || 'No hay comentarios adicionales'
                      ].join('\n');

                      const blob = new Blob([analysisText], { type: 'text/plain;charset=utf-8' });
                      const url = URL.createObjectURL(blob);
                      const link = document.createElement('a');
                      link.href = url;
                      link.download = `analisis-${analysis.titulo}.txt`;
                      document.body.appendChild(link);
                      link.click();
                      document.body.removeChild(link);
                      URL.revokeObjectURL(url);
                    } catch (error) {
                      console.error('Error downloading analysis:', error);
                      alert('Error al descargar el análisis. Por favor, inténtelo de nuevo.');
                    }
                  }}
                  variant="outline"
                >
                  Descargar análisis
                </Button>
              </div>
            </>
          ) : (
            <Card className="glass-card">
              <CardHeader>
                <CardTitle>Resultados Detallados del Análisis</CardTitle>
                <CardDescription>
                  Análisis completo del rendimiento del jugador
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="bg-muted p-4 rounded-lg">
                  <h4 className="font-semibold mb-2">Análisis Raw (JSON)</h4>
                  <pre className="text-xs whitespace-pre-wrap overflow-auto max-h-96">
                    {typeof analysis.resultados_analisis === 'string' 
                      ? analysis.resultados_analisis 
                      : JSON.stringify(analysis.resultados_analisis, null, 2)}
                  </pre>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Comments */}
        {analysis.comentarios && (
          <Card className="glass-card mt-6">
            <CardHeader>
              <CardTitle>Comentarios</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm leading-relaxed">{analysis.comentarios}</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
