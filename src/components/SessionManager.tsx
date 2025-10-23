import { useEffect, useRef, useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';

/**
 * SessionManager: Maneja cierre de sesión global por inactividad, expiración de sesión,
 * y sincronización de logout entre pestañas. Debe envolver la app (dentro de AuthProvider).
 */
export function SessionManager({ children }: { children: React.ReactNode }) {
  const { user, signOut, session } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const inactivityTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastActivityRef = useRef<number>(Date.now());

  // --- Inactividad global ---
  const resetInactivityTimer = useCallback(() => {
    lastActivityRef.current = Date.now();
    if (inactivityTimeoutRef.current) {
      clearTimeout(inactivityTimeoutRef.current);
    }
    if (user) {
      inactivityTimeoutRef.current = setTimeout(() => {
        handleLogout('inactivity');
      }, 10 * 60 * 1000); // 10 minutos
    }
  }, [user]);

  // --- Logout y redirección ---
  const handleLogout = useCallback(async (reason?: string) => {
    await signOut();
    localStorage.setItem('force-logout', String(Date.now())); // Para sincronizar entre pestañas
    navigate('/'); // Redirige al login
  }, [signOut, navigate]);

  // --- Eventos de actividad global ---
  useEffect(() => {
    if (!user) return;
    resetInactivityTimer();
    const events = ['mousemove', 'keydown', 'click', 'touchstart', 'scroll'];
    events.forEach(e => document.addEventListener(e, resetInactivityTimer));
    return () => {
      if (inactivityTimeoutRef.current) clearTimeout(inactivityTimeoutRef.current);
      events.forEach(e => document.removeEventListener(e, resetInactivityTimer));
    };
  }, [user, resetInactivityTimer]);

  // --- Chequeo periódico de validez de sesión ---
  useEffect(() => {
    if (!user) return;
    const interval = setInterval(async () => {
      const { data, error } = await supabase.auth.getSession();
      if (!data.session || error) {
        handleLogout('session-expired');
      }
    }, 60 * 1000); // Cada minuto
    return () => clearInterval(interval);
  }, [user, handleLogout]);

  // --- Logout cruzado entre pestañas ---
  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === 'force-logout') {
        handleLogout('cross-tab');
      }
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, [handleLogout]);

  // --- Detectar navegación a rutas públicas y cerrar sesión ---
  useEffect(() => {
    const currentPath = location.pathname;
    const publicPaths = ['/public-legal', '/legal', '/terms', '/privacy'];
    const isPublicPath = publicPaths.some(path => currentPath.startsWith(path));
    
    // Si el usuario está autenticado y navega a una ruta pública, cerrar sesión
    if (user && isPublicPath) {
      console.log('User navigated to public route, closing session');
      handleLogout('public-navigation');
    }
  }, [location.pathname, user, handleLogout]);

  // --- Si el usuario desaparece (token inválido, refresh, etc) ---
  useEffect(() => {
    if (!user && session === null) {
      // Solo redirige al login si estamos en una página protegida
      const currentPath = window.location.pathname;
      const protectedPaths = ['/dashboard', '/profile', '/settings'];
      const isProtectedPath = protectedPaths.some(path => currentPath.startsWith(path));
      
      if (isProtectedPath) {
        navigate('/');
      }
    }
  }, [user, session, navigate]);

  return <>{children}</>;
} 