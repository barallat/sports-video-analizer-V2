import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Settings, User, Palette, Bell } from 'lucide-react';
import { UserProfileView } from '@/components/UserProfileView';
import { useLanguage } from '@/contexts/LanguageContext';
import { useSportConfigContext } from '@/contexts/SportConfigContext';

interface ConfigSectionProps {
  onBack: () => void;
  onNavigate: (section: string) => void;
  userName?: string;
  onLogout?: () => Promise<void>;
  currentSection?: string;
}

export function ConfigSection({ onBack, onNavigate, userName, onLogout, currentSection }: ConfigSectionProps) {
  const { t } = useLanguage();
  const { features } = useSportConfigContext();

  // Si estamos en la vista de perfil, mostrar UserProfileView
  if (currentSection === 'profile') {
    return <UserProfileView onBack={onBack} userName={userName} onLogout={onLogout} />;
  }

  const handleCardClick = (type: string) => {
    switch (type) {
      case 'profile':
        onNavigate('profile');
        break;
      case 'sports':
        onNavigate('sports-management');
        break;
      case 'appearance':
        onNavigate('appearance');
        break;
      case 'notifications':
        onNavigate('notifications');
        break;
      default:
        break;
    }
  };

  return (
    <div className="space-y-6">
      <div className="max-w-6xl mx-auto">
        <div className="grid gap-6 md:grid-cols-2">
          <Card className="glass-card cursor-pointer hover:shadow-lg transition-shadow" onClick={() => handleCardClick('profile')}>
            <CardHeader>
              <CardTitle className="flex items-center">
                <User className="h-5 w-5 mr-2" />
                Perfil de Usuario
              </CardTitle>
              <CardDescription>
                Gestiona tu información personal y preferencias
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="outline" className="w-full">
                Editar Perfil
              </Button>
            </CardContent>
          </Card>

          {features.showSportsManagement && (
            <Card className="glass-card cursor-pointer hover:shadow-lg transition-shadow" onClick={() => handleCardClick('sports')}>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Settings className="h-5 w-5 mr-2" />
                  Deportes
                </CardTitle>
                <CardDescription>
                  Configura los deportes que gestionas
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="outline" className="w-full">
                  Gestionar Deportes
                </Button>
              </CardContent>
            </Card>
          )}

          <Card className="glass-card cursor-pointer hover:shadow-lg transition-shadow" onClick={() => handleCardClick('appearance')}>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Palette className="h-5 w-5 mr-2" />
                Apariencia
              </CardTitle>
              <CardDescription>
                Personaliza el tema y la apariencia
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="outline" className="w-full">
                Cambiar Tema
              </Button>
            </CardContent>
          </Card>

          <Card className="glass-card cursor-pointer hover:shadow-lg transition-shadow" onClick={() => handleCardClick('notifications')}>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Bell className="h-5 w-5 mr-2" />
                Notificaciones
              </CardTitle>
              <CardDescription>
                Configura cómo recibir notificaciones
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="outline" className="w-full">
                Configurar Notificaciones
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
