import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { Video, Target, BarChart3, Eye, EyeOff, User, Users } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { useSportConfigContext } from '@/contexts/SportConfigContext';
import { supabase } from '@/integrations/supabase/client';

export function LoginForm() {
  const { signIn, signUp } = useAuth();
  const { toast } = useToast();
  const { appName, appDescription, features, database, isMultiSport } = useSportConfigContext();
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [registerName, setRegisterName] = useState('');
  const [registerEmail, setRegisterEmail] = useState('');
  const [registerPassword, setRegisterPassword] = useState('');
  const [showRegisterPassword, setShowRegisterPassword] = useState(false);
  const [userRole, setUserRole] = useState<'athlete' | 'coach'>('athlete');
  const [clubName, setClubName] = useState('');
  const [clubKey, setClubKey] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    const { error } = await signIn(loginEmail, loginPassword);
    
    if (error) {
      toast({
        variant: "destructive",
        title: "Error al iniciar sesión",
        description: error.message
      });
    }
    
    setLoading(false);
  };

  const validatePassword = (password: string) => {
    // Mínimo 8 caracteres, 1 mayúscula, 1 minúscula, 1 número, 1 carácter especial
    return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d]).{8,}$/.test(password);
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (!validatePassword(registerPassword)) {
      toast({
        variant: "destructive",
        title: "Contraseña no válida",
        description: "Debe tener al menos 8 caracteres, 1 mayúscula, 1 minúscula, 1 número y 1 carácter especial."
      });
      setLoading(false);
      return;
    }

    // Validar que si es coach, debe tener nombre del club
    if (userRole === 'coach' && !clubName.trim()) {
      toast({
        variant: "destructive",
        title: "Campo requerido",
        description: "El nombre del club es obligatorio para gestores."
      });
      setLoading(false);
      return;
    }

    // Validar que si es athlete, debe tener clave de club válida
    if (userRole === 'athlete' && !clubKey.trim()) {
      toast({
        variant: "destructive",
        title: "Campo requerido",
        description: "La clave de club es obligatoria para deportistas."
      });
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
          toast({
            variant: "destructive",
            title: "Clave de club inválida",
            description: "La clave de club proporcionada no existe o no pertenece a un gestor."
          });
          setLoading(false);
          return;
        }

        // Usar el nombre del club del gestor
        const clubNameFromManager = clubData.club_name || '';
        setClubName(clubNameFromManager);
        
        // Llamar a signUp con el nombre del club del gestor
        const { error } = await signUp(registerEmail, registerPassword, registerName, userRole, clubNameFromManager, clubKey);
        
        if (error) {
          toast({
            variant: "destructive",
            title: "Error al registrarse",
            description: error.message
          });
          setLoading(false);
          return;
        }

        // Si estamos en modo deporte individual, asociar el usuario al deporte y loguear automáticamente
        if (features.skipSportsConfig && database.sportFilter && database.sportFilter !== 'all') {
          // Esperar a que el usuario esté disponible en la tabla usuarios
          let usuarioId = null;
          for (let i = 0; i < 10; i++) {
            const { data: userData } = await supabase
              .from('usuarios')
              .select('id')
              .eq('email', registerEmail)
              .single();
            if (userData?.id) {
              usuarioId = userData.id;
              break;
            }
            await new Promise(res => setTimeout(res, 500));
          }
          if (usuarioId) {
            // Insertar en usuario_deportes
            await supabase.from('usuario_deportes').insert({
              usuario_id: usuarioId,
              deporte_id: database.sportFilter
            });
            // Loguear automáticamente
            await signIn(registerEmail, registerPassword);
            window.location.reload();
            setLoading(false);
            return;
          }
        }

        toast({
          title: "Registro exitoso",
          description: "Por favor, revisa tu email para confirmar tu cuenta."
        });
        setLoading(false);
        return;
      } catch (error) {
        console.error('Error validating club key:', error);
        toast({
          variant: "destructive",
          title: "Error de validación",
          description: "Error al validar la clave de club. Inténtalo de nuevo."
        });
        setLoading(false);
        return;
      }
    }
    
    const { error } = await signUp(registerEmail, registerPassword, registerName, userRole, clubName, clubKey);
    
    if (error) {
      toast({
        variant: "destructive",
        title: "Error al registrarse",
        description: error.message
      });
      setLoading(false);
      return;
    }

    // Si estamos en modo deporte individual, asociar el usuario al deporte y loguear automáticamente
    if (features.skipSportsConfig && database.sportFilter && database.sportFilter !== 'all') {
      // Esperar a que el usuario esté disponible en la tabla usuarios
      let usuarioId = null;
      for (let i = 0; i < 10; i++) {
        const { data: userData } = await supabase
          .from('usuarios')
          .select('id')
          .eq('email', registerEmail)
          .single();
        if (userData?.id) {
          usuarioId = userData.id;
          break;
        }
        await new Promise(res => setTimeout(res, 500));
      }
      if (usuarioId) {
        // Insertar en usuario_deportes
        await supabase.from('usuario_deportes').insert({
          usuario_id: usuarioId,
          deporte_id: database.sportFilter
        });
        // Loguear automáticamente
        await signIn(registerEmail, registerPassword);
        window.location.reload();
        setLoading(false);
        return;
      }
    }

    toast({
      title: "Registro exitoso",
      description: "Por favor, revisa tu email para confirmar tu cuenta."
    });
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/20 via-background to-accent/20 flex items-center justify-center p-4">
      <div className="w-full max-w-6xl grid lg:grid-cols-2 gap-8 items-center">
        {/* Sección de presentación */}
        <div className="hidden lg:block space-y-8 animate-fade-in">
          <div className="text-center space-y-4">
            <div className="flex items-center justify-center space-x-2 mb-6">
              <Video className="h-12 w-12 text-primary" />
              <h1 className="text-4xl font-bold" style={{
                background: `linear-gradient(135deg, var(--sport-primary) 0%, var(--sport-accent) 100%)`,
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text'
              }}>
                {appName}
              </h1>
            </div>
            <p className="text-xl text-muted-foreground max-w-md mx-auto">
              {appDescription}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div className="text-center space-y-3 p-4 rounded-lg bg-card/50 backdrop-blur-sm">
              <Target className="h-8 w-8 mx-auto" style={{ color: 'var(--sport-primary)' }} />
              <h3 className="font-semibold">Análisis Preciso</h3>
              <p className="text-sm text-muted-foreground">
                IA avanzada para evaluar técnicas deportivas
              </p>
            </div>
            <div className="text-center space-y-3 p-4 rounded-lg bg-card/50 backdrop-blur-sm">
              <BarChart3 className="h-8 w-8 mx-auto" style={{ color: 'var(--sport-accent)' }} />
              <h3 className="font-semibold">Estadísticas</h3>
              <p className="text-sm text-muted-foreground">
                Reportes detallados de rendimiento
              </p>
            </div>
          </div>
        </div>

        {/* Formulario de login/registro */}
        <div className="w-full max-w-md mx-auto animate-bounce-in">
          <Card className="shadow-2xl border-0 glass-card">
            <CardHeader className="text-center space-y-2">
              <div className="flex items-center justify-center space-x-2 lg:hidden mb-4">
                <Video className="h-8 w-8 text-primary" />
                <CardTitle className="text-2xl" style={{
                  background: `linear-gradient(135deg, var(--sport-primary) 0%, var(--sport-accent) 100%)`,
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text'
                }}>
                  {appName}
                </CardTitle>
              </div>
              <CardDescription>
                Accede a tu cuenta o crea una nueva para comenzar
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="login" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="login">Iniciar Sesión</TabsTrigger>
                  <TabsTrigger value="register">Registrarse</TabsTrigger>
                </TabsList>
                
                <TabsContent value="login" className="space-y-4">
                  <form onSubmit={handleLogin} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="login-email">Email</Label>
                      <Input
                        id="login-email"
                        type="email"
                        placeholder="tu@email.com"
                        value={loginEmail}
                        onChange={(e) => setLoginEmail(e.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="login-password">Contraseña</Label>
                      <div className="relative">
                        <Input
                          id="login-password"
                          type={showLoginPassword ? "text" : "password"}
                          placeholder="Tu contraseña"
                          value={loginPassword}
                          onChange={(e) => setLoginPassword(e.target.value)}
                          required
                          className="pr-10"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                          onClick={() => setShowLoginPassword((prev) => !prev)}
                        >
                          {showLoginPassword ? (
                            <EyeOff className="h-4 w-4 text-muted-foreground" />
                          ) : (
                            <Eye className="h-4 w-4 text-muted-foreground" />
                          )}
                        </Button>
                      </div>
                    </div>
                    <Button 
                      type="submit" 
                      className="w-full sports-gradient hover:opacity-90 transition-opacity"
                      disabled={loading}
                    >
                      {loading ? 'Iniciando...' : 'Iniciar Sesión'}
                    </Button>
                  </form>
                </TabsContent>
                
                <TabsContent value="register" className="space-y-4">
                  <form onSubmit={handleRegister} className="space-y-4">
                    {/* Selector de rol */}
                    <div className="space-y-3">
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
                      <Label htmlFor="register-name">Nombre completo</Label>
                      <Input
                        id="register-name"
                        type="text"
                        placeholder="Tu nombre completo"
                        value={registerName}
                        onChange={(e) => setRegisterName(e.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="register-email">Email</Label>
                      <Input
                        id="register-email"
                        type="email"
                        placeholder="tu@email.com"
                        value={registerEmail}
                        onChange={(e) => setRegisterEmail(e.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="register-password">Contraseña</Label>
                      <div className="relative">
                        <Input
                          id="register-password"
                          type={showRegisterPassword ? "text" : "password"}
                          placeholder="Crea una contraseña segura"
                          value={registerPassword}
                          onChange={(e) => setRegisterPassword(e.target.value)}
                          required
                          className="pr-10"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                          onClick={() => setShowRegisterPassword((prev) => !prev)}
                        >
                          {showRegisterPassword ? (
                            <EyeOff className="h-4 w-4 text-muted-foreground" />
                          ) : (
                            <Eye className="h-4 w-4 text-muted-foreground" />
                          )}
                        </Button>
                      </div>
                    </div>
                    
                    {/* Campo de nombre del club - solo visible para gestores */}
                    {userRole === 'coach' && (
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
                    {userRole === 'athlete' && (
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
                    
                    <Button 
                      type="submit" 
                      className="w-full bg-accent hover:bg-accent/90 transition-colors"
                      disabled={loading || (userRole === 'athlete' && isMultiSport)}
                    >
                      {loading ? 'Creando cuenta...' : 
                       userRole === 'athlete' && isMultiSport ? 'Registro no disponible en multideporte' : 
                       'Crear Cuenta'}
                    </Button>
                  </form>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
