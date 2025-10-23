import { PublicLayout } from "@/components/layouts/PublicLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function Privacy() {
  return (
    <PublicLayout>
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto space-y-8">
          <div className="text-center space-y-4">
            <h1 className="text-4xl font-bold text-foreground">Política de Privacidad</h1>
            <p className="text-xl text-muted-foreground">
              Última actualización: {new Date().toLocaleDateString('es-ES')}
            </p>
          </div>

          <Card>
            <CardContent className="space-y-6 pt-6">
              <div className="space-y-4">
                <h2 className="text-2xl font-semibold">1. Información que Recopilamos</h2>
                <p className="text-muted-foreground">
                  Recopilamos diferentes tipos de información para proporcionarte nuestro servicio:
                </p>
                <div className="space-y-3">
                  <div>
                    <h3 className="font-semibold">Información Personal</h3>
                    <ul className="list-disc list-inside text-muted-foreground space-y-1">
                      <li>Nombre y apellidos</li>
                      <li>Dirección de correo electrónico</li>
                      <li>Información de perfil deportivo</li>
                    </ul>
                  </div>
                  <div>
                    <h3 className="font-semibold">Contenido de Análisis</h3>
                    <ul className="list-disc list-inside text-muted-foreground space-y-1">
                      <li>Videos deportivos que subas</li>
                      <li>Datos de análisis generados</li>
                      <li>Reportes y estadísticas</li>
                    </ul>
                  </div>
                  <div>
                    <h3 className="font-semibold">Información Técnica</h3>
                    <ul className="list-disc list-inside text-muted-foreground space-y-1">
                      <li>Dirección IP</li>
                      <li>Tipo de navegador</li>
                      <li>Dispositivo utilizado</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h2 className="text-2xl font-semibold">2. Cómo Usamos tu Información</h2>
                <p className="text-muted-foreground">Utilizamos tu información para:</p>
                <ul className="list-disc list-inside text-muted-foreground space-y-1">
                  <li>Proporcionar el servicio de análisis deportivo</li>
                  <li>Mejorar nuestras funcionalidades</li>
                  <li>Comunicarnos contigo sobre el servicio</li>
                  <li>Garantizar la seguridad de la plataforma</li>
                  <li>Cumplir con obligaciones legales</li>
                </ul>
              </div>

              <div className="space-y-4">
                <h2 className="text-2xl font-semibold">3. Compartir Información</h2>
                <p className="text-muted-foreground">
                  No vendemos, alquilamos ni compartimos tu información personal con terceros,
                  excepto en las siguientes circunstancias:
                </p>
                <ul className="list-disc list-inside text-muted-foreground space-y-1">
                  <li>Con tu consentimiento explícito</li>
                  <li>Para cumplir con obligaciones legales</li>
                  <li>Con proveedores de servicios que nos ayudan a operar la plataforma</li>
                  <li>En caso de fusión, adquisición o venta de activos</li>
                </ul>
              </div>

              <div className="space-y-4">
                <h2 className="text-2xl font-semibold">4. Seguridad de los Datos</h2>
                <p className="text-muted-foreground">
                  Implementamos medidas de seguridad técnicas y organizativas para proteger
                  tu información:
                </p>
                <ul className="list-disc list-inside text-muted-foreground space-y-1">
                  <li>Cifrado de datos en tránsito y en reposo</li>
                  <li>Acceso restringido a la información personal</li>
                  <li>Monitoreo regular de seguridad</li>
                  <li>Capacitación del personal en privacidad</li>
                </ul>
              </div>

              <div className="space-y-4">
                <h2 className="text-2xl font-semibold">5. Tus Derechos</h2>
                <p className="text-muted-foreground">Tienes derecho a:</p>
                <ul className="list-disc list-inside text-muted-foreground space-y-1">
                  <li>Acceder a tu información personal</li>
                  <li>Corregir información inexacta</li>
                  <li>Eliminar tu información</li>
                  <li>Limitar el procesamiento de tu información</li>
                  <li>Portabilidad de datos</li>
                  <li>Oponerte al procesamiento</li>
                </ul>
              </div>

              <div className="space-y-4">
                <h2 className="text-2xl font-semibold">6. Cookies</h2>
                <p className="text-muted-foreground">
                  Utilizamos cookies para mejorar tu experiencia. Puedes gestionar tus
                  preferencias de cookies en cualquier momento.
                </p>
              </div>

              <div className="space-y-4">
                <h2 className="text-2xl font-semibold">7. Cambios en esta Política</h2>
                <p className="text-muted-foreground">
                  Podemos actualizar esta política de privacidad ocasionalmente.
                  Te notificaremos sobre cambios significativos.
                </p>
              </div>

              <div className="space-y-4">
                <h2 className="text-2xl font-semibold">8. Contacto</h2>
                <p className="text-muted-foreground">
                  Si tienes preguntas sobre esta política de privacidad, contacta con nosotros:
                </p>
                <ul className="list-disc list-inside text-muted-foreground space-y-1">
                  <li>Email: privacy@sportsanalyzer.com</li>
                  <li>Formulario de contacto en nuestro sitio web</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </PublicLayout>
  );
}
