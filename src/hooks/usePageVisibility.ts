import { useEffect, useState } from 'react';

/**
 * Hook para manejar la visibilidad de la página
 * Detecta cuando el usuario cambia de pestaña o minimiza la ventana
 */
export function usePageVisibility() {
  const [isVisible, setIsVisible] = useState(!document.hidden);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    const handleVisibilityChange = () => {
      const visible = !document.hidden;
      setIsVisible(visible);
      
      // Solo marcar como inicializado después del primer cambio de visibilidad
      if (!isInitialized) {
        setIsInitialized(true);
      }
    };

    // Escuchar cambios de visibilidad
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    // También escuchar eventos de foco/desenfoque de la ventana
    const handleFocus = () => setIsVisible(true);
    const handleBlur = () => setIsVisible(false);
    
    window.addEventListener('focus', handleFocus);
    window.addEventListener('blur', handleBlur);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleFocus);
      window.removeEventListener('blur', handleBlur);
    };
  }, [isInitialized]);

  return { isVisible, isInitialized };
}
