import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { CookieConsent } from "@/contexts/CookieContext";
import { Check, Save, X as XIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

interface CookieSettingsProps {
  isOpen: boolean;
  onClose: () => void;
  consent: CookieConsent | null;
  onSave: (consent: Partial<CookieConsent>) => void;
  onAcceptAll: () => void;
  onRejectAll: () => void;
}

const CookieSettings = ({
  isOpen,
  onClose,
  consent,
  onSave,
  onAcceptAll,
  onRejectAll,
}: CookieSettingsProps) => {
  const [localConsent, setLocalConsent] = useState({
    necessary: true,
    analytics: false,
    advertising: false,
  });

  useEffect(() => {
    if (consent) {
      setLocalConsent({
        necessary: consent.necessary,
        analytics: consent.analytics,
        advertising: consent.advertising,
      });
    }
  }, [consent]);

  const handleSave = () => {
    onSave(localConsent);
    onClose();
  };

  const handleAcceptAll = () => {
    onAcceptAll();
    onClose();
  };

  const handleRejectAll = () => {
    onRejectAll();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Configuración de Cookies</DialogTitle>
          <DialogDescription>
            Configura tus preferencias de cookies para personalizar tu experiencia en la plataforma.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          <div className="text-sm text-gray-600">
            <p className="mb-4">
              Utilizamos cookies para mejorar tu experiencia en nuestra
              plataforma. Puedes configurar tus preferencias para cada tipo de
              cookie. Para más información, consulta nuestra{" "}
              <Link
                to="/legal?tab=cookies"
                className="text-primary hover:text-accent underline"
              >
                Política de Cookies
              </Link>
            </p>
          </div>

          {/* Cookies Necesarias */}
          <div className="border rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <div>
                <h3 className="font-semibold text-gray-900">
                  Cookies Necesarias
                </h3>
                <p className="text-sm text-gray-600">
                  Imprescindibles para el funcionamiento del sitio
                </p>
              </div>
              <div className="flex items-center space-x-2">
                <Check className="h-4 w-4 text-green-600" />
                <span className="text-sm text-green-600 font-medium">
                  Siempre activas
                </span>
              </div>
            </div>
            <p className="text-sm text-gray-600">
              Necesarias para el funcionamiento básico del sitio web, incluyendo
              inicio de sesión, seguridad y navegación.
            </p>
          </div>

          {/* Cookies Analíticas */}
          <div className="border rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <div>
                <h3 className="font-semibold text-gray-900">
                  Cookies Analíticas
                </h3>
                <p className="text-sm text-gray-600">
                  Google Analytics 4 - Análisis de uso de la plataforma
                </p>
              </div>
              <Switch
                checked={localConsent.analytics}
                onCheckedChange={(checked) =>
                  setLocalConsent((prev) => ({ ...prev, analytics: checked }))
                }
              />
            </div>
            <p className="text-sm text-gray-600">
              Recopilan información anónima sobre cómo usas nuestra plataforma
              para mejorar su funcionamiento.
            </p>
          </div>

          {/* Cookies Publicitarias */}
          <div className="border rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <div>
                <h3 className="font-semibold text-gray-900">
                  Cookies Publicitarias
                </h3>
                <p className="text-sm text-gray-600">
                  Google Ads y Meta Ads - Anuncios personalizados
                </p>
              </div>
              <Switch
                checked={localConsent.advertising}
                onCheckedChange={(checked) =>
                  setLocalConsent((prev) => ({ ...prev, advertising: checked }))
                }
              />
            </div>
            <p className="text-sm text-gray-600">
              Permiten mostrar anuncios personalizados basados en tus intereses
              y medir la eficacia de las campañas publicitarias.
            </p>
          </div>

          {/* Botones de acción */}
          <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t">
            <Button
              variant="outline"
              onClick={handleRejectAll}
              className="flex-1"
            >
              <XIcon className="h-4 w-4 mr-2" />
              Rechazar todas
            </Button>

            <Button
              variant="outline"
              onClick={handleAcceptAll}
              className="flex-1"
            >
              <Check className="h-4 w-4 mr-2" />
              Aceptar todas
            </Button>

            <Button onClick={handleSave} className="flex-1">
              <Save className="h-4 w-4 mr-2" />
              Guardar preferencias
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CookieSettings;
