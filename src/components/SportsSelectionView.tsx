import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Trophy } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useLanguage } from '@/contexts/LanguageContext';

interface Deporte {
  id: string;
  nombre: string;
  descripcion: string;
}

interface SportsSelectionViewProps {
  onBack: () => void;
  onSportSelect: (deporte: Deporte) => void;
  userName?: string;
  onLogout?: () => Promise<void>;
  title?: string;
  description?: string;
}

export function SportsSelectionView({ 
  onBack, 
  onSportSelect, 
  userName, 
  onLogout, 
  title, 
  description 
}: SportsSelectionViewProps) {
  const [userSports, setUserSports] = useState<Deporte[]>([]);
  const [loading, setLoading] = useState(true);
  const { t } = useLanguage();

  useEffect(() => {
    loadUserSports();
  }, []);

  const loadUserSports = async () => {
    try {
      const { data: userData } = await supabase
        .from('usuarios')
        .select('id')
        .eq('auth_user_id', (await supabase.auth.getUser()).data.user?.id)
        .single();

      if (userData) {
        const { data } = await supabase
          .from('usuario_deportes')
          .select('deporte_id, deportes(id, nombre, descripcion)')
          .eq('usuario_id', userData.id);

        if (data) {
          const deportes = data.map(item => item.deportes).filter(Boolean) as Deporte[];
          setUserSports(deportes);
        }
      }
    } catch (error) {
      console.error('Error loading user sports:', error);
    }
    setLoading(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center space-y-4">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto"></div>
          <p className="text-muted-foreground">{t('loading')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="max-w-6xl mx-auto">
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {userSports.map((deporte) => (
            <Card 
              key={deporte.id} 
              className="hover:shadow-lg transition-shadow cursor-pointer glass-card"
              onClick={() => onSportSelect(deporte)}
            >
              <CardHeader>
                <div className="flex items-center justify-between">
                  <Trophy className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>{deporte.nombre}</CardTitle>
                <CardDescription>{deporte.descripcion}</CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="outline" className="w-full">
                  {title && title.includes('Deportistas') ? 'Gestionar Deportistas' : t('manageTeams')}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {userSports.length === 0 && (
          <Card>
            <CardContent className="p-8 text-center">
              <Trophy className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">{t('noSportsConfigured')}</h3>
              <p className="text-muted-foreground mb-4">
                {t('goToConfigurationToSelectSports')}
              </p>
              <Button onClick={onBack}>{t('goToConfiguration')}</Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
