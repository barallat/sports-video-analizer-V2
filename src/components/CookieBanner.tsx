import { Button } from "@/components/ui/button";
import { Cookie } from "lucide-react";

interface CookieBannerProps {
  onAcceptAll: () => void;
  onRejectAll: () => void;
  onOpenSettings: () => void;
  onClose: () => void;
}

export default function CookieBanner({
  onAcceptAll,
  onRejectAll,
  onOpenSettings,
  onClose,
}: CookieBannerProps) {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-background border-t border-border p-4 shadow-lg">
      <div className="container mx-auto max-w-4xl">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <div className="flex items-center gap-3 flex-1">
            <div className="flex-shrink-0">
              <Cookie className="h-6 w-6 text-primary" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-foreground mb-1">
                Utilizamos cookies
              </h3>
              <p className="text-sm text-muted-foreground">
                Utilizamos cookies para mejorar tu experiencia, analizar el tráfico del sitio y personalizar el contenido.
                <button
                  onClick={onOpenSettings}
                  className="text-primary hover:underline ml-1"
                >
                  Configurar cookies
                </button>
              </p>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
            <Button
              variant="outline"
              size="sm"
              onClick={onRejectAll}
              className="w-full sm:w-auto"
            >
              Rechazar todas
            </Button>
            <Button
              size="sm"
              onClick={onAcceptAll}
              className="w-full sm:w-auto"
            >
              Aceptar todas
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
