import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Download, CheckCircle, AlertCircle, TrendingUp, FileText, Trophy, Play, Pause, AlertTriangle } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { supabase } from '@/integrations/supabase/client';

interface AnalysisResultsViewProps {
  analysisId: string;
  onBack: () => void;
  userName?: string;
  onLogout?: () => Promise<void>;
}

interface AnalysisData {
  titulo: string;
  url_video: string;
  raw_video_path: string;
  processed_video_path: string | null;
  resultados_analisis: {
    characteristics: Array<{
      name: string;
      time: string;
      score: number;
      feedback: string;
      summary: string;
    }>;
    overall_score: number;
    conclusion: string;
  } | null;
  jugador?: {
    nombre: string;
  };
  posicion_movimientos?: {
    nombre_movimiento: string;
  };
}

interface VideoAnnotation {
  time: number;
  text: string;
  name?: string;
  type: 'positive' | 'improvement';
  score: number;
}

export function AnalysisResultsView({ analysisId, onBack, userName, onLogout }: AnalysisResultsViewProps) {
  const [analysisData, setAnalysisData] = useState<AnalysisData | null>(null);
  const [loading, setLoading] = useState(true);
  const [processingVideo, setProcessingVideo] = useState(false);
  const [videoUrl, setVideoUrl] = useState<string>('');
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const videoRef = useRef<HTMLVideoElement>(null);
  const { toast } = useToast();
  const { t } = useLanguage();

  useEffect(() => {
    loadAnalysisData();
  }, [analysisId]);

  // Polling para verificar el estado del procesamiento del video
  useEffect(() => {
    let pollInterval: NodeJS.Timeout;

    const checkVideoProcessing = async () => {
      if (!analysisId || !processingVideo) return;

      try {
        const { data, error } = await supabase
          .from('analisis_videos')
          .select('processed_video_path')
          .eq('id', analysisId)
          .single();

        if (error) throw error;

        if (data.processed_video_path) {
          setProcessingVideo(false);
          setAnalysisData(prev => prev ? { ...prev, processed_video_path: data.processed_video_path } : null);
        }
      } catch (error) {
        console.error('Error checking video processing:', error);
      }
    };

    if (processingVideo) {
      pollInterval = setInterval(checkVideoProcessing, 5000);
    }

    return () => {
      if (pollInterval) clearInterval(pollInterval);
    };
  }, [analysisId, processingVideo]);

  const loadAnalysisData = async () => {
    try {
      console.log('🔍 Loading analysis data for ID:', analysisId);
      
      const { data, error } = await supabase
        .from('analisis_videos')
        .select(`
          titulo,
          url_video,
          raw_video_path,
          processed_video_path,
          resultados_analisis,
          jugador:jugadores(nombre),
          posicion_movimientos(nombre_movimiento)
        `)
        .eq('id', analysisId)
        .single();

      console.log('📊 Database query result:', { data, error });

      if (error) {
        console.error('❌ Error loading analysis:', error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "No se pudo cargar el análisis"
        });
      } else {
        // Parse the JSON data properly
        const parsedData = {
          ...data,
          resultados_analisis: data.resultados_analisis as AnalysisData['resultados_analisis']
        };
        console.log('✅ Parsed analysis data:', parsedData);
        setAnalysisData(parsedData);

        // Iniciar procesamiento del video si no está procesado
        if (data.raw_video_path && !data.processed_video_path) {
          // Convertir los resultados del análisis a anotaciones
          const videoAnnotations = parsedData.resultados_analisis?.characteristics?.map(aspect => {
            const timeInSeconds = parseTimeToSeconds(aspect.time);
            const sortedCharacteristics = [...(parsedData.resultados_analisis?.characteristics || [])].sort((a, b) => b.score - a.score);
            const aspectIndex = sortedCharacteristics.findIndex(char => char.name === aspect.name);
            const type: 'positive' | 'improvement' = aspectIndex < 3 ? 'positive' : 'improvement';
            
            return {
              time: timeInSeconds,
              text: aspect.summary,
              name: aspect.name,
              type,
              score: aspect.score
            };
          }) || [];

          console.log('🎯 Annotations for video processing:', videoAnnotations);
          startVideoProcessing(data.raw_video_path, videoAnnotations);
        }

        // Get signed URL for private bucket access
        if (data.raw_video_path) {
          console.log('📁 Using raw_video_path:', data.raw_video_path);
          
          // Create a signed URL that expires in 1 hour for authenticated access
          const { data: signedUrlData, error: signedUrlError } = await supabase.storage
            .from('videos')
            .createSignedUrl(data.raw_video_path, 3600); // 1 hour expiry

          if (signedUrlError) {
            console.error('❌ Error creating signed URL:', signedUrlError);
            // Fallback to url_video if available
            if (data.url_video) {
              console.log('🔄 Using fallback url_video:', data.url_video);
              setVideoUrl(data.url_video);
            }
          } else {
            setVideoUrl(signedUrlData.signedUrl);
            console.log('✅ Signed video URL set:', signedUrlData.signedUrl);
          }
          
        } else if (data.url_video) {
          console.log('🔄 Using fallback url_video:', data.url_video);
          setVideoUrl(data.url_video);
        } else {
          console.log('⚠️ No video URL found in database');
        }
      }
    } catch (error) {
      console.error('❌ Error loading analysis:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Error al cargar los datos del análisis"
      });
    }
    setLoading(false);
  };

  const startVideoProcessing = async (rawVideoPath: string, videoAnnotations: VideoAnnotation[]) => {
    try {
      setProcessingVideo(true);
      console.log('🎬 Starting video processing with annotations:', videoAnnotations);

      // Obtener una URL firmada para el video original
      const { data: signedUrlData, error: signedUrlError } = await supabase.storage
        .from('videos')
        .createSignedUrl(rawVideoPath, 3600); // 1 hora de validez

      if (signedUrlError) {
        console.error('❌ Error getting signed URL:', signedUrlError);
        // Continuar sin la URL firmada, el backend intentará usar la ruta directa
      }

      // Llamar al microservicio
      const response = await fetch(`${import.meta.env.VITE_MICROSERVICE_URL}/process`, {
        method: 'POST',
        body: JSON.stringify({
          analysis_id: analysisId,
          raw_video_path: rawVideoPath,
          raw_video_url: signedUrlData?.signedUrl, // URL firmada opcional
          annotations: videoAnnotations,
          table_name: 'analisis_videos', // Añadir esta línea
        }),
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error processing video');
      }

      const responseData = await response.json();
      console.log('✅ Video processing started:', responseData);

      // Actualizar la base de datos con la ruta del video procesado
      const { error: updateError } = await supabase
        .from('analisis_videos')
        .update({
          processed_video_path: responseData.processed_video_path,
          raw_video_path: null // Eliminar la ruta del video original
        })
        .eq('id', analysisId);

      if (updateError) {
        throw updateError;
      }

      // Eliminar el video original del storage
      const { error: deleteError } = await supabase.storage
        .from('videos')
        .remove([rawVideoPath]);

      if (deleteError) {
        console.error('Warning: Could not delete original video:', deleteError);
      }

      // Mostrar notificación de éxito
      toast({
        title: "Éxito",
        description: "Video procesado con éxito",
        variant: "default",
      });

    } catch (error) {
      console.error('❌ Error in video processing:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Error al procesar el video"
      });
      setProcessingVideo(false);
    }
  };

  // Convert analysis results to annotation format with proper categorization
  const annotations: VideoAnnotation[] = analysisData?.resultados_analisis?.characteristics?.map((aspect, index) => {
    console.log(`🔄 Processing aspect ${index}:`, aspect);
    
    // Fix: Properly categorize based on score - top 3 scores are positive, bottom 2 are improvement
    const sortedCharacteristics = [...(analysisData?.resultados_analisis?.characteristics || [])].sort((a, b) => b.score - a.score);
    const aspectIndex = sortedCharacteristics.findIndex(char => char.name === aspect.name);
    const type: 'positive' | 'improvement' = aspectIndex < 3 ? 'positive' : 'improvement';
    
    const timeInSeconds = parseTimeToSeconds(aspect.time);
    
    console.log(`⏱️ Time conversion for "${aspect.time}" = ${timeInSeconds}s`);
    console.log(`📈 Score ${aspect.score} -> type: ${type} (rank: ${aspectIndex + 1})`);
    
    const annotation = {
      time: timeInSeconds,
      text: aspect.summary,
      name: aspect.name,
      type,
      score: aspect.score
    };
    
    console.log(`✅ Created annotation:`, annotation);
    return annotation;
  }) || [];

  console.log('🎯 FINAL ANNOTATIONS ARRAY:', annotations);

  // Sort annotations by time
  const sortedAnnotations = annotations.sort((a, b) => {
    if (a.time === b.time) {
      return a.type === 'positive' && b.type === 'improvement' ? -1 : 1;
    }
    return a.time - b.time;
  });

  function parseTimeToSeconds(timeString: string): number {
    console.log('🔢 Parsing time string:', timeString, 'Type:', typeof timeString);
    
    if (!timeString) {
      console.warn('⚠️ Empty time string provided');
      return 0;
    }
    
    // If it's already a number
    if (!isNaN(Number(timeString))) {
      const seconds = Number(timeString);
      console.log(`✅ Direct number conversion: ${timeString} -> ${seconds}s`);
      return seconds;
    }
    
    // If it's in MM:SS format
    const parts = timeString.split(':');
    if (parts.length === 2) {
      const minutes = parseInt(parts[0]);
      const seconds = parseInt(parts[1]);
      const totalSeconds = minutes * 60 + seconds;
      console.log(`✅ MM:SS conversion: ${timeString} -> ${totalSeconds}s`);
      return totalSeconds;
    }
    
    // Fallback
    const fallback = Number(timeString) || 0;
    console.warn(`⚠️ Fallback conversion: ${timeString} -> ${fallback}s`);
    return fallback;
  }

  // Helper function to format time for display in characteristics
  const formatCharacteristicTime = (timeString: string): string => {
    const seconds = parseTimeToSeconds(timeString);
    return formatTime(seconds);
  };

  // Get current annotations to display
  const getCurrentAnnotations = () => {
    const tolerance = 0.8; // Show annotation for 0.8 seconds
    
    console.log(`🕐 Getting current annotations for time: ${currentTime}s`);
    
    const currentAnnotations = sortedAnnotations.filter(annotation => {
      const isActive = currentTime >= annotation.time && currentTime <= annotation.time + tolerance;
      console.log(`🎯 Annotation "${annotation.name}" at ${annotation.time}s: ${isActive ? 'ACTIVE' : 'inactive'}`);
      return isActive;
    });
    
    console.log(`✅ ACTIVE ANNOTATIONS:`, currentAnnotations);
    
    return currentAnnotations.map((annotation, index) => ({
      ...annotation,
      displayIndex: index
    }));
  };

  const currentAnnotations = getCurrentAnnotations();

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      const current = videoRef.current.currentTime;
      if (Math.abs(current - currentTime) > 0.1) {
        console.log(`⏰ Video time updated: ${current}s`);
      }
      setCurrentTime(current);
    }
  };

  const handleLoadedMetadata = () => {
    console.log('📹 Video metadata loaded');
    if (videoRef.current) {
      setDuration(videoRef.current.duration);
      console.log(`📏 Video duration: ${videoRef.current.duration}s`);
    }
  };

  const togglePlayPause = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
        console.log('⏸️ Video paused');
      } else {
        videoRef.current.play().catch(e => {
          console.error('❌ Error playing video:', e);
        });
        console.log('▶️ Video playing');
      }
      setIsPlaying(!isPlaying);
    }
  };

  const jumpToAnnotation = (annotation: VideoAnnotation) => {
    if (videoRef.current) {
      videoRef.current.currentTime = annotation.time;
      console.log(`🎯 Jumping to annotation "${annotation.name}" at time ${annotation.time}s`);
    }
  };

  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const handleDownloadVideo = async () => {
    console.log('📥 Attempting to download video');
    if (analysisData?.processed_video_path) {
      try {
        // Create a signed URL for download
        const { data: signedUrlData, error } = await supabase.storage
          .from('videos')
          .createSignedUrl(analysisData.processed_video_path, 60); // 1 minute for download

        if (error) {
          console.error('❌ Error creating download URL:', error);
          toast({
            variant: "destructive",
            title: "Error",
            description: "No se pudo generar el enlace de descarga"
          });
          return;
        }

        // Descargar el archivo usando fetch
        const response = await fetch(signedUrlData.signedUrl);
        const blob = await response.blob();
        
        // Crear un enlace de descarga
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${analysisData?.titulo || 'video'}.mp4`;
        document.body.appendChild(link);
        link.click();
        
        // Limpiar
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
        
        console.log('✅ Download initiated');
      } catch (error) {
        console.error('❌ Error downloading video:', error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Error al descargar el video"
        });
      }
    } else {
      console.log('❌ No processed video available for download');
      toast({
        variant: "destructive",
        title: "Error",
        description: "No hay video procesado disponible para descargar"
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-accent/5 flex flex-col">
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center space-y-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="text-muted-foreground">Cargando análisis...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!analysisData || !analysisData.resultados_analisis) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-accent/5 flex flex-col">
        <div className="flex-1 flex items-center justify-center">
          <Card className="glass-card max-w-md">
            <CardContent className="p-6 text-center">
              <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Análisis no encontrado</h3>
              <p className="text-muted-foreground mb-4">No se pudo cargar la información del análisis.</p>
              <Button onClick={onBack}>Volver</Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const characteristics = analysisData.resultados_analisis?.characteristics || [];
  const overallScore = analysisData.resultados_analisis?.overall_score || 0;

  // Sort characteristics by score (highest to lowest)
  const sortedCharacteristics = [...characteristics].sort((a, b) => b.score - a.score);
  
  // Get top 3 as positive aspects and bottom 2 as improvement areas
  const aspectosPositivos = sortedCharacteristics.slice(0, 3);
  const areasMejora = sortedCharacteristics.slice(-2);

  console.log('🎥 Rendering video with URL:', videoUrl);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-accent/5 flex flex-col">
      <div className="flex-1 max-w-6xl mx-auto py-8 px-4">
        <div className="grid gap-8">
          {/* Video Card with Annotations - NO TEXT BLOCK */}
          <div className="space-y-6">
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div>
                    <span>Video analizado de {analysisData.jugador?.nombre || 'Atleta'}- </span>
                    <span className="text-sm text-muted-foreground">{analysisData.posicion_movimientos?.nombre_movimiento || 'Movimiento'}</span>
                  </div>
                  <Button
                    onClick={handleDownloadVideo}
                    variant="outline"
                    size="sm"
                    className="flex items-center space-x-2"
                    disabled={!analysisData?.processed_video_path || processingVideo}
                  >
                    {processingVideo ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary mr-2"></div>
                        <span>Procesando video...</span>
                      </>
                    ) : (
                      <>
                        <Download className="h-4 w-4" />
                        <span>Descargar</span>
                      </>
                    )}
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="relative">
                  <div className="aspect-video w-full">
                    {videoUrl ? (
                      <video 
                        ref={videoRef}
                        controls 
                        className="w-full h-full rounded-lg border"
                        src={videoUrl}
                        onTimeUpdate={handleTimeUpdate}
                        onLoadedMetadata={handleLoadedMetadata}
                        onError={(e) => {
                          console.error('❌ Video load error:', e);
                          console.error('Video URL that failed:', videoUrl);
                        }}
                        onLoadStart={() => console.log('🎬 Video loading started')}
                        onLoadedData={() => console.log('✅ Video loaded successfully')}
                        onCanPlay={() => console.log('▶️ Video can start playing')}
                        onPlay={() => setIsPlaying(true)}
                        onPause={() => setIsPlaying(false)}
                        preload="metadata"
                      >
                        Tu navegador no soporta la reproducción de videos.
                      </video>
                    ) : (
                      <div className="w-full h-full rounded-lg border bg-gray-100 flex items-center justify-center">
                        <p className="text-gray-500">No hay video disponible</p>
                      </div>
                    )}
                  </div>
                  
                  {/* DEBUG: Show annotation count */}
                  <div className="absolute top-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                    Annotations: {currentAnnotations.length}/{sortedAnnotations.length}
                  </div>
                  
                  {/* Anotaciones superpuestas */}
                  {currentAnnotations.length > 0 && (
                    <div className="absolute top-4 left-4 right-4">
                      {currentAnnotations.map((annotation, index) => {
                        console.log(`🎨 Rendering annotation ${index}:`, annotation);
                        return (
                          <div
                            key={`${annotation.time}-${annotation.type}-${index}`}
                            className={`p-3 rounded-lg border transition-all duration-300 mb-2 ${
                              annotation.type === 'positive'
                                ? 'bg-green-500/20 border-green-400/30 text-green-100'
                                : 'bg-orange-500/20 border-orange-400/30 text-orange-100'
                            }`}
                            style={{
                              transform: `translateY(${annotation.displayIndex * 5}px)`,
                              animationDelay: `${index * 0.1}s`,
                              zIndex: 10
                            }}
                          >
                            <div className="font-semibold text-sm mb-1 flex items-center">
                              {annotation.type === 'positive' ? (
                                <><span className="text-green-400 mr-1">✓</span>Aspecto Positivo</>
                              ) : (
                                <><span className="text-orange-400 mr-1">⚠</span>Área de Mejora</>
                              )}
                              <span className="text-xs opacity-75 ml-2">
                                {Math.floor(annotation.time / 60)}:{(annotation.time % 60).toFixed(0).padStart(2, '0')}
                              </span>
                            </div>
                            
                            <div className="text-sm leading-relaxed">
                              {annotation.name && (
                                <span className="font-bold mr-1">{annotation.name}:</span>
                              )}
                              {annotation.text}
                            </div>
                            <div className="mt-1">
                              <span className="text-xs font-medium">
                                Puntuación: {annotation.score}/10
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* Custom Play/Pause Button */}
                  <div className="absolute bottom-16 left-4">
                    <Button
                      onClick={togglePlayPause}
                      variant="outline"
                      size="sm"
                      className="bg-black/50 text-white border-white/30 hover:bg-black/70"
                    >
                      {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                    </Button>
                  </div>

                  {/* Time indicator */}
                  <div className="absolute bottom-4 right-4">
                    <div className="bg-black/50 text-white font-semibold px-2 py-1 rounded text-sm">
                      {Math.floor(currentTime / 60)}:{(currentTime % 60).toFixed(0).padStart(2, '0')} / {Math.floor(duration / 60)}:{(duration % 60).toFixed(0).padStart(2, '0')}
                    </div>
                  </div>
                  
                  {/* Annotation indicators on timeline */}
                  {sortedAnnotations.length > 0 && duration > 0 && (
                    <div className="absolute bottom-12 left-4 right-4 h-1 bg-white/20 rounded">
                      {sortedAnnotations.map((annotation, index) => (
                        <div
                          key={`timeline-${annotation.time}-${index}`}
                          className={`absolute w-3 h-3 -top-1 rounded-full cursor-pointer ${
                            annotation.type === 'positive' ? 'bg-green-400' : 'bg-orange-400'
                          }`}
                          style={{
                            left: `${(annotation.time / duration) * 100}%`
                          }}
                          title={`${annotation.type === 'positive' ? 'Aspecto Positivo' : 'Área de Mejora'} - ${Math.floor(annotation.time / 60)}:${(annotation.time % 60).toFixed(0).padStart(2, '0')}`}
                          onClick={() => jumpToAnnotation(annotation)}
                        />
                      ))}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* REMOVED: Lista de anotaciones text block - this was the unnecessary block */}
          </div>

          {/* Analysis results */}
          <div className="space-y-6">
            {/* Positive aspects */}
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="flex items-center text-green-700">
                  <CheckCircle className="h-5 w-5 mr-2" />
                  Aspectos Positivos
                </CardTitle>
                <CardDescription>
                  Las mejores puntuaciones del análisis
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {aspectosPositivos.map((characteristic, index) => (
                  <div key={index} className="border rounded-lg p-4 border-green-200 bg-green-50">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium">{characteristic.name}</h4>
                      <span className="px-2 py-1 rounded text-sm font-medium bg-green-100 text-green-800">
                        {characteristic.score}/10
                      </span>
                    </div>
                    {characteristic.time && (
                      <p className="text-xs text-green-600 mb-2">Tiempo: {formatCharacteristicTime(characteristic.time)}</p>
                    )}
                    <p className="text-sm text-muted-foreground">{characteristic.feedback}</p>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Improvement areas */}
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="flex items-center text-orange-700">
                  <TrendingUp className="h-5 w-5 mr-2" />
                  Áreas de Mejora
                </CardTitle>
                <CardDescription>
                  Aspectos a trabajar para mejorar el rendimiento
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {areasMejora.map((characteristic, index) => (
                  <div key={index} className="border rounded-lg p-4 border-orange-200 bg-orange-50">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium">{characteristic.name}</h4>
                      <span className="px-2 py-1 rounded text-sm font-medium bg-orange-100 text-orange-800">
                        {characteristic.score}/10
                      </span>
                    </div>
                    {characteristic.time && (
                      <p className="text-xs text-orange-600 mb-2">Tiempo: {formatCharacteristicTime(characteristic.time)}</p>
                    )}
                    <p className="text-sm text-muted-foreground">{characteristic.feedback}</p>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Conclusion */}
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <FileText className="h-5 w-5 mr-2" />
                  Conclusión General
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="prose prose-sm max-w-none">
                  <div className="whitespace-pre-wrap text-sm leading-relaxed">
                    {analysisData.resultados_analisis?.conclusion || 'Análisis completado exitosamente.'}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Overall score */}
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Trophy className="h-5 w-5 mr-2" />
                  Puntuación General
                </CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                {(() => {
                  let color = 'text-gray-500';
                  if (typeof overallScore === 'number' && !isNaN(overallScore)) {
                    color = overallScore >= 7 ? 'text-green-600' : overallScore >= 4 ? 'text-yellow-600' : 'text-red-600';
                  }
                  return (
                    <div className={`text-6xl font-bold mb-2 ${color}`}>
                      {overallScore.toFixed(1)}<span className="text-2xl">/10</span>
                    </div>
                  );
                })()}
                <p className="text-muted-foreground">Evaluación técnica completa</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
