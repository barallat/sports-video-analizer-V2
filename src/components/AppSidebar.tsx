import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";
import { useCookieConsent } from "@/contexts/CookieContext";
import { useAuth } from "@/hooks/useAuth";
import { Cookie, FileText, Home, Settings, Shield, Users, BarChart3, Target, UserCheck } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

interface AppSidebarProps {
  onNavigate?: (section: string) => void;
}

export function AppSidebar({ onNavigate }: AppSidebarProps) {
  const { open } = useSidebar();
  const { openSettings } = useCookieConsent();
  const { user } = useAuth();
  const [userRole, setUserRole] = useState<string>('');
  const [isInTeam, setIsInTeam] = useState(false);
  const [hasResults, setHasResults] = useState(false);

  const menuItems = [
    { title: "Dashboard", section: "dashboard", icon: Home, show: true },
    { 
      title: userRole === 'athlete' ? "Mis Equipos" : "Equipos", 
      section: "teams", 
      icon: Users, 
      show: true, 
      disabled: userRole === 'athlete' && !isInTeam 
    },
    { 
      title: userRole === 'athlete' ? "Mis datos" : "Deportistas", 
      section: "deportistas", 
      icon: UserCheck, 
      show: true 
    },
    { title: "Análisis", section: "analysis", icon: BarChart3, show: true, disabled: userRole === 'athlete' },
    { 
      title: userRole === 'athlete' ? "Mis resultados" : "Resultados", 
      section: "results", 
      icon: Target, 
      show: true, 
      disabled: userRole === 'athlete' && !hasResults 
    },
    { title: "Estadísticas", section: "statistics", icon: BarChart3, show: true, disabled: userRole === 'athlete' },
    { title: "Configuración", section: "config", icon: Settings, show: true },
  ];

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

  return (
    <Sidebar
      collapsible="icon"
      className="border-r border-sidebar-border group/sidebar"
    >
      <SidebarContent className="flex flex-col">
        <div className="px-3 py-6">
          {open ? (
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
                  <span className="text-primary-foreground font-bold text-lg">
                    S
                  </span>
                </div>
              </div>
              <SidebarTrigger className="hover:bg-sidebar-accent/50 transition-colors [&>svg]:text-sidebar-foreground" />
            </div>
          ) : (
            <div className="flex justify-center mb-4 relative h-8">
              <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center group-hover/sidebar:opacity-0 transition-opacity duration-200">
                <span className="text-primary-foreground font-bold text-lg">
                  S
                </span>
              </div>
              <SidebarTrigger className="absolute inset-0 opacity-0 group-hover/sidebar:opacity-100 transition-opacity duration-200 delay-100 hover:bg-sidebar-accent/50 [&>svg]:text-sidebar-foreground" />
            </div>
          )}
        </div>

        <SidebarGroup className="flex-1">
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton 
                    tooltip={item.title}
                    onClick={() => !item.disabled && onNavigate?.(item.section)}
                    disabled={item.disabled}
                    className={`flex items-center gap-3 py-2 rounded-md transition-colors w-full ${
                      item.disabled ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                  >
                    <item.icon className="h-5 w-5 flex-shrink-0" />
                    {open && <span>{item.title}</span>}
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Enlaces legales en la parte inferior */}
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton 
                  tooltip="Información Legal"
                  onClick={() => onNavigate('legal')}
                  className="flex items-center gap-3 py-2 rounded-md transition-colors text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                >
                  <Shield className="h-4 w-4 flex-shrink-0" />
                  {open && <span className="text-xs">Legal</span>}
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton
                  onClick={() => {
                    console.log("Sidebar button clicked");
                    openSettings();
                  }}
                  tooltip="Configuración de Cookies"
                  className="flex items-center gap-3 py-2 rounded-md transition-colors text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                >
                  <Cookie className="h-4 w-4 flex-shrink-0" />
                  {open && (
                    <span className="text-xs">Configuración de Cookies</span>
                  )}
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
