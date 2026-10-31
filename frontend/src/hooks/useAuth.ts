import { useCallback, useEffect, useState } from 'react';
import { authService } from '../services/auth.service';
import type { Usuario } from '../types/auth';

const TOKEN_KEY = 'restaurante-token';

/** Obtiene el token almacenado en localStorage. */
export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

/** Almacena el token en localStorage. */
export function setToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token);
}

/** Elimina el token de localStorage. */
export function removeToken(): void {
  localStorage.removeItem(TOKEN_KEY);
}

/**
 * Hook de autenticación. Gestiona el estado del usuario autenticado
 * y provee funciones para login y logout.
 */
export function useAuth() {
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [cargando, setCargando] = useState(true);

  // Verificar sesión existente al montar.
  useEffect(() => {
    const token = getToken();
    if (!token) {
      setCargando(false);
      return;
    }

    authService
      .user()
      .then(setUsuario)
      .catch(() => removeToken())
      .finally(() => setCargando(false));
  }, []);

  const login = useCallback(async (correo: string, contrasena: string) => {
    const respuesta = await authService.login({ correo, contrasena });
    setToken(respuesta.token);
    setUsuario(respuesta.usuario);
  }, []);

  const logout = useCallback(async () => {
    try {
      await authService.logout();
    } finally {
      removeToken();
      setUsuario(null);
    }
  }, []);

  return {
    usuario,
    cargando,
    autenticado: !!usuario,
    login,
    logout,
  };
}
