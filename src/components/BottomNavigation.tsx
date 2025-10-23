import { Home, Users, UserCheck, BarChart3, Target, Settings } from 'lucide-react';
import { useRef, useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

interface BottomNavigationProps {
  onNavigate?: (section: string) => void;
  currentSection?: string;
}

const navItems = [
  { title: 'Dashboard', section: 'dashboard', icon: Home },
  { title: 'Equipos', section: 'teams', icon: Users },
  { title: 'Deportistas', section: 'deportistas', icon: UserCheck },
  { title: 'Análisis', section: 'analysis', icon: BarChart3 },
  { title: 'Resultados', section: 'results', icon: Target },
  { title: 'Estadísticas', section: 'statistics', icon: BarChart3 },
  { title: 'Config', section: 'config', icon: Settings },
];

export function BottomNavigation({ onNavigate, currentSection }: BottomNavigationProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

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
          return (
            <button
              key={item.title}
              onClick={() => onNavigate?.(item.section)}
              className={`flex flex-col items-center justify-center flex-shrink-0 w-24 h-20 gap-0.5 transition-colors ${
                isActive
                  ? 'text-primary'
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
