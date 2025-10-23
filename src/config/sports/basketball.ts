import { SportConfig } from '../sport-config';

export const basketballConfig: SportConfig = {
  sportId: 'basketball',
  sportName: 'Baloncesto',
  sportDisplayName: 'Basketball',
  appName: 'Basketball Sportlytix',
  appDescription: 'Gestión profesional de equipos de baloncesto con IA',
  appFooterDescription: 'Plataforma de análisis deportivo para mejorar el rendimiento de baloncestistas.',
  
  theme: {
    primaryColor: '#ff6b35', // Naranja NBA
    accentColor: '#1e3a8a', // Azul NBA
    gradient: 'from-orange-500 via-orange-600 to-blue-800',
    logo: '/logos/basketball-logo.svg',
    backgroundColor: 'from-orange-50 via-orange-100/20 to-blue-50/20'
  },
  
  features: {
    showSportsSelection: false,     // ❌ Deshabilitado - no hay selección de deportes
    showSportsManagement: false,    // ❌ Deshabilitado - no hay gestión de deportes
    showSportFieldInAnalysis: false, // ❌ Deshabilitado - no muestra campo deporte
    skipSportsConfig: true,         // ✅ Habilitado - salta configuración inicial
    showSportsInDashboard: false    // ❌ Deshabilitado - no muestra deportes en dashboard
  },
  
  database: {
    sportFilter: '0ebdd1a6-39b4-4ab8-81c7-60fba999f589' // ID real de Baloncesto en BD
  },
  
  navigation: {
    defaultSection: 'dashboard',
    skipToTeams: true
  }
}; 