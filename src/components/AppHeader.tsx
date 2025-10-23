import { SidebarTrigger } from '@/components/ui/sidebar';
import { UserMenu } from './UserMenu';
import { Breadcrumbs } from './Breadcrumbs';

interface AppHeaderProps {
  currentSection?: string;
  selectedSport?: { id: string; nombre: string } | null;
  selectedTeam?: { id: string; name: string } | null;
}

export function AppHeader({ currentSection, selectedSport, selectedTeam }: AppHeaderProps) {
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-16 items-center justify-between px-4 md:px-6">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center md:hidden">
              <span className="text-primary-foreground font-bold text-lg">
                S
              </span>
            </div>
            <Breadcrumbs currentSection={currentSection} selectedSport={selectedSport} selectedTeam={selectedTeam} />
          </div>
        </div>
        <UserMenu />
      </div>
    </header>
  );
}