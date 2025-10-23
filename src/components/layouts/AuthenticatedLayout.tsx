import { ReactNode } from 'react';
import { SidebarProvider } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/AppSidebar';
import { AppHeader } from '@/components/AppHeader';
import { BottomNavigation } from '@/components/BottomNavigation';
import CookieManager from '@/components/CookieManager';

interface AuthenticatedLayoutProps {
  children: ReactNode;
  onNavigate?: (section: string) => void;
  currentSection?: string;
  selectedSport?: { id: string; nombre: string } | null;
  selectedTeam?: { id: string; name: string } | null;
}

export function AuthenticatedLayout({ children, onNavigate, currentSection, selectedSport, selectedTeam }: AuthenticatedLayoutProps) {

  return (
    <>
      <SidebarProvider defaultOpen={true} style={{ "--sidebar-width": "16rem", "--sidebar-width-icon": "4rem" } as React.CSSProperties}>
        <div className="min-h-screen flex w-full">
          <AppSidebar onNavigate={onNavigate} />
          <div className="flex-1 flex flex-col">
            <AppHeader currentSection={currentSection} selectedSport={selectedSport} selectedTeam={selectedTeam} />
            <main className="flex-1 p-4 md:p-6 pb-20 md:pb-6">
              {children}
            </main>
          </div>
        </div>
        <CookieManager />
      </SidebarProvider>
      <BottomNavigation onNavigate={onNavigate} currentSection={currentSection} />
    </>
  );
}
