# Sistema de Configuración por Deportes

Este sistema permite crear versiones individuales de la aplicación para deportes específicos manteniendo un solo código base.

## Estructura del Sistema

### Archivos de Configuración

- `src/config/sport-config.ts` - Interfaz base para configuraciones
- `src/config/sports/multi-sport.ts` - Configuración multideporte
- `src/config/sports/basketball.ts` - Configuración para baloncesto
- `src/config/sports/tennis.ts` - Configuración para tenis
- `src/config/sports/football.ts` - Configuración para fútbol
- `src/config/sports/volleyball.ts` - Configuración para voleibol
- `src/config/sports/track-field.ts` - Configuración para Track & Field

### Hooks y Contextos

- `src/hooks/useSportConfig.ts` - Hook para acceder a la configuración
- `src/contexts/SportConfigContext.tsx` - Contexto React para configuración global
- `src/components/SportThemeProvider.tsx` - Aplicación dinámica de temas

### Variables de Entorno

- `env.multi` - Configuración multideporte
- `env.basketball` - Configuración baloncesto
- `env.tennis` - Configuración tenis
- `env.football` - Configuración fútbol
- `env.volleyball` - Configuración voleibol
- `env.track-field` - Configuración Track & Field

## Deportes Disponibles

| Deporte | ID en BD | Configuración | Tema |
|---------|----------|---------------|------|
| Multideporte | `all` (no filtrar) | `multi` | Azul/Verde |
| Baloncesto | `29ddfd2c-2c08-4b96-a9f7-3e90c7ab4c62` | `basketball` | Naranja/Azul |
| Tenis | `36232fe0-a6f3-4a9c-8bbd-0b5ef6baca41` | `tennis` | Verde/Amarillo |
| Fútbol | `e6c61a82-4f65-4376-8eb5-2136968e5fcb` | `football` | Verde/Amarillo |
| Voleibol | `cec77419-d5f7-407c-8bee-9fe9c4d8a129` | `volleyball` | Azul/Naranja |
| Track & Field | `4c7a3092-ce75-4891-a158-9ded7d974966` | `track-field` | Rojo/Gris |

> **Nota:** El modo multideporte usa `'all'` como filtro, lo que significa que no se aplica ningún filtro por deporte y se muestran todos los deportes disponibles.

## Cómo Usar

### Desarrollo

```bash
# Versión multideporte (por defecto)
npm run dev

# Versión baloncesto
npm run dev:basketball

# Versión tenis
npm run dev:tennis

# Versión fútbol
npm run dev:football

# Versión voleibol
npm run dev:volleyball

# Versión track-field
npm run dev:track-field
```

### Build para Producción

```bash
# Versión multideporte
npm run build:multi

# Versión baloncesto
npm run build:basketball

# Versión tenis
npm run build:tennis

# Versión fútbol
npm run build:football

# Versión voleibol
npm run build:volleyball

# Versión track-field
npm run build:track-field
```

### Cambio Rápido de Configuración

```bash
# Cambiar a versión baloncesto
npm run switch basketball

# Ver configuraciones disponibles
npm run switch list

# Mostrar ayuda
npm run switch help
```

## Configuración de un Nuevo Deporte

### 1. Obtener ID del Deporte

Primero, obtener el ID del deporte de la base de datos:

```sql
SELECT id, nombre FROM deportes WHERE nombre = 'Nombre del Deporte';
```

### 2. Crear Archivo de Configuración

```typescript
// src/config/sports/handball.ts
import { SportConfig } from '../sport-config';

export const handballConfig: SportConfig = {
  sportId: 'handball',
  sportName: 'Balonmano',
  sportDisplayName: 'Handball',
  appName: 'Handball Video Analyzer',
  appDescription: 'Análisis profesional de rendimiento en balonmano',
  
  theme: {
    primaryColor: '#8b5cf6', // Púrpura balonmano
    accentColor: '#f59e0b', // Naranja
    gradient: 'from-purple-500 via-purple-600 to-orange-500',
    logo: '/logos/handball-logo.svg',
    backgroundColor: 'from-purple-50 via-purple-100/20 to-orange-50/20'
  },
  
  features: {
    showSportsSelection: false,
    showSportsManagement: false,
    showSportFieldInAnalysis: false,
    skipSportsConfig: true,
    showSportsInDashboard: false
  },
  
  database: {
    sportFilter: '3eabf215-bc7f-42f1-81f5-276956f31923' // ID real del deporte en BD (o 'all' para multideporte)
  },
  
  navigation: {
    defaultSection: 'teams',
    skipToTeams: true
  }
};
```

