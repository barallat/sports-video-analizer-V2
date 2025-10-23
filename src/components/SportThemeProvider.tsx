import React, { useEffect } from 'react';
import { useSportConfigContext } from '@/contexts/SportConfigContext';

interface SportThemeProviderProps {
  children: React.ReactNode;
}

export function SportThemeProvider({ children }: SportThemeProviderProps) {
  const { theme, config } = useSportConfigContext();

  useEffect(() => {
    // Aplicar variables CSS personalizadas para el tema
    const root = document.documentElement;
    
    // Establecer colores del tema
    root.style.setProperty('--sport-primary', theme.primaryColor);
    root.style.setProperty('--sport-accent', theme.accentColor);
    
    // Aplicar gradiente de fondo si está definido
    if (theme.backgroundColor) {
      root.style.setProperty('--sport-background', theme.backgroundColor);
    }
    
    // Aplicar gradiente principal
    root.style.setProperty('--sport-gradient', theme.gradient);
    
    console.log('Sport theme applied:', {
      primary: theme.primaryColor,
      accent: theme.accentColor,
      gradient: theme.gradient,
      background: theme.backgroundColor
    });
  }, [theme]);

  // Añadir lógica para exponer la imagen de fondo según el deporte
  const getBackgroundImage = () => {
    switch (config.sportId) {
      case 'track-field':
        return '/bg-track-field.jpg';
      case 'football':
        return '/bg-football.jpg';
      case 'basketball':
        return '/bg-basketball.jpg';
      case 'tennis':
        return '/bg-tennis.jpg';
      case 'volleyball':
        return '/bg-volleyball.jpg';
      case 'multi':
      default:
        return '/bg-multi.jpg';
    }
  };

  // Devolver solo los children, sin el provider extra
  return <>{children}</>;
} 