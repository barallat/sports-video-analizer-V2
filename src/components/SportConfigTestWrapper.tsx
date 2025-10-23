import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { SportConfigTest } from './SportConfigTest';
import { useSportConfigContext } from '@/contexts/SportConfigContext';

interface SportConfigTestWrapperProps {
  children: React.ReactNode;
}

export function SportConfigTestWrapper({ children }: SportConfigTestWrapperProps) {
  const [showTest, setShowTest] = useState(false);
  const { appName, sportName } = useSportConfigContext();

  // Solo mostrar en desarrollo
  if (import.meta.env.PROD) {
    return <>{children}</>;
  }

  if (showTest) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-accent/5">
        <div className="p-4">
          <Button 
            onClick={() => setShowTest(false)}
            variant="outline"
            className="mb-4"
          >
            ← Volver a la aplicación
          </Button>
        </div>
        <SportConfigTest />
      </div>
    );
  }

  return (
    <>
      {children}
      {/* Botón flotante para activar el modo de prueba - OCULTO */}
      {/* <div className="fixed bottom-4 right-4 z-50">
        <Button
          onClick={() => setShowTest(true)}
          variant="outline"
          size="sm"
          className="bg-background/80 backdrop-blur-sm border-2 border-primary/20 hover:border-primary/40"
          title={`Configuración: ${sportName} - ${appName}`}
        >
          ⚙️ Config
        </Button>
      </div> */}
    </>
  );
} 