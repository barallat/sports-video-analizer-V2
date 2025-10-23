import { SportConfig } from '../sport-config';

export const multiSportConfig: SportConfig = {
  sportId: 'multi',
  sportName: 'Multi-Deporte',
  sportDisplayName: 'Sports',
  appName: 'Sportlytix',
  appDescription: 'Gestión integral de equipos deportivos con IA',
  appFooterDescription: 'Plataforma de análisis deportivo para mejorar el rendimiento de atletas y equipos.',
  
  theme: {
    primaryColor: '#3b82f6', // Azul genérico
    accentColor: '#10b981', // Verde genérico
    gradient: 'from-blue-500 via-blue-600 to-green-500',
    logo: '/logos/sports-logo.svg',
    backgroundColor: 'from-background via-primary/5 to-accent/5'
  },
  
  features: {
    showSportsSelection: true,      // ✅ Habilitado - muestra selección de deportes
    showSportsManagement: true,     // ✅ Habilitado - muestra gestión de deportes
    showSportFieldInAnalysis: true, // ✅ Habilitado - muestra campo deporte en análisis
    skipSportsConfig: false,        // ❌ Deshabilitado - no salta configuración inicial
    showSportsInDashboard: true     // ✅ Habilitado - muestra deportes en dashboard
  },
  
  database: {
    sportFilter: 'all' // 'all' significa no filtrar, mostrar todos los deportes
  },
  
  navigation: {
    defaultSection: 'dashboard',
    skipToTeams: false
  }
}; 