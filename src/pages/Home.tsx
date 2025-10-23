import { Link, Navigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { PublicLayout } from '@/components/layouts/PublicLayout';
import { useAuth } from '@/hooks/useAuth';

export default function Home() {
  const { user, loading } = useAuth();

  // Si hay un usuario autenticado, redirigir al dashboard
  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  // Mostrar loading mientras se verifica la autenticación
  if (loading) {
    return (
      <PublicLayout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center space-y-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="text-muted-foreground">Cargando...</p>
          </div>
        </div>
      </PublicLayout>
    );
  }

  return (
    <PublicLayout>
      <div className="container mx-auto px-4 py-20">
        <div className="max-w-3xl mx-auto text-center space-y-8">
          <h1 className="text-4xl md:text-6xl font-bold text-foreground">
            Análisis Deportivo con IA
          </h1>
          <p className="text-xl text-muted-foreground">
            Potencia el rendimiento deportivo con análisis inteligente de video.
            Conecta con tu equipo, analiza el rendimiento y mantén todo bajo control.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Button size="lg" asChild>
              <Link to="/auth?register=true">Comenzar ahora</Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link to="/auth">Iniciar sesión</Link>
            </Button>
          </div>
        </div>
      </div>
    </PublicLayout>
  );
}
