import CookieManager from "@/components/CookieManager";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { ReactNode } from "react";
import { Link } from "react-router-dom";
import { useSportConfigContext } from "@/contexts/SportConfigContext";

interface PublicLayoutProps {
  children: ReactNode;
}

export function PublicLayout({ children }: PublicLayoutProps) {
  const { appName } = useSportConfigContext();
  
  return (
    <div className="min-h-screen flex flex-col">
      <header className="fixed top-0 left-0 right-0 z-50 border-b border-border bg-background">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-lg">
                S
              </span>
            </div>
            <span className="font-semibold text-foreground">
              {appName}
            </span>
          </Link>
          <div className="flex items-center gap-2">
            <Button 
              variant="ghost" 
              asChild
              onClick={() => console.log("Header: Clicked Login button")}
            >
              <Link to="/auth">Iniciar sesión</Link>
            </Button>
            <Button 
              asChild
              onClick={() => console.log("Header: Clicked Register button")}
            >
              <Link to="/auth?register=true">Registrarse</Link>
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1 pt-16 pb-20">{children}</main>

      <div className="fixed bottom-0 left-0 right-0 bg-background border-t border-border">
        <Footer />
        <CookieManager />
      </div>
    </div>
  );
}
