import { useState, useEffect } from 'react';
import { AuthenticatedLayout } from '@/components/layouts/AuthenticatedLayout';
import { Dashboard } from '@/components/Dashboard';
import { ConfigSection } from '@/components/ConfigSection';
import { SportsConfig } from '@/components/SportsConfig';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Loader2 } from 'lucide-react';
import { SportsSelectionView } from '@/components/SportsSelectionView';
import { SportTeamsView } from '@/components/SportTeamsView';
import { TeamPlayersView } from '@/components/TeamPlayersView';
import { TeamView } from '@/components/TeamView';
import { PlayerFormView } from '@/components/PlayerFormView';
import { TeamFormView } from '@/components/TeamFormView';
import { AthleteSelectionView } from '@/components/AthleteSelectionView';
import { NewAnalysisView } from '@/components/NewAnalysisView';
import { AnalysisResultsView } from '@/components/AnalysisResultsView';
import { ResultsView } from '@/components/ResultsView';
import { StatisticsView } from '@/components/StatisticsView';
import { AnalysisDetailsView } from '@/components/AnalysisDetailsView';
import { AthleteTeamsView } from '@/components/AthleteTeamsView';
import { AthleteTeamDetailView } from '@/components/AthleteTeamDetailView';
import { UserProfileView } from '@/components/UserProfileView';
import { useLanguage } from '@/contexts/LanguageContext';
import { SportsManagement } from '@/components/SportsManagement';
import { useSportConfigContext } from '@/contexts/SportConfigContext';
import { usePageVisibility } from '@/hooks/usePageVisibility';
import { LegalContent } from '@/pages/Legal';

