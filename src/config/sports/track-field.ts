import { SportConfig } from '../sport-config';

export const trackFieldConfig: SportConfig = {
  sportId: 'track-field',
  sportName: 'Atletismo',
  sportDisplayName: 'Track & Field',
  appName: 'Track & Field Sportlytix',
  appDescription: 'Gestión profesional de equipos de atletismo con IA',
  appFooterDescription: 'Plataforma de análisis deportivo para mejorar el rendimiento de atletas.',
  
  theme: {
    primaryColor: '#8b5cf6', // Púrpura atletismo
    accentColor: '#06b6d4', // Cian
    gradient: 'from-purple-500 via-purple-600 to-cyan-500',
    logo: '/logos/track-field-logo.svg',
    backgroundColor: 'from-purple-50 via-purple-100/20 to-cyan-50/20'
  },
  
  features: {
    showSportsSelection: false,     // ❌ Deshabilitado - no hay selección de deportes
    showSportsManagement: false,    // ❌ Deshabilitado - no hay gestión de deportes
    showSportFieldInAnalysis: false, // ❌ Deshabilitado - no muestra campo deporte
    skipSportsConfig: true,         // ✅ Habilitado - salta configuración inicial
    showSportsInDashboard: false    // ❌ Deshabilitado - no muestra deportes en dashboard
  },
  
  database: {
    sportFilter: '8b7f00a3-4320-42cb-91c1-cbb892c15dad' // ID real de Atletismo en BD
  },
  
  navigation: {
    defaultSection: 'dashboard',
    skipToTeams: true
  }
}; 