import { SportConfig } from '../sport-config';

export const volleyballConfig: SportConfig = {
  sportId: 'volleyball',
  sportName: 'Voleibol',
  sportDisplayName: 'Volleyball',
  appName: 'Volleyball Sportlytix',
  appDescription: 'Gestión profesional de equipos de voleibol con IA',
  appFooterDescription: 'Plataforma de análisis deportivo para mejorar el rendimiento de voleibolistas.',
  
  theme: {
    primaryColor: '#3b82f6', // Azul voleibol
    accentColor: '#f59e0b', // Naranja
    gradient: 'from-blue-500 via-blue-600 to-orange-500',
    logo: '/logos/volleyball-logo.svg',
    backgroundColor: 'from-blue-50 via-blue-100/20 to-orange-50/20'
  },
  
  features: {
    showSportsSelection: false,     // ❌ Deshabilitado - no hay selección de deportes
    showSportsManagement: false,    // ❌ Deshabilitado - no hay gestión de deportes
    showSportFieldInAnalysis: false, // ❌ Deshabilitado - no muestra campo deporte
    skipSportsConfig: true,         // ✅ Habilitado - salta configuración inicial
    showSportsInDashboard: false    // ❌ Deshabilitado - no muestra deportes en dashboard
  },
  
  database: {
    sportFilter: '69739150-899c-457e-b73b-f35976677a89' // ID real de Voleibol en BD
  },
  
  navigation: {
    defaultSection: 'dashboard',
    skipToTeams: true
  }
}; 