### 3. Registrar en el Hook

```typescript
// src/hooks/useSportConfig.ts
import { handballConfig } from '@/config/sports/handball';

const sportConfigs: Record<string, SportConfig> = {
  multi: multiSportConfig,
  basketball: basketballConfig,
  tennis: tennisConfig,
  football: footballConfig,
  volleyball: volleyballConfig,
  'track-field': trackFieldConfig,
};
```

### 4. Crear Variables de Entorno

```bash
# env.handball
VITE_SPORT_CONFIG=handball
VITE_APP_TITLE="Handball Video Analyzer"
VITE_APP_DESCRIPTION="Análisis profesional de rendimiento en balonmano"
```

### 5. Añadir Scripts

```json
// package.json
{
  "scripts": {
    "dev:handball": "cp env.handball .env && npm run dev",
    "build:handball": "cp env.handball .env && npm run build"
  }
}
```

### 6. Actualizar Script de Cambio

```javascript
// scripts/switch-sport.js
const availableSports = ['multi', 'basketball', 'tennis', 'football', 'volleyball', 'track-field'];
```

## Uso en Componentes

### Hook Básico

```typescript
import { useSportConfigContext } from '@/contexts/SportConfigContext';

function MyComponent() {
  const { 
    isMultiSport, 
    sportName, 
    appName, 
    theme, 
    features 
  } = useSportConfigContext();
  
  return (
    <div className={`bg-gradient-to-br ${theme.backgroundColor}`}>
      <h1>{appName}</h1>
      {features.showSportsSelection && <SportsSelector />}
    </div>
  );
}
```

### Hook Específico

```typescript
import { useSportConfig } from '@/hooks/useSportConfig';

function MyComponent() {
  const config = useSportConfig();
  
  return (
    <div style={{ 
      background: `linear-gradient(135deg, ${config.theme.primaryColor}, ${config.theme.accentColor})` 
    }}>
      {config.appName}
    </div>
  );
}
```

## Características Configurables

### Funcionalidades

- `showSportsSelection`: Mostrar pantalla de selección de deportes
- `showSportsManagement`: Mostrar gestión de deportes
- `showSportFieldInAnalysis`: Mostrar campo deporte en análisis
- `skipSportsConfig`: Saltar configuración inicial de deportes
- `showSportsInDashboard`: Mostrar deportes en dashboard

### Tema

- `primaryColor`: Color principal del deporte
- `accentColor`: Color de acento
- `gradient`: Gradiente principal
- `backgroundColor`: Gradiente de fondo
- `logo`: Logo específico del deporte

### Base de Datos

- `sportFilter`: 
  - Para deportes individuales: ID del deporte en la base de datos (ej: `'29ddfd2c-2c08-4b96-a9f7-3e90c7ab4c62'`)
  - Para modo multideporte: `'all'` (no se aplica filtro, se muestran todos los deportes)

### Navegación

- `defaultSection`: Sección por defecto al iniciar
- `skipToTeams`: Saltar directamente a equipos

## Estructura de Ramas

```
main (versión multideporte)
├── basketball (versión solo baloncesto)
├── tennis (versión solo tenis)
├── football (versión solo fútbol)
├── volleyball (versión solo voleibol)
└── track-field (versión solo track-field)
```

## Deployment

Cada versión puede desplegarse independientemente usando los scripts de build correspondientes.

### Ejemplo con Vercel

```bash
# Deploy versión multideporte
vercel --prod

# Deploy versión baloncesto
npm run build:basketball
vercel --prod
```

## Mantenimiento

- Los cambios en `main` se propagan a todas las versiones
- Cada versión puede tener personalizaciones específicas
- El sistema es escalable y fácil de mantener

## Pruebas

En modo desarrollo, aparece un botón flotante "⚙️ Config" en la esquina inferior derecha que permite ver la configuración actual del deporte y probar los temas. 