const Index = () => {
  const { user, loading: authLoading, signOut } = useAuth();
  const { t } = useLanguage();
  const { features, database, navigation, sportDisplayName } = useSportConfigContext();
  const { isVisible, isInitialized } = usePageVisibility();
  const [currentSection, setCurrentSection] = useState(navigation.defaultSection);
  const [userHasSports, setUserHasSports] = useState(false);
  const [checkingUser, setCheckingUser] = useState(true);
  const [userName, setUserName] = useState('Usuario');
  const [userRole, setUserRole] = useState<string>('');
  const [isFirstLogin, setIsFirstLogin] = useState(false);
  const [hasExecutedInitialNavigation, setHasExecutedInitialNavigation] = useState(false);
  
  // Nuevos estados para la navegación por deportes y equipos
  const [selectedSport, setSelectedSport] = useState<any>(null);
  const [selectedTeam, setSelectedTeam] = useState<{ id: string; name: string; deporteId: string } | null>(null);
  const [editingPlayer, setEditingPlayer] = useState<string | undefined>(undefined);
  const [editingTeam, setEditingTeam] = useState<string | undefined>(undefined);
  const [selectedAnalysisId, setSelectedAnalysisId] = useState<string | undefined>(undefined);
  
  // Nuevos estados para deportistas
  const [selectedSportForAthletes, setSelectedSportForAthletes] = useState<any>(null);
  const [hasInitialized, setHasInitialized] = useState(false);
  
  // Estados para vista de equipos de deportistas
  const [selectedAthleteTeam, setSelectedAthleteTeam] = useState<{ id: string; name: string; deporteId: string; deporteName: string } | null>(null);

  useEffect(() => {
    if (user) {
      console.log('User logged in:', user.id);
      // Solo resetear estados en el login inicial, no en cada cambio de foco
      if (!hasInitialized) {
        setCurrentSection(navigation.defaultSection);
        setSelectedSport(null);
        setSelectedTeam(null);
        setEditingPlayer(undefined);
        setSelectedAnalysisId(undefined);
        setSelectedSportForAthletes(null);
        setHasInitialized(true);
      }
      checkUserSportsConfig();
      // Cargar datos del usuario de forma asíncrona
      loadUserData();
    } else {
      console.log('No user found');
      setCheckingUser(false);
      setHasInitialized(false);
      setHasExecutedInitialNavigation(false);
    }
  }, [user, navigation.defaultSection, hasInitialized]);

  // Función para cargar todos los datos del usuario
  const loadUserData = async () => {
    await getUserName();
  };

  // Efecto para manejar la navegación inicial basada en la configuración del deporte
  // Solo se ejecuta una vez cuando el usuario se loguea por primera vez
  // No se ejecuta cuando el usuario regresa de cambiar de pestaña
  useEffect(() => {
    if (user && userHasSports && !checkingUser && hasInitialized && isVisible && userRole && !hasExecutedInitialNavigation) {
      // Solo redirigir al dashboard si estamos en la sección por defecto (login inicial)
      // No redirigir si el usuario ya está en otra sección
      if (currentSection === navigation.defaultSection) {
        console.log('User logged in, ensuring navigation to dashboard. User role:', userRole);
        setHasExecutedInitialNavigation(true);
        
        // Si es un deportista, verificar si ya tiene datos de jugador
        if (userRole === 'athlete') {
          checkAthletePlayerData();
        } else if (userRole === 'coach') {
          // Para gestores, ir directamente al dashboard
          console.log('Manager logged in, going to dashboard');
          setCurrentSection('dashboard');
        } else {
          // Para otros roles, ir directamente al dashboard
          console.log('Other role, going to dashboard');
          setCurrentSection('dashboard');
        }
      }
    }
  }, [user, userHasSports, checkingUser, hasInitialized, isVisible, userRole, hasExecutedInitialNavigation, currentSection, navigation.defaultSection]);

  // Función para verificar si el deportista ya tiene datos de jugador
  const checkAthletePlayerData = async () => {
    if (!user) return;

    try {
      // Primero obtener el ID del usuario en la tabla usuarios
      const { data: userData, error: userError } = await supabase
        .from('usuarios')
        .select('id')
        .eq('auth_user_id', user.id)
        .single();

      if (userError || !userData) {
        console.error('Error fetching user data:', userError);
        setCurrentSection('dashboard');
        return;
      }

      // Ahora buscar si tiene datos de jugador
      const { data: playerData, error } = await supabase
        .from('jugadores')
        .select('id')
        .eq('user_id', userData.id)
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116 = no rows found
        console.error('Error checking player data:', error);
        setCurrentSection('dashboard');
        return;
      }

      if (!playerData) {
        // No tiene datos de jugador, redirigir a creación
        console.log('Athlete has no player data, redirecting to player form');
        setIsFirstLogin(true);
        
        // Cargar el deporte configurado para la vista de creación
        if (features.skipSportsConfig && database.sportFilter && database.sportFilter !== 'all') {
          const deporte = {
            id: database.sportFilter,
            nombre: sportDisplayName,
          };
          setSelectedSportForAthletes(deporte);
        }
        
        setCurrentSection('athlete-form');
      } else {
        // Ya tiene datos de jugador, ir al dashboard
        setCurrentSection('dashboard');
      }
    } catch (error) {
      console.error('Error in checkAthletePlayerData:', error);
      setCurrentSection('dashboard');
    }
  };

  const getUserName = async () => {
    if (!user) return;

    try {
      console.log('Fetching user data for auth_user_id:', user.id);
      const { data: userData, error } = await supabase
        .from('usuarios')
        .select('nombre, role, auth_user_id')
        .eq('auth_user_id', user.id)
        .single();

      if (error) {
        console.error('Error fetching user data:', error);
        return;
      }

      console.log('User data from database:', userData);

      if (userData?.nombre) {
        setUserName(userData.nombre);
      }
      
      if (userData?.role) {
        console.log('Setting user role to:', userData.role);
        setUserRole(userData.role);
      }
    } catch (error) {
      console.error('Error in getUserName:', error);
    }
  };

  const checkUserSportsConfig = async () => {
    if (!user) {
      console.log('No user to check sports config');
      setCheckingUser(false);
      return;
    }

    try {
      console.log('Checking user sports config for user:', user.id);
      
      // Si está configurado para saltarse la configuración de deportes, asumir que tiene deportes
      if (features.skipSportsConfig) {
        console.log('Skipping sports config check - feature disabled');
        setUserHasSports(true);
        setCheckingUser(false);
        return;
      }

      // Obtener el ID del usuario en la tabla usuarios
      const { data: userData, error: userError } = await supabase
        .from('usuarios')
        .select('id')
        .eq('auth_user_id', user.id)
        .single();

      if (userError || !userData) {
        console.error('Error fetching user data:', userError);
        setUserHasSports(false);
        setCheckingUser(false);
        return;
      }

      const { data: userSports, error } = await supabase
        .from('usuario_deportes')
        .select('id')
        .eq('usuario_id', userData.id)
        .limit(1);

      if (error) {
        console.error('Error checking user sports:', error);
        setUserHasSports(false);
      } else {
        const hasSports = userSports && userSports.length > 0;
        console.log('User has sports:', hasSports);
        setUserHasSports(hasSports);
      }
    } catch (error) {
      console.error('Error in checkUserSportsConfig:', error);
      setUserHasSports(false);
    } finally {
      setCheckingUser(false);
    }
  };

  const handleNavigate = async (section: string) => {
    console.log('Navigating to section:', section);
    
    // Lógica específica para equipos en modo de un solo deporte
    if (section === 'teams' && features.skipSportsConfig) {
      await loadConfiguredSport();
      setCurrentSection('sport-teams');
    } else if (section === 'teams') {
      setCurrentSection('teams');
    }
    // Lógica específica para deportistas
    else if (section === 'deportistas' && features.skipSportsConfig) {
      await loadConfiguredSportForAthletes();
      setCurrentSection('sport-athletes');
    } else if (section === 'deportistas') {
      setCurrentSection('athletes-selection');
    } else if (section === 'sport-teams' && features.skipSportsConfig && database.sportFilter !== 'all') {
      await loadConfiguredSport();
      setCurrentSection(section);
    } else if (section === 'sport-athletes' && features.skipSportsConfig && database.sportFilter !== 'all') {
      await loadConfiguredSportForAthletes();
      setCurrentSection(section);
    } else if (section === 'analysis') {
      // Limpiar estado de jugador cuando se accede a análisis desde dashboard
      setEditingPlayer(undefined);
      setCurrentSection(section);
    } else if (section === 'legal') {
      setCurrentSection(section);
    } else {
      setCurrentSection(section);
    }
  };

  const loadConfiguredSport = async () => {
    try {
      // Solo cargar deporte específico si no estamos en modo multideporte
      if (database.sportFilter !== 'all') {
        // Crear el objeto deporte desde la configuración en lugar de consultar la BD
        const deporte = {
          id: database.sportFilter,
          nombre: sportDisplayName,
          // Agregar otros campos necesarios si es requerido
        };
        setSelectedSport(deporte);
      }
    } catch (error) {
      console.error('Error loading configured sport:', error);
    }
  };

  const loadConfiguredSportForAthletes = async () => {
    try {
      // Solo cargar deporte específico si no estamos en modo multideporte
      if (database.sportFilter !== 'all') {
        // Crear el objeto deporte desde la configuración en lugar de consultar la BD
        const deporte = {
          id: database.sportFilter,
          nombre: sportDisplayName,
          // Agregar otros campos necesarios si es requerido
        };
        setSelectedSportForAthletes(deporte);
      }
    } catch (error) {
      console.error('Error loading configured sport for athletes:', error);
    }
  };

  const handleConfigNavigate = (section: string) => {
    console.log('Config navigation to:', section);
    if (section === 'sports-management') {
      setCurrentSection('sports-management');
    } else if (section === 'profile') {
      setCurrentSection('profile');
    } else {
      console.log('Config section not implemented yet:', section);
    }
  };

  const handleBack = () => {
    console.log('Going back to dashboard');
    setCurrentSection('dashboard');
  };

  const handleSportsConfigComplete = () => {
    console.log('Sports config completed');
    setUserHasSports(true);
    setCurrentSection('dashboard');
  };

  const handleLogout = async () => {
    try {
      console.log('Logging out user');
      await signOut();
    } catch (error) {
      console.error('Error during logout:', error);
    }
  };

  const handleSportSelect = (deporte: any) => {
    console.log('Sport selected:', deporte);
    setSelectedSport(deporte);
    setCurrentSection('sport-teams');
  };

  const handleTeamSelect = (teamId: string, teamName: string) => {
    console.log('Team selected:', teamId, teamName);
    if (!selectedSport) return;
    
    setSelectedTeam({ 
      id: teamId, 
      name: teamName, 
      deporteId: selectedSport.id 
    });
    setCurrentSection('team-players');
  };

  const handleBackFromSportTeams = () => {
    setSelectedSport(null);
    if (features.skipSportsConfig) {
      setCurrentSection('dashboard');
    } else {
      setCurrentSection('teams');
    }
  };

  const handleBackFromTeamPlayers = () => {
    setSelectedTeam(null);
    setCurrentSection('sport-teams');
  };

  const handleTeamForm = () => {
    setEditingTeam(undefined);
    setCurrentSection('team-form');
  };

  const handleBackFromTeamForm = () => {
    setEditingTeam(undefined);
    setCurrentSection('sport-teams');
  };

  const handleTeamSaved = () => {
    setEditingTeam(undefined);
    setCurrentSection('sport-teams');
  };

  const handleBackFromSportsSelection = () => {
    setCurrentSection('dashboard');
  };

  const handleBackFromNewAnalysis = () => {
    setCurrentSection('dashboard');
  };

  const handleBackFromResults = () => {
    setCurrentSection('dashboard');
  };

  const handleBackFromStats = () => {
    setCurrentSection('dashboard');
  };

  const handlePlayerForm = (playerId?: string) => {
    setEditingPlayer(playerId);
    setCurrentSection('player-form');
  };

  const handleBackFromPlayerForm = () => {
    setEditingPlayer(undefined);
    setCurrentSection('team-players');
  };

  const handlePlayerSaved = () => {
    setEditingPlayer(undefined);
    setCurrentSection('team-players');
  };

  const handleViewAnalysis = (analysisId: string) => {
    setSelectedAnalysisId(analysisId);
    setCurrentSection('analysis-details');
  };

  const handleBackFromAnalysisDetails = () => {
    setSelectedAnalysisId(undefined);
    setCurrentSection('results');
  };

  const handleBackFromSportsManagement = () => {
    setCurrentSection('dashboard');
  };

  const handleAnalysisComplete = (analysisId: string) => {
    setSelectedAnalysisId(analysisId);
    setCurrentSection('analysis-results');
  };

  const handleBackFromAnalysisResults = () => {
    setSelectedAnalysisId(undefined);
    setCurrentSection('dashboard');
  };

  const handleAnalyzePlayer = (playerId: string, deporteId: string) => {
    setEditingPlayer(playerId);
    setCurrentSection('analysis');
  };

  // Nuevos handlers para deportistas
  const handleSportSelectForAthletes = (deporte: any) => {
    console.log('Sport selected for athletes:', deporte);
    setSelectedSportForAthletes(deporte);
    setCurrentSection('sport-athletes');
  };

  const handleBackFromAthletesSelection = () => {
    setCurrentSection('dashboard');
  };

  const handleBackFromSportAthletes = () => {
    setSelectedSportForAthletes(null);
    if (features.skipSportsConfig) {
      setCurrentSection('dashboard');
    } else {
      setCurrentSection('athletes-selection');
    }
  };

  const handleAthleteForm = (playerId?: string) => {
    setEditingPlayer(playerId);
    setCurrentSection('athlete-form');
  };

  const handleBackFromAthleteForm = () => {
    setEditingPlayer(undefined);
    setCurrentSection('sport-athletes');
  };

  const handleAthleteSaved = () => {
    setEditingPlayer(undefined);
    if (isFirstLogin) {
      // Si es el primer login, redirigir al dashboard
      setIsFirstLogin(false);
      setCurrentSection('dashboard');
    } else {
      // Si no es el primer login, volver a la lista de deportistas
      setCurrentSection('sport-athletes');
    }
  };

  // Nuevos handlers para selección de deportistas
  const handleAthleteSelection = () => {
    setCurrentSection('athlete-selection');
  };

  const handleBackFromAthleteSelection = () => {
    setCurrentSection('team-players');
  };

  const handleAthletesSelected = (athleteIds: string[]) => {
    console.log('Athletes selected:', athleteIds);
    setCurrentSection('team-players');
  };

  // Función para manejar clic en equipo desde vista de deportistas
  const handleAthleteTeamClick = (teamId: string, teamName: string, deporteId: string) => {
    setSelectedAthleteTeam({
      id: teamId,
      name: teamName,
      deporteId: deporteId,
      deporteName: selectedSportForAthletes?.nombre || 'Deporte'
    });
    setCurrentSection('athlete-team-detail');
  };

  // Función para volver desde detalle de equipo de deportista
  const handleBackFromAthleteTeamDetail = () => {
    setSelectedAthleteTeam(null);
    setCurrentSection('athlete-teams');
  };

  if (authLoading || checkingUser) {
    console.log('Loading state - authLoading:', authLoading, 'checkingUser:', checkingUser);
    return (
      <AuthenticatedLayout>
        <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-accent/5 flex items-center justify-center">
          <div className="text-center space-y-4">
            <Loader2 className="h-8 w-8 animate-spin mx-auto" />
            <p className="text-muted-foreground">{t('loading')}</p>
          </div>
        </div>
      </AuthenticatedLayout>
    );
  }

  if (!user) {
    console.log('No user, redirecting to auth');
    return null; // El ProtectedRoute se encargará de redirigir
  }

  if (!userHasSports) {
    console.log('User has no sports, showing sports config');
    return (
      <AuthenticatedLayout>
        <SportsConfig onComplete={handleSportsConfigComplete} />
      </AuthenticatedLayout>
    );
  }

  console.log('Rendering section:', currentSection);

  const renderContent = () => {
    switch (currentSection) {
      case 'config':
        return <ConfigSection onBack={handleBack} onNavigate={handleConfigNavigate} userName={userName} onLogout={handleLogout} currentSection={currentSection} />;
      case 'profile':
        return (
          <UserProfileView 
            onBack={handleBack}
            userName={userName}
            onLogout={handleLogout}
          />
        );
      case 'sports-management':
        return (
          <SportsManagement 
            onBack={handleBackFromSportsManagement}
            userName={userName}
            onLogout={handleLogout}
          />
        );
      case 'teams':
        return (
          <SportsSelectionView 
            onBack={handleBackFromSportsSelection} 
            onSportSelect={handleSportSelect}
            userName={userName}
            onLogout={handleLogout}
          />
        );
      case 'sports-selection':
        return (
          <SportsSelectionView 
            onBack={handleBackFromSportsSelection} 
            onSportSelect={handleSportSelect}
            userName={userName}
            onLogout={handleLogout}
          />
        );
      case 'sport-teams':
        return selectedSport ? (
          <SportTeamsView 
            deporte={selectedSport} 
            onBack={handleBackFromSportTeams}
            onTeamSelect={handleTeamSelect}
            onTeamForm={handleTeamForm}
            userName={userName}
            onLogout={handleLogout}
          />
        ) : null;
      case 'team-form':
        return selectedSport ? (
          <TeamFormView
            deporteId={selectedSport.id}
            deporteName={selectedSport.nombre}
            onBack={handleBackFromTeamForm}
            onSaved={handleTeamSaved}
            teamId={editingTeam}
          />
        ) : null;
      case 'team-players':
        return selectedTeam ? (
          <TeamView 
            teamId={selectedTeam.id}
            teamName={selectedTeam.name}
            deporteId={selectedTeam.deporteId}
            deporteName={selectedSport?.nombre}
            onBack={handleBackFromTeamPlayers}
            onPlayerForm={handlePlayerForm}
            onAthleteSelection={handleAthleteSelection}
            userName={userName}
            onLogout={handleLogout}
          />
        ) : null;
      case 'player-form':
        return selectedTeam ? (
          <PlayerFormView
            teamId={selectedTeam.id}
            teamName={selectedTeam.name}
            deporteId={selectedTeam.deporteId}
            playerId={editingPlayer}
            onBack={handleBackFromPlayerForm}
            onSaved={handlePlayerSaved}
            onAnalyze={handleAnalyzePlayer}
          />
        ) : null;
      case 'athlete-selection':
        return selectedTeam ? (
          <AthleteSelectionView
            teamId={selectedTeam.id}
            teamName={selectedTeam.name}
            deporteId={selectedTeam.deporteId}
            deporteName={selectedSport?.nombre}
            onBack={handleBackFromAthleteSelection}
            onAthletesSelected={handleAthletesSelected}
          />
        ) : null;
      // Nuevos casos para deportistas
      case 'athletes-selection':
        return (
          <SportsSelectionView 
            onBack={handleBackFromAthletesSelection} 
            onSportSelect={handleSportSelectForAthletes}
            userName={userName}
            onLogout={handleLogout}
            title="Seleccionar Deporte para Deportistas"
            description="Elige el deporte para gestionar deportistas"
          />
        );
      case 'sport-athletes':
        return selectedSportForAthletes ? (
          <TeamPlayersView 
            teamId=""
            teamName="Deportistas"
            deporteId={selectedSportForAthletes.id}
            deporteName={selectedSportForAthletes.nombre}
            onBack={handleBackFromSportAthletes}
            onPlayerForm={handleAthleteForm}
            userName={userName}
            onLogout={handleLogout}
            isAthletesMode={true}
            title={`Deportistas de ${selectedSportForAthletes.nombre}`}
            addButtonText="+ nuevo deportista"
          />
        ) : null;
      case 'athlete-form':
        return selectedSportForAthletes ? (
          <PlayerFormView
            teamId=""
            teamName="Deportistas"
            deporteId={selectedSportForAthletes.id}
            playerId={editingPlayer}
            onBack={handleBackFromAthleteForm}
            onSaved={handleAthleteSaved}
            isAthletesMode={true}
            title={editingPlayer ? 'Editar Deportista' : 'Completar Perfil de Deportista'}
            onAnalyze={handleAnalyzePlayer}
          />
        ) : null;
      case 'analysis':
        return (
          <NewAnalysisView 
            onBack={handleBackFromNewAnalysis}
            onAnalysisComplete={handleAnalysisComplete}
            userName={userName}
            onLogout={handleLogout}
            preselectedPlayerId={editingPlayer}
            preselectedDeporteId={selectedTeam?.deporteId || selectedSportForAthletes?.id}
          />
        );
      case 'analysis-results':
        return selectedAnalysisId ? (
          <AnalysisResultsView 
            analysisId={selectedAnalysisId}
            onBack={handleBackFromAnalysisResults}
            userName={userName}
            onLogout={handleLogout}
          />
        ) : null;
      case 'results':
        return (
          <ResultsView 
            onBack={handleBackFromResults} 
            onViewAnalysis={handleViewAnalysis}
            userName={userName}
            onLogout={handleLogout}
          />
        );
      case 'athlete-results':
        return (
          <ResultsView 
            onBack={handleBackFromResults} 
            onViewAnalysis={handleViewAnalysis}
            userName={userName}
            onLogout={handleLogout}
            isAthleteView={true}
          />
        );
      case 'analysis-details':
        return selectedAnalysisId ? (
          <AnalysisDetailsView 
            analysisId={selectedAnalysisId}
            onBack={handleBackFromAnalysisDetails}
            userName={userName}
            onLogout={handleLogout}
          />
        ) : null;
      case 'statistics':
        return (
          <StatisticsView 
            onBack={handleBackFromStats}
            userName={userName}
            onLogout={handleLogout}
          />
        );
      case 'athlete-teams':
        return (
          <AthleteTeamsView 
            onBack={handleBack}
            onTeamClick={handleAthleteTeamClick}
            userName={userName}
            onLogout={handleLogout}
          />
        );
      case 'athlete-team-detail':
        return selectedAthleteTeam ? (
          <AthleteTeamDetailView 
            teamId={selectedAthleteTeam.id}
            teamName={selectedAthleteTeam.name}
            deporteId={selectedAthleteTeam.deporteId}
            deporteName={selectedAthleteTeam.deporteName}
            onBack={handleBackFromAthleteTeamDetail}
            userName={userName}
            onLogout={handleLogout}
          />
        ) : null;
      case 'legal':
        return <LegalContent />;
      default:
        return (
          <Dashboard 
            userName={userName}
            onNavigate={handleNavigate}
            onLogout={handleLogout}
          />
        );
    }
  };

  // Determinar qué información del deporte pasar según la sección actual
  const getSelectedSportForBreadcrumb = () => {
    if (currentSection === 'sport-athletes') {
      return selectedSportForAthletes;
    } else if (currentSection === 'sport-teams' || currentSection === 'team-players') {
      return selectedSport;
    }
    return null;
  };

  // Determinar qué información del equipo pasar según la sección actual
  const getSelectedTeamForBreadcrumb = () => {
    if (currentSection === 'team-players' && selectedTeam) {
      return selectedTeam;
    }
    return null;
  };

  return (
    <AuthenticatedLayout 
      onNavigate={handleNavigate} 
      currentSection={currentSection} 
      selectedSport={getSelectedSportForBreadcrumb()}
      selectedTeam={getSelectedTeamForBreadcrumb()}
    >
      {renderContent()}
    </AuthenticatedLayout>
  );
}

export default Index;
