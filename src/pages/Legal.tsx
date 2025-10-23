import { AuthenticatedLayout } from "@/components/layouts/AuthenticatedLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

// Componente que solo contiene el contenido sin layout
export function LegalContent() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Información Legal</h1>
        <p className="text-muted-foreground">Términos, condiciones y políticas</p>
      </div>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Términos de Servicio</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">
              Al utilizar Sports Analyzer, aceptas nuestros términos de servicio.
            </p>
            <div className="space-y-2">
              <h3 className="font-semibold">1. Uso del Servicio</h3>
              <p className="text-sm text-muted-foreground">
                El servicio está destinado para análisis deportivo profesional y personal.
                No debes usar el servicio para actividades ilegales o no autorizadas.
              </p>
            </div>
            <div className="space-y-2">
              <h3 className="font-semibold">2. Contenido del Usuario</h3>
              <p className="text-sm text-muted-foreground">
                Eres responsable del contenido que subas al servicio. Asegúrate de tener
                los derechos necesarios sobre cualquier material que compartas.
              </p>
            </div>
            <div className="space-y-2">
              <h3 className="font-semibold">3. Privacidad</h3>
              <p className="text-sm text-muted-foreground">
                Respetamos tu privacidad y protegemos tus datos según nuestra política
                de privacidad. Los videos y datos de análisis se procesan de forma segura.
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Política de Privacidad</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">
              Información sobre cómo recopilamos, usamos y protegemos tus datos.
            </p>
            <div className="space-y-2">
              <h3 className="font-semibold">Recopilación de Datos</h3>
              <p className="text-sm text-muted-foreground">
                Recopilamos información que nos proporcionas directamente, como tu nombre,
                email y videos de análisis deportivo.
              </p>
            </div>
            <div className="space-y-2">
              <h3 className="font-semibold">Uso de Datos</h3>
              <p className="text-sm text-muted-foreground">
                Utilizamos tus datos para proporcionar el servicio de análisis, mejorar
                nuestras funcionalidades y comunicarnos contigo.
              </p>
            </div>
            <div className="space-y-2">
              <h3 className="font-semibold">Protección de Datos</h3>
              <p className="text-sm text-muted-foreground">
                Implementamos medidas de seguridad técnicas y organizativas para proteger
                tus datos contra acceso no autorizado.
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Cookies</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">
              Utilizamos cookies para mejorar tu experiencia en nuestro sitio web.
            </p>
            <div className="space-y-2">
              <h3 className="font-semibold">Tipos de Cookies</h3>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• <strong>Necesarias:</strong> Esenciales para el funcionamiento del sitio</li>
                <li>• <strong>Analíticas:</strong> Nos ayudan a entender cómo usas el sitio</li>
                <li>• <strong>Funcionales:</strong> Mejoran la funcionalidad y personalización</li>
              </ul>
            </div>
            <div className="space-y-2">
              <h3 className="font-semibold">Gestionar Cookies</h3>
              <p className="text-sm text-muted-foreground">
                Puedes gestionar tus preferencias de cookies en cualquier momento
                desde la configuración de tu cuenta.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// Componente principal que incluye el layout (para uso independiente)
export default function Legal() {
  return (
    <AuthenticatedLayout>
      <LegalContent />
    </AuthenticatedLayout>
  );
}
