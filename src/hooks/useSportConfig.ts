import { SportConfig } from '@/config/sport-config';
import { multiSportConfig } from '@/config/sports/multi-sport';
import { basketballConfig } from '@/config/sports/basketball';
import { tennisConfig } from '@/config/sports/tennis';
import { footballConfig } from '@/config/sports/football';
import { volleyballConfig } from '@/config/sports/volleyball';
import { trackFieldConfig } from '@/config/sports/track-field';

// Configuración activa (se puede cambiar por variable de entorno)
const ACTIVE_SPORT = import.meta.env.VITE_SPORT_CONFIG || 'multi';

const sportConfigs: Record<string, SportConfig> = {
  multi: multiSportConfig,
  basketball: basketballConfig,
  tennis: tennisConfig,
  football: footballConfig,
  volleyball: volleyballConfig,
  'track-field': trackFieldConfig,
  // Añadir más deportes aquí según sea necesario
};

export function useSportConfig(): SportConfig {
  const config = sportConfigs[ACTIVE_SPORT];
  
  if (!config) {
    console.error(`Sport configuration not found for: ${ACTIVE_SPORT}`);
    console.error('Available configurations:', Object.keys(sportConfigs));
    console.error('Falling back to multi-sport configuration');
    return multiSportConfig;
  }
  
  return config;
}

// Hook adicional para obtener información específica del deporte
export function useSportInfo() {
  const config = useSportConfig();
  
  return {
    isMultiSport: config.sportId === 'multi',
    sportName: config.sportName,
    sportDisplayName: config.sportDisplayName,
    appName: config.appName,
    appDescription: config.appDescription,
    theme: config.theme,
    features: config.features,
    database: config.database,
    navigation: config.navigation
  };
} 