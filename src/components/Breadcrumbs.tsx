import { ChevronRight, Home } from "lucide-react";
import { Link } from "react-router-dom";

interface BreadcrumbsProps {
  currentSection?: string;
  selectedSport?: { id: string; nombre: string } | null;
  selectedTeam?: { id: string; name: string } | null;
}

// Mapeo de secciones a nombres en español
const sectionNames: { [key: string]: string } = {
  'dashboard': 'Dashboard',
  'teams': 'Equipos',
  'deportistas': 'Deportistas',
  'athletes-selection': 'Deportistas',
  'sport-athletes': 'Deportistas',
  'athlete-teams': 'Equipos',
  'sport-teams': 'Equipos',
  'analysis': 'Análisis',
  'results': 'Resultados',
  'athlete-results': 'Resultados',
  'statistics': 'Estadísticas',
  'config': 'Configuración',
  'profile': 'Perfil',
  'sports-management': 'Deportes',
  'sports-selection': 'Deportes',
  'team-players': 'Jugadores',
  'player-form': 'Formulario de Jugador',
  'new-analysis': 'Nuevo Análisis',
  'analysis-details': 'Detalles del Análisis',
  'athlete-team-detail': 'Detalle del Equipo'
};

export function Breadcrumbs({ currentSection, selectedSport, selectedTeam }: BreadcrumbsProps) {
  // Función para determinar si estamos en una subsección de configuración
  const isConfigSubsection = (section: string) => {
    return section === 'profile' || section === 'sports-management';
  };

  // Función para obtener el breadcrumb de configuración
  const getConfigBreadcrumb = () => {
    if (currentSection === 'profile') {
      return (
        <>
          <ChevronRight className="h-4 w-4" />
          <span className="font-medium text-foreground">Configuración</span>
          <ChevronRight className="h-4 w-4" />
          <span className="font-medium text-foreground">Perfil de Usuario</span>
        </>
      );
    } else if (currentSection === 'sports-management') {
      return (
        <>
          <ChevronRight className="h-4 w-4" />
          <span className="font-medium text-foreground">Configuración</span>
          <ChevronRight className="h-4 w-4" />
          <span className="font-medium text-foreground">Deportes</span>
        </>
      );
    }
    return null;
  };

  // Para team-players, mostrar "Equipos" en lugar de "Jugadores"
  const getDisplayName = () => {
    if (currentSection === 'team-players') {
      return 'Equipos';
    }
    return currentSection ? sectionNames[currentSection] || currentSection : 'Dashboard';
  };

  const displayName = getDisplayName();

  return (
    <nav className="flex items-center space-x-1 text-sm text-muted-foreground">
      <Link
        to="/"
        className="flex items-center hover:text-foreground transition-colors"
      >
        <Home className="h-4 w-4" />
        <span className="sr-only">Inicio</span>
      </Link>
      {currentSection && currentSection !== 'dashboard' && (
        <div className="flex items-center space-x-1">
          {/* Mostrar breadcrumb especial para subsecciones de configuración */}
          {isConfigSubsection(currentSection) ? (
            getConfigBreadcrumb()
          ) : (
            <>
              <ChevronRight className="h-4 w-4" />
              <span className="font-medium text-foreground">{displayName}</span>
              {/* Mostrar el deporte si estamos en sport-athletes o sport-teams y tenemos información del deporte */}
              {(currentSection === 'sport-athletes' || currentSection === 'sport-teams') && selectedSport && (
                <>
                  <ChevronRight className="h-4 w-4" />
                  <span className="font-medium text-foreground">{selectedSport.nombre}</span>
                </>
              )}
              {/* Para team-players, mostrar la jerarquía completa: Equipos > Deporte > Equipo */}
              {currentSection === 'team-players' && selectedSport && selectedTeam && (
                <>
                  <ChevronRight className="h-4 w-4" />
                  <span className="font-medium text-foreground">{selectedSport.nombre}</span>
                  <ChevronRight className="h-4 w-4" />
                  <span className="font-medium text-foreground">{selectedTeam.name}</span>
                </>
              )}
            </>
          )}
        </div>
      )}
    </nav>
  );
}
