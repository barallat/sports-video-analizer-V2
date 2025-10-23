import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, User, Mail, Shield, Building, Save, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/contexts/LanguageContext';
import { supabase } from '@/integrations/supabase/client';

interface UserProfile {
  id: string;
  nombre: string;
  email: string;
  role: string;
  club_name: string | null;
  clave_club: string | null;
}

interface UserProfileViewProps {
  onBack: () => void;
  userName?: string;
  onLogout?: () => Promise<void>;
}

export function UserProfileView({ onBack, userName, onLogout }: UserProfileViewProps) {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedName, setEditedName] = useState('');
  const [editedClubName, setEditedClubName] = useState('');
  const { toast } = useToast();
  const { t } = useLanguage();

  useEffect(() => {
    loadUserProfile();
  }, []);

  const loadUserProfile = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        console.error('No user found');
        setLoading(false);
        return;
      }

      const { data: userData, error } = await supabase
        .from('usuarios')
        .select('id, nombre, email, role, club_name, clave_club')
        .eq('auth_user_id', user.id)
        .single();

      if (error) {
        console.error('Error loading user profile:', error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "No se pudo cargar el perfil del usuario"
        });
        return;
      }

      setProfile(userData);
      setEditedName(userData.nombre);
      setEditedClubName(userData.club_name || '');
    } catch (error) {
      console.error('Error loading user profile:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Error al cargar el perfil del usuario"
      });
    }
    setLoading(false);
  };

  const handleSave = async () => {
    if (!profile) return;

    setSaving(true);
    try {
      // Preparar los datos a actualizar
      const updateData: any = {
        nombre: editedName
      };

      // Solo permitir actualizar club_name si es un gestor
      if (profile.role === 'coach') {
        updateData.club_name = editedClubName;
      }

      const { data, error } = await supabase
        .from('usuarios')
        .update(updateData)
        .eq('id', profile.id)
        .select('id, nombre, email, role, club_name, clave_club')
        .single();

      if (error) {
        throw error;
      }

      setProfile(data);

      setIsEditing(false);
      toast({
        title: "Perfil actualizado",
        description: "Los cambios se han guardado correctamente"
      });
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudo actualizar el perfil"
      });
    }
    setSaving(false);
  };

  const handleCancel = () => {
    if (profile) {
      setEditedName(profile.nombre);
      setEditedClubName(profile.club_name || '');
    }
    setIsEditing(false);
  };

  const getRoleDisplayName = (role: string) => {
    switch (role) {
      case 'coach':
        return 'Gestor';
      case 'athlete':
        return 'Deportista';
      default:
        return role;
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'coach':
        return 'bg-blue-500';
      case 'athlete':
        return 'bg-green-500';
      default:
        return 'bg-gray-500';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center space-y-4">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto"></div>
          <p className="text-muted-foreground">{t('loading')}</p>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="flex items-center justify-center p-8">
        <Card className="glass-card max-w-md">
          <CardContent className="p-6 text-center">
            <h3 className="text-lg font-semibold mb-2">Error</h3>
            <p className="text-muted-foreground mb-4">No se pudo cargar el perfil del usuario</p>
            <Button onClick={onBack}>Volver</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="w-full p-4">
      <div className="space-y-6">
          {/* Información del perfil */}
          <Card className="glass-card">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center">
                    <User className="h-5 w-5 mr-2" />
                    Información Personal
                  </CardTitle>
                  <CardDescription>
                    Gestiona tu información personal y preferencias
                  </CardDescription>
                </div>
                {!isEditing && (
                  <Button onClick={() => setIsEditing(true)} variant="outline">
                    Editar Perfil
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Nombre de usuario */}
              <div className="space-y-2">
                <Label htmlFor="user-name" className="flex items-center">
                  <User className="h-4 w-4 mr-2" />
                  Nombre de usuario
                </Label>
                {isEditing ? (
                  <Input
                    id="user-name"
                    value={editedName}
                    onChange={(e) => setEditedName(e.target.value)}
                    placeholder="Tu nombre completo"
                  />
                ) : (
                  <div className="p-3 bg-muted rounded-md">
                    <span className="font-medium">{profile.nombre}</span>
                  </div>
                )}
              </div>

              {/* Email */}
              <div className="space-y-2">
                <Label htmlFor="user-email" className="flex items-center">
                  <Mail className="h-4 w-4 mr-2" />
                  Correo Electrónico
                </Label>
                <div className="p-3 bg-muted rounded-md">
                  <span className="font-medium">{profile.email}</span>
                  <span className="text-xs text-muted-foreground ml-2">(No editable)</span>
                </div>
              </div>

              {/* Rol */}
              <div className="space-y-2">
                <Label className="flex items-center">
                  <Shield className="h-4 w-4 mr-2" />
                  Perfil
                </Label>
                <div className="p-3 bg-muted rounded-md">
                  <Badge className={`${getRoleColor(profile.role)} text-white`}>
                    {getRoleDisplayName(profile.role)}
                  </Badge>
                  <span className="text-xs text-muted-foreground ml-2">(No editable)</span>
                </div>
              </div>

              {/* Nombre del club - visible para todos pero editable solo para gestores */}
              <div className="space-y-2">
                <Label htmlFor="club-name" className="flex items-center">
                  <Building className="h-4 w-4 mr-2" />
                  Nombre del Club
                </Label>
                {isEditing && profile.role === 'coach' ? (
                  <Input
                    id="club-name"
                    value={editedClubName}
                    onChange={(e) => setEditedClubName(e.target.value)}
                    placeholder="Nombre de tu club o institución"
                  />
                ) : (
                  <div className="p-3 bg-muted rounded-md">
                    <span className="font-medium">
                      {profile.club_name || 'No especificado'}
                    </span>
                    {profile.role === 'athlete' && (
                      <span className="text-xs text-muted-foreground ml-2">(No editable)</span>
                    )}
                  </div>
                )}
              </div>

              {/* Clave Club - solo para gestores */}
              {profile.role === 'coach' && (
                <div className="space-y-2">
                  <Label className="flex items-center">
                    <Shield className="h-4 w-4 mr-2" />
                    Clave Club
                  </Label>
                  <div className="p-3 bg-muted rounded-md">
                    <span className="font-medium font-mono text-lg">
                      {profile.clave_club || 'No generada'}
                    </span>
                    <span className="text-xs text-muted-foreground ml-2">(No editable)</span>
                  </div>
                </div>
              )}

              {/* Botones de acción cuando está editando */}
              {isEditing && (
                <div className="flex justify-end space-x-2 pt-4 border-t">
                  <Button
                    onClick={handleCancel}
                    variant="outline"
                    disabled={saving}
                  >
                    <X className="h-4 w-4 mr-2" />
                    Cancelar
                  </Button>
                  <Button
                    onClick={handleSave}
                    disabled={saving}
                  >
                    <Save className="h-4 w-4 mr-2" />
                    {saving ? 'Guardando...' : 'Guardar Cambios'}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
      </div>
    </div>
  );
}
