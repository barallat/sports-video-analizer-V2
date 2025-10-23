import { Home, Users, UserCheck, BarChart3, Target, Settings } from 'lucide-react';
import { useRef, useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';

interface BottomNavigationProps {
  onNavigate?: (section: string) => void;
  currentSection?: string;
}

export function BottomNavigation({ onNavigate, currentSection }: BottomNavigationProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const [mounted, setMounted] = useState(false);
  const { user } = useAuth();
  const [userRole, setUserRole] = useState<string>('');
  const [isInTeam, setIsInTeam] = useState(false);
  const [hasResults, setHasResults] = useState(false);

  const navItems = [
    { title: 'Dashboard', section: 'dashboard', icon: Home, show: true },
    { 
      title: userRole === 'athlete' ? 'Mis Equipos' : 'Equipos', 
      section: 'teams', 
      icon: Users, 
      show: true, 
      disabled: userRole === 'athlete' && !isInTeam 
    },
    { 
      title: userRole === 'athlete' ? 'Mis datos' : 'Deportistas', 
      section: 'deportistas', 
      icon: UserCheck, 
      show: true 
    },
    { title: 'Análisis', section: 'analysis', icon: BarChart3, show: true, disabled: userRole === 'athlete' },
    { 
      title: userRole === 'athlete' ? 'Mis resultados' : 'Resultados', 
      section: 'results', 
      icon: Target, 
      show: true, 
      disabled: userRole === 'athlete' && !hasResults 
    },
    { title: 'Estadísticas', section: 'statistics', icon: BarChart3, show: true, disabled: userRole === 'athlete' },
    { title: 'Config', section: 'config', icon: Settings, show: true },
  ];

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (user) {
      loadUserRole();
      checkTeamMembership();
      checkResults();
    }
  }, [user]);

  const loadUserRole = async () => {
    if (!user) return;

    try {
      const { data: userData, error } = await supabase
        .from('usuarios')
        .select('role')
        .eq('auth_user_id', user.id)
        .single();

      if (error) {
        console.error('Error fetching user role:', error);
        return;
      }

      if (userData?.role) {
        setUserRole(userData.role);
      }
    } catch (error) {
      console.error('Error in loadUserRole:', error);
    }
  };

  const checkTeamMembership = async () => {
    if (!user) return;

    try {
      const { data: userData } = await supabase
        .from('usuarios')
        .select('id')
        .eq('auth_user_id', user.id)
        .single();

      if (!userData) return;

      const { data: jugadorData } = await supabase
        .from('jugadores')
        .select('id')
        .eq('user_id', userData.id)
        .single();

      if (!jugadorData) return;

      const { data: teamData } = await supabase
        .from('jugador_equipos')
        .select('equipo_id')
        .eq('jugador_id', jugadorData.id)
        .limit(1);

      setIsInTeam(teamData && teamData.length > 0);
    } catch (error) {
      console.error('Error checking team membership:', error);
    }
  };

  const checkResults = async () => {
    if (!user) return;

    try {
      const { data: userData } = await supabase
        .from('usuarios')
        .select('id')
        .eq('auth_user_id', user.id)
        .single();

      if (!userData) return;

      const { data: jugadorData } = await supabase
        .from('jugadores')
        .select('id')
        .eq('user_id', userData.id)
        .single();

      if (!jugadorData) return;

      const { data: resultsData } = await supabase
        .from('analisis_videos')
        .select('id')
        .eq('jugador_id', jugadorData.id)
        .limit(1);

      setHasResults(resultsData && resultsData.length > 0);
    } catch (error) {
      console.error('Error checking results:', error);
    }
  };

  // Verificar posición de scroll
  const checkScroll = () => {
    if (scrollContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 5);
    }
  };

  useEffect(() => {
    checkScroll();
    window.addEventListener('resize', checkScroll);
    return () => window.removeEventListener('resize', checkScroll);
  }, []);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const scrollAmount = 100;
      scrollContainerRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth',
      });
      setTimeout(checkScroll, 300);
    }
  };

  if (!mounted) return null;

  const navContent = (
    <nav 
      className="md:hidden mobile-bottom-nav bg-background border-t border-border" 
      style={{ 
        position: 'fixed', 
        bottom: 0, 
        left: 0, 
        right: 0, 
        zIndex: 99999, 
        transform: 'translateZ(0)',
        width: '100vw',
        height: '80px'
      }}
    >
      {(canScrollLeft || canScrollRight) && (
        <div className="absolute left-0 top-1/2 -translate-y-1/2 z-10 pointer-events-none bg-gradient-to-r from-background to-transparent w-8 h-full"></div>
      )}
      {(canScrollLeft || canScrollRight) && (
        <div className="absolute right-0 top-1/2 -translate-y-1/2 z-10 pointer-events-none bg-gradient-to-l from-background to-transparent w-8 h-full"></div>
      )}
      
      <div 
        ref={scrollContainerRef}
        className="flex items-center overflow-x-auto scrollbar-hide h-20"
        onScroll={checkScroll}
      >
        {navItems.map((item) => {
          const isActive = currentSection === item.section;
          const isDisabled = item.disabled;
          return (
            <button
              key={item.title}
              onClick={() => !isDisabled && onNavigate?.(item.section)}
              disabled={isDisabled}
              className={`flex flex-col items-center justify-center flex-shrink-0 w-24 h-20 gap-0.5 transition-colors ${
                isActive
                  ? 'text-primary'
                  : isDisabled
                  ? 'text-muted-foreground/50 cursor-not-allowed'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <item.icon className="h-4 w-4" />
              <span className="text-xs font-medium">{item.title}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );

  return createPortal(navContent, document.body);
}
