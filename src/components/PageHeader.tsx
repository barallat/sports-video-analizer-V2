import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { ArrowLeft } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

interface PageHeaderProps {
  title: string;
  description?: string;
  onBack: () => void;
  actions?: React.ReactNode;
}

export function PageHeader({ title, description, onBack, actions }: PageHeaderProps) {
  const { t } = useLanguage();

  return (
    <Card className="glass-card mb-6">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button onClick={onBack} variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              {t('back')}
            </Button>
            <div>
              <h1 className="text-2xl font-bold">{title}</h1>
              {description && (
                <p className="text-muted-foreground mt-1">{description}</p>
              )}
            </div>
          </div>
          {actions && (
            <div className="flex items-center space-x-2">
              {actions}
            </div>
          )}
        </div>
      </CardHeader>
    </Card>
  );
}
