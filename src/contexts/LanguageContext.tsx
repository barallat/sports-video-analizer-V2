
import { createContext, useContext, useState, ReactNode } from 'react';

type Language = 'es' | 'en';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const translations = {
  es: {
    // Navigation and general
    dashboard: 'Panel de Control',
    sports: 'Deportes',
    teams: 'Equipos',
    players: 'Jugadores',
    analysis: 'Análisis',
    results: 'Resultados',
    statistics: 'Estadísticas',
    configuration: 'Configuración',
    back: 'Volver',
    loading: 'Cargando...',
    save: 'Guardar',
    cancel: 'Cancelar',
    edit: 'Editar',
    delete: 'Eliminar',
    add: 'Añadir',
    create: 'Crear',
    update: 'Actualizar',
    
    // Auth and user
    welcome: 'Bienvenido',
    logout: 'Cerrar sesión',
    login: 'Iniciar Sesión',
    
    // Sports related
    sport: 'Deporte',
    selectSports: 'Seleccionar Deportes',
    sportsConfiguration: 'Configuración de Deportes',
    manageSports: 'Gestionar Deportes',
    
    // Teams
    team: 'Equipo',
    teamName: 'Nombre del Equipo',
    createTeam: 'Crear Equipo',
    editTeam: 'Editar Equipo',
    deleteTeam: 'Eliminar Equipo',
    noTeams: 'No hay equipos',
    newTeam: 'Nuevo Equipo',
    newTeamName: 'Nombre del nuevo equipo',
    createNewTeam: 'Crear Nuevo Equipo',
    updateTeam: 'Actualizar Equipo',
    teamCreated: 'Equipo creado',
    teamCreatedDescription: 'El equipo se ha creado correctamente',
    teamUpdated: 'Equipo actualizado',
    teamUpdatedDescription: 'El equipo se ha actualizado correctamente',
    teamDeleted: 'Equipo eliminado',
    teamDeletedDescription: 'El equipo se ha eliminado correctamente',
    couldNotSaveTeam: 'No se pudo guardar el equipo',
    couldNotDeleteTeam: 'No se pudo eliminar el equipo',
    administreTeams: 'Administrar equipos de',
    noTeamsForSport: 'No hay equipos para',
    createFirstTeam: 'Crea tu primer equipo de',
    toStart: 'para comenzar',
    managePlayersTeam: 'Gestionar jugadores del equipo',
    
    // Players
    player: 'Jugador',
    playerName: 'Nombre del Jugador',
    addPlayer: 'Añadir Jugador',
    editPlayer: 'Editar Jugador',
    createPlayer: 'Crear Jugador',
    deletePlayer: 'Eliminar Jugador',
    noPlayersIn: 'No hay jugadores en',
    newPlayer: 'Nuevo Jugador',
    playerCreated: 'Jugador creado',
    playerCreatedDescription: 'El jugador se ha creado correctamente',
    playerUpdated: 'Jugador actualizado',
    playerUpdatedDescription: 'El jugador se ha actualizado correctamente',
    playerDeleted: 'Jugador eliminado',
    playerDeletedDescription: 'El jugador se ha eliminado correctamente',
    couldNotSavePlayer: 'No se pudo guardar el jugador',
    couldNotDeletePlayer: 'No se pudo eliminar el jugador',
    managePlayers: 'Gestionar Jugadores',
    addFirstPlayer: 'Añade tu primer jugador para comenzar',
    noPositionAssigned: 'Sin posición asignada',
    
    // Player details
    birthDate: 'Fecha de Nacimiento',
    height: 'Altura (m)',
    weight: 'Peso (kg)',
    positions: 'Posiciones',
    
    // Analysis
    newAnalysis: 'Nuevo Análisis',
    analysisHistory: 'Historial de Análisis',
    
    // Results
    consultAndFilterResults: 'Consulta y filtra los resultados de análisis',
    filtersAndSearch: 'Filtros y Búsqueda',
    search: 'Buscar',
    searchByTitlePlayer: 'Buscar por título, jugador...',
    allSports: 'Todos los deportes',
    allTeams: 'Todos los equipos',
    sortBy: 'Ordenar por',
    dateMostRecent: 'Fecha (más reciente)',
    dateOldest: 'Fecha (más antigua)',
    playerAZ: 'Jugador (A-Z)',
    titleAZ: 'Título (A-Z)',
    score: 'Puntuación',
    view: 'Ver',
    noResultsFound: 'No se encontraron resultados',
    noAnalysisMatchingFilters: 'No hay análisis que coincidan con los filtros seleccionados',
    deleteAnalysisConfirm: '¿Estás seguro de que deseas eliminar este análisis?',
    analysisDeleted: 'Análisis eliminado',
    analysisDeletedDescription: 'El análisis se ha eliminado correctamente',
    couldNotDeleteAnalysis: 'No se pudo eliminar el análisis',
    
    // Errors and validation
    error: 'Error',
    required: 'Requerido',
    fieldRequired: 'Este campo es requerido',
    
    // Actions
    viewPlayers: 'Ver Jugadores',
    manageTeams: 'Gestionar Equipos',
    
    // Language
    language: 'Idioma',
    spanish: 'Español',
    english: 'English',
    
    // Footer
    footerDescription: 'Plataforma de análisis deportivo para mejorar el rendimiento de atletas y equipos.',
    contact: 'Contacto',
    email: 'Email',
    phone: 'Teléfono',
    links: 'Enlaces',
    privacyPolicy: 'Política de Privacidad',
    termsOfService: 'Términos de Servicio',
    support: 'Soporte',
    allRightsReserved: 'Todos los derechos reservados.',
    
    // Select Sport
    selectSport: 'Selecciona un Deporte',
    selectSportDescription: 'Elige el deporte para gestionar sus equipos',
    noSportsConfigured: 'No tienes deportes configurados',
    goToConfigurationToSelectSports: 'Ve a la configuración para seleccionar tus deportes',
    goToConfiguration: 'Ir a Configuración',
    manageTeamsDescription: 'Administra los equipos de este deporte',
    createNewTeamFor: 'Crear nuevo equipo para',
  },
  en: {
    // Navigation and general
    dashboard: 'Dashboard',
    sports: 'Sports',
    teams: 'Teams',
    players: 'Players',
    analysis: 'Analysis',
    results: 'Results',
    statistics: 'Statistics',
    configuration: 'Configuration',
    back: 'Back',
    loading: 'Loading...',
    save: 'Save',
    cancel: 'Cancel',
    edit: 'Edit',
    delete: 'Delete',
    add: 'Add',
    create: 'Create',
    update: 'Update',
    
    // Auth and user
    welcome: 'Welcome',
    logout: 'Logout',
    login: 'Login',
    
    // Sports related
    sport: 'Sport',
    selectSports: 'Select Sports',
    sportsConfiguration: 'Sports Configuration',
    manageSports: 'Manage Sports',
    
    // Teams
    team: 'Team',
    teamName: 'Team Name',
    createTeam: 'Create Team',
    editTeam: 'Edit Team',
    deleteTeam: 'Delete Team',
    noTeams: 'No teams',
    newTeam: 'New Team',
    newTeamName: 'New team name',
    createNewTeam: 'Create New Team',
    updateTeam: 'Update Team',
    teamCreated: 'Team created',
    teamCreatedDescription: 'Team has been created successfully',
    teamUpdated: 'Team updated',
    teamUpdatedDescription: 'Team has been updated successfully',
    teamDeleted: 'Team deleted',
    teamDeletedDescription: 'Team has been deleted successfully',
    couldNotSaveTeam: 'Could not save team',
    couldNotDeleteTeam: 'Could not delete team',
    administreTeams: 'Manage teams for',
    noTeamsForSport: 'No teams for',
    createFirstTeam: 'Create your first team for',
    toStart: 'to get started',
    managePlayersTeam: 'Manage team players',
    
    // Players
    player: 'Player',
    playerName: 'Player Name',
    addPlayer: 'Add Player',
    editPlayer: 'Edit Player',
    createPlayer: 'Create Player',
    deletePlayer: 'Delete Player',
    noPlayersIn: 'No players in',
    newPlayer: 'New Player',
    playerCreated: 'Player created',
    playerCreatedDescription: 'Player has been created successfully',
    playerUpdated: 'Player updated',
    playerUpdatedDescription: 'Player has been updated successfully',
    playerDeleted: 'Player deleted',
    playerDeletedDescription: 'Player has been deleted successfully',
    couldNotSavePlayer: 'Could not save player',
    couldNotDeletePlayer: 'Could not delete player',
    managePlayers: 'Manage Players',
    addFirstPlayer: 'Add your first player to get started',
    noPositionAssigned: 'No position assigned',
    
    // Player details
    birthDate: 'Birth Date',
    height: 'Height (m)',
    weight: 'Weight (kg)',
    positions: 'Positions',
    
    // Analysis
    newAnalysis: 'New Analysis',
    analysisHistory: 'Analysis History',
    
    // Results
    consultAndFilterResults: 'Consult and filter analysis results',
    filtersAndSearch: 'Filters and Search',
    search: 'Search',
    searchByTitlePlayer: 'Search by title, player...',
    allSports: 'All sports',
    allTeams: 'All teams',
    sortBy: 'Sort by',
    dateMostRecent: 'Date (most recent)',
    dateOldest: 'Date (oldest)',
    playerAZ: 'Player (A-Z)',
    titleAZ: 'Title (A-Z)',
    score: 'Score',
    view: 'View',
    noResultsFound: 'No results found',
    noAnalysisMatchingFilters: 'No analysis matching the selected filters',
    deleteAnalysisConfirm: 'Are you sure you want to delete this analysis?',
    analysisDeleted: 'Analysis deleted',
    analysisDeletedDescription: 'Analysis has been deleted successfully',
    couldNotDeleteAnalysis: 'Could not delete analysis',
    
    // Errors and validation
    error: 'Error',
    required: 'Required',
    fieldRequired: 'This field is required',
    
    // Actions
    viewPlayers: 'View Players',
    manageTeams: 'Manage Teams',
    
    // Language
    language: 'Language',
    spanish: 'Español',
    english: 'English',
    
    // Footer
    footerDescription: 'Sports analysis platform to improve athlete and team performance.',
    contact: 'Contact',
    email: 'Email',
    phone: 'Phone',
    links: 'Links',
    privacyPolicy: 'Privacy Policy',
    termsOfService: 'Terms of Service',
    support: 'Support',
    allRightsReserved: 'All rights reserved.',
    
    // Select Sport
    selectSport: 'Select a Sport',
    selectSportDescription: 'Choose the sport to manage its teams',
    noSportsConfigured: 'You have no sports configured',
    goToConfigurationToSelectSports: 'Go to configuration to select sports',
    goToConfiguration: 'Go to Configuration',
    manageTeamsDescription: 'Manage the teams for this sport',
    createNewTeamFor: 'Create new team for',
  }
};

interface LanguageProviderProps {
  children: ReactNode;
}

export function LanguageProvider({ children }: LanguageProviderProps) {
  const [language, setLanguage] = useState<Language>('es');

  const t = (key: string): string => {
    return translations[language][key as keyof typeof translations['es']] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
