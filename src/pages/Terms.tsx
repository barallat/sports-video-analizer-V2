import { PublicLayout } from "@/components/layouts/PublicLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function Terms() {
  return (
    <PublicLayout>
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto space-y-8">
          <div className="text-center space-y-4">
            <h1 className="text-4xl font-bold text-foreground">Términos de Servicio</h1>
            <p className="text-xl text-muted-foreground">
              Última actualización: {new Date().toLocaleDateString('es-ES')}
            </p>
          </div>

          <Card>
            <CardContent className="space-y-6 pt-6">
              <div className="space-y-4">
                <h2 className="text-2xl font-semibold">1. Aceptación de los Términos</h2>
                <p className="text-muted-foreground">
                  Al acceder y utilizar Sports Analyzer, aceptas estar sujeto a estos términos de servicio.
                  Si no estás de acuerdo con alguna parte de estos términos, no debes utilizar nuestro servicio.
                </p>
              </div>

              <div className="space-y-4">
                <h2 className="text-2xl font-semibold">2. Descripción del Servicio</h2>
                <p className="text-muted-foreground">
                  Sports Analyzer es una plataforma de análisis deportivo que utiliza inteligencia artificial
                  para analizar videos deportivos y proporcionar insights sobre el rendimiento.
                </p>
              </div>

              <div className="space-y-4">
                <h2 className="text-2xl font-semibold">3. Uso Aceptable</h2>
                <p className="text-muted-foreground">Puedes usar nuestro servicio para:</p>
                <ul className="list-disc list-inside text-muted-foreground space-y-1">
                  <li>Analizar videos deportivos para mejorar el rendimiento</li>
                  <li>Gestionar equipos y deportistas</li>
                  <li>Generar reportes y estadísticas</li>
                  <li>Compartir análisis con tu equipo</li>
                </ul>
                <p className="text-muted-foreground">No puedes usar nuestro servicio para:</p>
                <ul className="list-disc list-inside text-muted-foreground space-y-1">
                  <li>Actividades ilegales o no autorizadas</li>
                  <li>Violar derechos de propiedad intelectual</li>
                  <li>Interferir con el funcionamiento del servicio</li>
                  <li>Intentar acceder a cuentas de otros usuarios</li>
                </ul>
              </div>

              <div className="space-y-4">
                <h2 className="text-2xl font-semibold">4. Contenido del Usuario</h2>
                <p className="text-muted-foreground">
                  Eres responsable del contenido que subas a nuestra plataforma. Asegúrate de tener
                  los derechos necesarios sobre cualquier material que compartas.
                </p>
              </div>

              <div className="space-y-4">
                <h2 className="text-2xl font-semibold">5. Privacidad</h2>
                <p className="text-muted-foreground">
                  Tu privacidad es importante para nosotros. Consulta nuestra Política de Privacidad
                  para entender cómo recopilamos, usamos y protegemos tu información.
                </p>
              </div>

              <div className="space-y-4">
                <h2 className="text-2xl font-semibold">6. Modificaciones</h2>
                <p className="text-muted-foreground">
                  Nos reservamos el derecho de modificar estos términos en cualquier momento.
                  Te notificaremos sobre cambios significativos a través de nuestro servicio.
                </p>
              </div>

              <div className="space-y-4">
                <h2 className="text-2xl font-semibold">7. Contacto</h2>
                <p className="text-muted-foreground">
                  Si tienes preguntas sobre estos términos, puedes contactarnos a través de
                  nuestro formulario de contacto o enviando un email a legal@sportsanalyzer.com
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </PublicLayout>
  );
}
