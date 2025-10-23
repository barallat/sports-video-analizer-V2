import React, { createContext, useContext, ReactNode } from 'react';
import { SportConfig } from '@/config/sport-config';
import { useSportConfig } from '@/hooks/useSportConfig';

interface SportConfigContextType {
  config: SportConfig;
  isMultiSport: boolean;
  sportName: string;
  sportDisplayName: string;
  appName: string;
  appDescription: string;
  appFooterDescription: string;
  theme: SportConfig['theme'];
  features: SportConfig['features'];
  database: SportConfig['database'];
  navigation: SportConfig['navigation'];
}

export const SportConfigContext = React.createContext<SportConfigContextType & { getBackgroundImage: () => string }>({
  config: {} as SportConfig,
  isMultiSport: false,
  sportName: '',
  sportDisplayName: '',
  appName: '',
  appDescription: '',
  appFooterDescription: '',
  theme: {} as SportConfig['theme'],
  features: {} as SportConfig['features'],
  database: {} as SportConfig['database'],
  navigation: {} as SportConfig['navigation'],
  getBackgroundImage: () => '/bg-multi.jpg',
});

interface SportConfigProviderProps {
  children: ReactNode;
}

export function SportConfigProvider({ children }: SportConfigProviderProps) {
  const config = useSportConfig();
  
  const contextValue: SportConfigContextType = {
    config,
    isMultiSport: config.sportId === 'multi',
    sportName: config.sportName,
    sportDisplayName: config.sportDisplayName,
    appName: config.appName,
    appDescription: config.appDescription,
    appFooterDescription: config.appFooterDescription || '',
    theme: config.theme,
    features: config.features,
    database: config.database,
    navigation: config.navigation
  };

  const getBackgroundImage = () => {
    const envBg = import.meta.env.VITE_SPORT_BG;
    console.log('getBackgroundImage called. envBg:', envBg, 'sportId:', contextValue.config.sportId);
    if (envBg) {
      console.log('Returning from env:', `/${envBg}`);
      return `/${envBg}`;
    }
    switch (contextValue.config.sportId) {
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

  return (
    <SportConfigContext.Provider value={{ ...contextValue, getBackgroundImage }}>
      {children}
    </SportConfigContext.Provider>
  );
}

export function useSportConfigContext() {
  const context = useContext(SportConfigContext);
  
  if (context === undefined) {
    throw new Error('useSportConfigContext must be used within a SportConfigProvider');
  }
  
  return context;
} 