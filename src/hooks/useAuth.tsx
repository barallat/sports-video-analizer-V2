
import { useState, useEffect, createContext, useContext } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  signUp: (email: string, password: string, nombre: string, role?: string, clubName?: string, clubKey?: string) => Promise<{ error: any }>;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (email: string, password: string, nombre: string, role: string = 'athlete', clubName: string = '', clubKey: string = '') => {
    const redirectUrl = `${window.location.origin}/`;
    
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl,
        data: { 
          nombre,
          role: role === 'coach' ? 'coach' : 'athlete',
          club_name: clubName,
          club_key: clubKey
        }
      }
    });
    
    if (error) {
      return { error };
    }

    // Si el registro fue exitoso y tenemos un usuario, actualizar el role y otros campos si es necesario
    if (data.user && (role === 'athlete' || role === 'coach')) {
      try {
        // Esperar un momento para que el trigger cree el registro
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Buscar el usuario en la tabla usuarios
        const { data: userData, error: userError } = await supabase
          .from('usuarios')
          .select('id')
          .eq('auth_user_id', data.user.id)
          .single();

        if (userError) {
          console.error('Error finding user in usuarios table:', userError);
          return { error: userError };
        }

        // Actualizar el role y campos específicos según el tipo de usuario
        const updateData: any = { role: role };
        
        if (role === 'athlete') {
          updateData.clave_club = clubKey;
        } else if (role === 'coach') {
          updateData.club_name = clubName;
        }

        const { error: updateError } = await supabase
          .from('usuarios')
          .update(updateData)
          .eq('id', userData.id);

        if (updateError) {
          console.error('Error updating role and user data:', updateError);
          return { error: updateError };
        }
      } catch (error) {
        console.error('Error in post-signup role update:', error);
        return { error };
      }
    }
    
    return { error: null };
  };

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    
    return { error };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  return (
    <AuthContext.Provider value={{
      user,
      session,
      signUp,
      signIn,
      signOut,
      loading
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
