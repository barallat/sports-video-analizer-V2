import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Play, Pause, Trophy, FileText, CheckCircle, AlertTriangle } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { AppHeader } from '@/components/AppHeader';
import { AppFooter } from '@/components/AppFooter';
import { PageHeader } from '@/components/PageHeader';
import { supabase } from '@/integrations/supabase/client';

interface AnalysisResultViewProps {
  analysisResult: {
    text: string;
    score: number | null;
    analyzedAspectsForAnnotations: Array<{
      name: string;
      time: string;
      score: number;
      summary: string;
      type: 'positive' | 'improvement';
    }>;
  };
  videoFile: File;
  athleteName: string;
  onBack: () => void;
  userName?: string;
  onLogout?: () => Promise<void>;
  analysisId?: string;
}

interface VideoAnnotation {
  time: number;
  text: string;
  name?: string;
  type: 'positive' | 'improvement';
  score: number;
}

export function AnalysisResultView({ 
  analysisResult, 
  videoFile, 
  athleteName, 
  onBack, 
  userName, 
  onLogout,
  analysisId 
}: AnalysisResultViewProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [videoUrl, setVideoUrl] = useState<string>('');
  const [videoError, setVideoError] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const { t } = useLanguage();

  // LOG: Initial analysis result
  console.log('🚀 AnalysisResultView INITIALIZED with analysisResult:', analysisResult);
  console.log('📊 Raw analyzedAspectsForAnnotations:', analysisResult.analyzedAspectsForAnnotations);

  // Convert analysis results to annotation format
  const annotations: VideoAnnotation[] = analysisResult.analyzedAspectsForAnnotations.map((aspect, index) => {
    console.log(`🔄 Processing aspect ${index}:`, aspect);
    
    const type: 'positive' | 'improvement' = aspect.score >= 6 ? 'positive' : 'improvement';
    const timeInSeconds = parseTimeToSeconds(aspect.time);
    
    console.log(`⏱️ Time conversion for "${aspect.time}" = ${timeInSeconds}s`);
    console.log(`📈 Score ${aspect.score} -> type: ${type}`);
    
    const annotation = {
      time: timeInSeconds,
      text: aspect.summary,
      name: aspect.name,
      type,
      score: aspect.score
    };
    
    console.log(`✅ Created annotation:`, annotation);
    return annotation;
  });

  console.log('🎯 FINAL ANNOTATIONS ARRAY:', annotations);
  console.log('📏 Total annotations count:', annotations.length);

  // Sort annotations by time and handle overlapping times
  const sortedAnnotations = annotations.sort((a, b) => {
    if (a.time === b.time) {
      // If same time, show positives first
      return a.type === 'positive' && b.type === 'improvement' ? -1 : 1;
    }
    return a.time - b.time;
  });

  console.log('🔄 SORTED ANNOTATIONS:', sortedAnnotations);

  useEffect(() => {
    const loadVideoFromStorage = async () => {
      if (analysisId) {
        try {
          console.log('🔍 Loading video for analysis ID:', analysisId);
          
          const { data: analysisData, error } = await supabase
            .from('analisis_videos')
            .select('raw_video_path')
            .eq('id', analysisId)
            .single();

          if (error || !analysisData?.raw_video_path) {
            console.error('Error loading analysis data:', error);
            const url = URL.createObjectURL(videoFile);
            setVideoUrl(url);
            console.log('🔄 Using local video file as fallback');
            return;
          }

          console.log('📁 Using raw_video_path:', analysisData.raw_video_path);

          const { data: signedUrlData, error: signedUrlError } = await supabase.storage
            .from('videos')
            .createSignedUrl(analysisData.raw_video_path, 3600);

          if (signedUrlError) {
            console.error('❌ Error creating signed URL:', signedUrlError);
            const url = URL.createObjectURL(videoFile);
            setVideoUrl(url);
            console.log('🔄 Using local video file as fallback due to signed URL error');
          } else {
            setVideoUrl(signedUrlData.signedUrl);
            console.log('✅ Signed video URL set:', signedUrlData.signedUrl);
          }
        } catch (error) {
          console.error('Error loading video from storage:', error);
          const url = URL.createObjectURL(videoFile);
          setVideoUrl(url);
          console.log('🔄 Using local video file as fallback due to catch error');
        }
      } else {
        console.log('No analysisId provided, using local video file');
        const url = URL.createObjectURL(videoFile);
        setVideoUrl(url);
      }
    };

    loadVideoFromStorage();

    return () => {
      if (videoUrl && videoUrl.startsWith('blob:')) {
        console.log('Cleaning up local video URL');
        URL.revokeObjectURL(videoUrl);
      }
    };
  }, [videoFile, analysisId]);

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

  const formatTimeFromSeconds = (timeInSeconds: string | number): string => {
    const seconds = typeof timeInSeconds === 'string' ? parseFloat(timeInSeconds) : timeInSeconds;
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  // Helper function to format time for display in annotations list
  const formatAnnotationTime = (timeString: string): string => {
    const seconds = parseTimeToSeconds(timeString);
    return formatTime(seconds);
  };

  // Get current annotations to display with better overlap handling
  const getCurrentAnnotations = () => {
    const tolerance = 0.8; // Show annotation for 0.8 seconds
    
    console.log(`🕐 Getting current annotations for time: ${currentTime}s`);
    console.log(`📋 Available annotations:`, sortedAnnotations.map(a => ({ name: a.name, time: a.time, type: a.type })));
    
    const currentAnnotations = sortedAnnotations.filter(annotation => {
      const isActive = currentTime >= annotation.time && currentTime <= annotation.time + tolerance;
      console.log(`🎯 Annotation "${annotation.name}" at ${annotation.time}s: ${isActive ? 'ACTIVE' : 'inactive'} (current: ${currentTime}s, range: ${annotation.time}s - ${annotation.time + tolerance}s)`);
      return isActive;
    });
    
    console.log(`✅ ACTIVE ANNOTATIONS:`, currentAnnotations);
    
    // If multiple annotations at the same time, stagger them
    const staggeredAnnotations = currentAnnotations.map((annotation, index) => ({
      ...annotation,
      displayIndex: index
    }));
    
    console.log(`🎨 STAGGERED ANNOTATIONS:`, staggeredAnnotations);
    return staggeredAnnotations;
  };

  const currentAnnotations = getCurrentAnnotations();
  console.log('📺 CURRENT DISPLAYED ANNOTATIONS:', currentAnnotations);

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      const current = videoRef.current.currentTime;
      // Only log when time changes significantly to avoid spam
      if (Math.abs(current - currentTime) > 0.1) {
        console.log(`⏰ Video time updated: ${current}s (was ${currentTime}s)`);
      }
      setCurrentTime(current);
    }
  };

  const handleLoadedMetadata = () => {
    console.log('📹 Video metadata loaded');
    if (videoRef.current) {
      setDuration(videoRef.current.duration);
      setVideoError(false);
      console.log(`📏 Video duration: ${videoRef.current.duration}s`);
      console.log('🎬 Video is ready for annotations');
    }
  };

  const handleVideoError = (e: any) => {
    console.error('❌ Video error:', e);
    console.error('❌ Video error details:', e.target?.error);
    console.error('❌ Video URL that failed:', videoUrl);
    setVideoError(true);
  };

  const handleCanPlay = () => {
    console.log('▶️ Video can play - ready for annotations');
    setVideoError(false);
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

  const getTimelineMarkers = () => {
    return sortedAnnotations.map((annotation, index) => {
      const position = duration > 0 ? (annotation.time / duration) * 100 : 0;
      
      return {
        ...annotation,
        position,
        index
      };
    });
  };

  console.log('🎥 Rendering video with URL:', videoUrl);
  console.log('🏷️ About to render with currentAnnotations:', currentAnnotations);

  return (
    <div className="space-y-6">
      <div className="max-w-7xl mx-auto">
        <PageHeader
          title={`Análisis de ${athleteName}`}
          description="Resultados del análisis con Gemini AI"
          onBack={onBack}
        />

        <div className="grid gap-8">
          {/* Video con anotaciones */}
          <div className="space-y-6">
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Play className="h-5 w-5 mr-2" />
                  Video Analizado
                </CardTitle>
                <CardDescription>
                  Video con anotaciones de análisis técnico en tiempo real
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="relative">
                  {videoError ? (
                    <div className="w-full aspect-video rounded-lg bg-gray-200 flex items-center justify-center">
                      <p className="text-gray-500">Error al cargar el video</p>
                    </div>
                  ) : (
                    <video
                      ref={videoRef}
                      src={videoUrl}
                      className="w-full aspect-video rounded-lg bg-black"
                      onTimeUpdate={handleTimeUpdate}
                      onLoadedMetadata={handleLoadedMetadata}
                      onError={handleVideoError}
                      onCanPlay={handleCanPlay}
                      onPlay={() => setIsPlaying(true)}
                      onPause={() => setIsPlaying(false)}
                      controls
                      preload="metadata"
                      playsInline
                      onLoadStart={() => console.log('🎬 Video loading started')}
                      onLoadedData={() => console.log('✅ Video loaded successfully')}
                      onCanPlayThrough={() => console.log('▶️ Video can start playing')}
                    >
                      Tu navegador no soporta la reproducción de video.
                    </video>
                  )}
                  
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

            {/* Lista de anotaciones */}
            <Card className="glass-card">
              <CardHeader>
                <CardTitle>Puntos de Análisis</CardTitle>
                <CardDescription>
                  Haz clic en cualquier punto para saltar a ese momento del video
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {sortedAnnotations.map((annotation, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 border rounded-lg cursor-pointer hover:bg-muted/50 transition-colors"
                    onClick={() => jumpToAnnotation(annotation)}
                  >
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <div className="flex-shrink-0">
                          {annotation.type === 'positive' ? (
                            <CheckCircle className="h-4 w-4 text-green-600" />
                          ) : (
                            <AlertTriangle className="h-4 w-4 text-orange-600" />
                          )}
                        </div>
                        <Badge 
                          variant={annotation.type === 'positive' ? 'default' : 'destructive'} 
                          className="text-xs"
                        >
                          {annotation.type === 'positive' ? 'Positivo' : 'Mejora'}
                        </Badge>
                        <span className="text-sm font-medium font-mono">
                          {formatTime(annotation.time)}
                        </span>
                      </div>
                      <h4 className="font-semibold text-sm">{annotation.name}</h4>
                      <p className="text-xs text-muted-foreground">{annotation.text}</p>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-bold">{annotation.score}/10</div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Análisis completo */}
          <div className="space-y-6">
            {/* Puntuación general */}
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Trophy className="h-5 w-5 mr-2" />
                  Puntuación General
                </CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <div className="text-6xl font-bold text-primary mb-2">
                  {analysisResult.score || 'N/A'}
                  {analysisResult.score && '/10'}
                </div>
                <p className="text-muted-foreground">Evaluación técnica completa</p>
              </CardContent>
            </Card>

            {/* Análisis detallado */}
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <FileText className="h-5 w-5 mr-2" />
                  Análisis Detallado
                </CardTitle>
                <CardDescription>
                  Informe completo del análisis técnico
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="prose prose-sm max-w-none">
                  <div className="whitespace-pre-wrap text-sm leading-relaxed">
                    {analysisResult.text}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
