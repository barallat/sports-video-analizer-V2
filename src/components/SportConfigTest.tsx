import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useSportConfigContext } from '@/contexts/SportConfigContext';

export function SportConfigTest() {
  const { 
    isMultiSport, 
    sportName, 
    sportDisplayName,
    appName, 
    appDescription, 
    theme, 
    features,
    database,
    navigation
  } = useSportConfigContext();

  return (
    <div className="p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            🏀 Configuración de Deporte Activa
            <Badge variant={isMultiSport ? "default" : "secondary"}>
              {isMultiSport ? "Multi-Deporte" : "Individual"}
            </Badge>
          </CardTitle>
          <CardDescription>
            Información de la configuración actual del deporte
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h4 className="font-semibold mb-2">Información Básica</h4>
              <div className="space-y-1 text-sm">
                <p><strong>ID:</strong> {sportName}</p>
                <p><strong>Nombre:</strong> {sportDisplayName}</p>
                <p><strong>App:</strong> {appName}</p>
                <p><strong>Descripción:</strong> {appDescription}</p>
              </div>
            </div>
            
            <div>
              <h4 className="font-semibold mb-2">Tema</h4>
              <div className="space-y-1 text-sm">
                <p><strong>Primario:</strong> 
                  <span 
                    className="inline-block w-4 h-4 rounded ml-2" 
                    style={{ backgroundColor: theme.primaryColor }}
                  ></span>
                  {theme.primaryColor}
                </p>
                <p><strong>Acento:</strong> 
                  <span 
                    className="inline-block w-4 h-4 rounded ml-2" 
                    style={{ backgroundColor: theme.accentColor }}
                  ></span>
                  {theme.accentColor}
                </p>
                <p><strong>Gradiente:</strong> {theme.gradient}</p>
              </div>
            </div>
          </div>

          <div>
            <h4 className="font-semibold mb-2">Funcionalidades</h4>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div className="flex items-center gap-2">
                <Badge variant={features.showSportsSelection ? "default" : "secondary"}>
                  {features.showSportsSelection ? "✅" : "❌"}
                </Badge>
                Selección de Deportes
              </div>
              <div className="flex items-center gap-2">
                <Badge variant={features.showSportsManagement ? "default" : "secondary"}>
                  {features.showSportsManagement ? "✅" : "❌"}
                </Badge>
                Gestión de Deportes
              </div>
              <div className="flex items-center gap-2">
                <Badge variant={features.showSportFieldInAnalysis ? "default" : "secondary"}>
                  {features.showSportFieldInAnalysis ? "✅" : "❌"}
                </Badge>
                Campo Deporte en Análisis
              </div>
              <div className="flex items-center gap-2">
                <Badge variant={features.skipSportsConfig ? "default" : "secondary"}>
                  {features.skipSportsConfig ? "✅" : "❌"}
                </Badge>
                Saltar Configuración
              </div>
              <div className="flex items-center gap-2">
                <Badge variant={features.showSportsInDashboard ? "default" : "secondary"}>
                  {features.showSportsInDashboard ? "✅" : "❌"}
                </Badge>
                Deportes en Dashboard
              </div>
            </div>
          </div>

          <div>
            <h4 className="font-semibold mb-2">Base de Datos</h4>
            <div className="text-sm">
              <p><strong>Filtro:</strong> {database.sportFilter}</p>
            </div>
          </div>

          <div>
            <h4 className="font-semibold mb-2">Navegación</h4>
            <div className="text-sm">
              <p><strong>Sección por defecto:</strong> {navigation.defaultSection}</p>
              <p><strong>Saltar a equipos:</strong> {navigation.skipToTeams ? "Sí" : "No"}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Demo del tema */}
      <Card>
        <CardHeader>
          <CardTitle>Demo del Tema</CardTitle>
          <CardDescription>
            Vista previa de cómo se verá la aplicación con esta configuración
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div 
            className={`p-6 rounded-lg bg-gradient-to-br ${theme.backgroundColor || 'from-background via-primary/5 to-accent/5'}`}
            style={{
              border: `2px solid ${theme.primaryColor}`,
            }}
          >
            <h3 className="text-xl font-bold mb-2" style={{ color: theme.primaryColor }}>
              {appName}
            </h3>
            <p className="text-sm mb-4">{appDescription}</p>
            
            <div className="flex gap-2">
              <button 
                className="px-4 py-2 rounded text-white font-medium"
                style={{ backgroundColor: theme.primaryColor }}
              >
                Botón Primario
              </button>
              <button 
                className="px-4 py-2 rounded text-white font-medium"
                style={{ backgroundColor: theme.accentColor }}
              >
                Botón Secundario
              </button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 