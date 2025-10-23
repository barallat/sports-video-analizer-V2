import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { PublicLayout } from "@/components/layouts/PublicLayout";
import { Button } from "@/components/ui/button";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <PublicLayout>
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <h1 className="text-6xl font-bold text-foreground">404</h1>
          <p className="text-xl text-muted-foreground">Página no encontrada</p>
          <p className="text-sm text-muted-foreground">
            La página que buscas no existe o ha sido movida.
          </p>
          <Button asChild>
            <Link to="/">Volver al inicio</Link>
          </Button>
        </div>
      </div>
    </PublicLayout>
  );
};

export default NotFound;
