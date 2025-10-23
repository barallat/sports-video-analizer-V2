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
import { Cookie, FileText, Home, Settings, Shield, Users, BarChart3, Target, UserCheck } from "lucide-react";

const menuItems = [
  { title: "Dashboard", section: "dashboard", icon: Home },
  { title: "Equipos", section: "teams", icon: Users },
  { title: "Deportistas", section: "deportistas", icon: UserCheck },
  { title: "Análisis", section: "analysis", icon: BarChart3 },
  { title: "Resultados", section: "results", icon: Target },
  { title: "Estadísticas", section: "statistics", icon: BarChart3 },
  { title: "Configuración", section: "config", icon: Settings },
];

interface AppSidebarProps {
  onNavigate?: (section: string) => void;
}

export function AppSidebar({ onNavigate }: AppSidebarProps) {
  const { open } = useSidebar();
  const { openSettings } = useCookieConsent();

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
                    onClick={() => onNavigate?.(item.section)}
                    className="flex items-center gap-3 py-2 rounded-md transition-colors w-full"
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
