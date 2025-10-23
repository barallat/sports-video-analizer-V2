import { PublicLayout } from "@/components/layouts/PublicLayout";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/useAuth";
import { useState } from "react";
import { Navigate, useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "sonner";
import { Eye, EyeOff, User, Users } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

export default function Auth() {
  console.log("Auth component is rendering");
  const [searchParams] = useSearchParams();
  const isRegister = searchParams.get("register") === "true";
  const [isRegistering, setIsRegistering] = useState(isRegister);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [userRole, setUserRole] = useState<'athlete' | 'coach'>('athlete');
  const [clubName, setClubName] = useState('');
  const [clubKey, setClubKey] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { signIn, signUp, user, loading: authLoading } = useAuth();

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground">Cargando...</p>
        </div>
      </div>
    );
  }

  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  const validatePassword = (password: string) => {
    // Mínimo 8 caracteres, 1 mayúscula, 1 minúscula, 1 número, 1 carácter especial
    return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d]).{8,}$/.test(password);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isRegistering) {
        // Validar contraseña
        if (!validatePassword(password)) {
          toast.error("La contraseña debe tener al menos 8 caracteres, 1 mayúscula, 1 minúscula, 1 número y 1 carácter especial.");
          setLoading(false);
          return;
        }

        // Validar que si es coach, debe tener nombre del club
        if (userRole === 'coach' && !clubName.trim()) {
          toast.error("El nombre del club es obligatorio para gestores.");
          setLoading(false);
          return;
        }

        // Validar que si es athlete, debe tener clave de club válida
        if (userRole === 'athlete' && !clubKey.trim()) {
          toast.error("La clave de club es obligatoria para deportistas.");
          setLoading(false);
          return;
        }

        // Si es deportista, validar que la clave de club existe
        if (userRole === 'athlete') {
          try {
            const { data: clubData, error: clubError } = await supabase
              .from('usuarios')
              .select('id, club_name, clave_club')
              .eq('clave_club', clubKey.trim())
              .eq('role', 'coach')
              .single();

            if (clubError || !clubData) {
              toast.error("La clave de club proporcionada no existe o no pertenece a un gestor.");
              setLoading(false);
              return;
            }

            // Usar el nombre del club del gestor
            const clubNameFromManager = clubData.club_name || '';
            setClubName(clubNameFromManager);
            
            // Llamar a signUp con el nombre del club del gestor
            const result = await signUp(email, password, name, userRole, clubNameFromManager, clubKey);
            if (result.error) {
              toast.error(result.error.message || "Error al crear la cuenta");
              setLoading(false);
              return;
            }
          } catch (error) {
            toast.error("Error al validar la clave de club");
            setLoading(false);
            return;
          }
        } else {
          // Para coaches
          const result = await signUp(email, password, name, userRole, clubName, '');
          if (result.error) {
            toast.error(result.error.message || "Error al crear la cuenta");
            setLoading(false);
            return;
          }
        }
        
        toast.success("¡Cuenta creada exitosamente!");
      } else {
        const result = await signIn(email, password);
        if (result.error) {
          toast.error(result.error.message || "Error al iniciar sesión");
          return;
        }
        toast.success("¡Bienvenido de nuevo!");
      }
    } catch (error) {
      console.error("Error in handleSubmit:", error);
      toast.error(
        isRegistering ? "Error al crear la cuenta" : "Error al iniciar sesión"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <PublicLayout>
      <div className="flex items-center justify-center bg-muted/30 p-4 min-h-[calc(100vh-200px)]">
        <Card className="w-full max-w-md">
          <CardHeader className="space-y-1 pb-4">
            <div className="flex justify-center mb-3">
              <div className="h-10 w-10 rounded-lg bg-primary flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-lg">
                  S
                </span>
              </div>
            </div>
            <CardTitle className="text-xl text-center">
              {isRegistering ? "Crear cuenta" : "Iniciar sesión"}
            </CardTitle>
            <CardDescription className="text-center text-sm">
              {isRegistering
                ? "Ingresa tus datos para crear tu cuenta"
                : "Ingresa tus credenciales para acceder"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-3">
              {isRegistering && (
                <>
                  {/* Selector de rol */}
                  <div className="space-y-2">
                    <Label>Tipo de usuario</Label>
                    <div className="grid grid-cols-2 gap-2">
                      <Button
                        type="button"
                        variant={userRole === 'athlete' ? 'default' : 'outline'}
                        className={`flex items-center space-x-2 ${
                          userRole === 'athlete' 
                            ? 'bg-primary text-primary-foreground' 
                            : 'hover:bg-muted'
                        }`}
                        onClick={() => setUserRole('athlete')}
                      >
                        <User className="h-4 w-4" />
                        <span>Deportista</span>
                      </Button>
                      <Button
                        type="button"
                        variant={userRole === 'coach' ? 'default' : 'outline'}
                        className={`flex items-center space-x-2 ${
                          userRole === 'coach' 
                            ? 'bg-primary text-primary-foreground' 
                            : 'hover:bg-muted'
                        }`}
                        onClick={() => setUserRole('coach')}
                      >
                        <Users className="h-4 w-4" />
                        <span>Gestor</span>
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="name">Nombre completo</Label>
                    <Input
                      id="name"
                      type="text"
                      placeholder="Tu nombre completo"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                    />
                  </div>
                </>
              )}
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="tu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Contraseña</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder={isRegistering ? "Crea una contraseña segura" : "••••••••"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="pr-10"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowPassword((prev) => !prev)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <Eye className="h-4 w-4 text-muted-foreground" />
                    )}
                  </Button>
                </div>
              </div>
              
              {/* Campo de nombre del club - solo visible para gestores */}
              {isRegistering && userRole === 'coach' && (
                <div className="space-y-2">
                  <Label htmlFor="club-name">Nombre del Club</Label>
                  <Input
                    id="club-name"
                    type="text"
                    placeholder="Nombre de tu club o institución"
                    value={clubName}
                    onChange={(e) => setClubName(e.target.value)}
                    required
                  />
                </div>
              )}

              {/* Campo de clave de club - solo visible para deportistas */}
              {isRegistering && userRole === 'athlete' && (
                <div className="space-y-2">
                  <Label htmlFor="club-key">Clave de Club</Label>
                  <Input
                    id="club-key"
                    type="text"
                    placeholder="Ingresa la clave de club proporcionada por tu gestor"
                    value={clubKey}
                    onChange={(e) => setClubKey(e.target.value)}
                    required
                  />
                  <p className="text-xs text-muted-foreground">
                    Solicita la clave de club a tu entrenador o gestor deportivo.
                  </p>
                </div>
              )}
              <Button type="submit" className="w-full" disabled={loading}>
                {loading
                  ? "Cargando..."
                  : isRegistering
                  ? "Registrarse"
                  : "Iniciar sesión"}
              </Button>
            </form>
            <div className="mt-4 text-center text-sm">
              <button
                type="button"
                onClick={() => setIsRegistering(!isRegistering)}
                className="text-primary hover:underline"
              >
                {isRegistering
                  ? "¿Ya tienes cuenta? Inicia sesión"
                  : "¿No tienes cuenta? Regístrate"}
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
    </PublicLayout>
  );
}
