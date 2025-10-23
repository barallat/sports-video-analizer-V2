export interface SportConfig {
  // Identificación del deporte
  sportId: string;
  sportName: string;
  sportDisplayName: string;
  
  // Configuración de la aplicación
  appName: string;
  appDescription: string;
  appFooterDescription?: string;
  
  // Tema visual básico
  theme: {
    primaryColor: string;
    accentColor: string;
    gradient: string;
    logo?: string;
    backgroundColor?: string;
  };
  
  // Configuración de funcionalidades
  features: {
    showSportsSelection: boolean;
    showSportsManagement: boolean;
    showSportFieldInAnalysis: boolean;
    skipSportsConfig: boolean;
    showSportsInDashboard: boolean;
  };
  
  // Configuración de la base de datos
  database: {
    sportFilter: string; // ID del deporte en la BD o 'all' para multideporte
  };
  
  // Configuración de navegación
  navigation: {
    defaultSection: string;
    skipToTeams: boolean;
  };
} 