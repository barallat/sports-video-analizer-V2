import { SportConfig } from '../sport-config';

export const footballConfig: SportConfig = {
  sportId: 'football',
  sportName: 'Fútbol',
  sportDisplayName: 'Football',
  appName: 'Football Sportlytix',
  appDescription: 'Gestión profesional de equipos de fútbol con IA',
  appFooterDescription: 'Plataforma de análisis deportivo para mejorar el rendimiento de futbolistas.',
  
  theme: {
    primaryColor: '#22c55e', // Verde fútbol
    accentColor: '#fbbf24', // Amarillo
    gradient: 'from-green-500 via-green-600 to-yellow-400',
    logo: '/logos/football-logo.svg',
    backgroundColor: 'from-green-50 via-green-100/20 to-yellow-50/20'
  },
  
  features: {
    showSportsSelection: false,     // ❌ Deshabilitado - no hay selección de deportes
    showSportsManagement: false,    // ❌ Deshabilitado - no hay gestión de deportes
    showSportFieldInAnalysis: false, // ❌ Deshabilitado - no muestra campo deporte
    skipSportsConfig: true,         // ✅ Habilitado - salta configuración inicial
    showSportsInDashboard: false    // ❌ Deshabilitado - no muestra deportes en dashboard
  },
  
  database: {
    sportFilter: 'f1286c83-04e7-4cf1-bf54-8f72e6fd7697' // ID real de Fútbol en BD
  },
  
  navigation: {
    defaultSection: 'dashboard',
    skipToTeams: true
  }
}; 