import { SportConfig } from '../sport-config';

export const tennisConfig: SportConfig = {
  sportId: 'tennis',
  sportName: 'Tenis',
  sportDisplayName: 'Tennis',
  appName: 'Tennis Sportlytix',
  appDescription: 'Gestión profesional de equipos de tenis con IA',
  appFooterDescription: 'Plataforma de análisis deportivo para mejorar el rendimiento de tenistas.',
  
  theme: {
    primaryColor: '#22c55e', // Verde tenis
    accentColor: '#fbbf24', // Amarillo tenis
    gradient: 'from-green-500 via-green-600 to-yellow-400',
    logo: '/logos/tennis-logo.svg',
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
    sportFilter: 'cdeb64e7-67c8-490f-a20d-99364eea7a26' // ID real de Tenis en BD
  },
  
  navigation: {
    defaultSection: 'dashboard',
    skipToTeams: true
  }
}; 