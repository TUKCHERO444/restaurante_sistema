import { useCallback, useEffect, useState } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { LogOut, Menu } from 'lucide-react';
import { Sidebar } from '@/components/Sidebar';
import { ThemeToggle } from '@/components/ThemeToggle';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import { obtenerModulo } from '@/config/navigation';
import { cn } from '@/lib/utils';

/**
 * Layout del panel de administración (AdminLTE).
 * Sidebar fijo + navbar superior + contenido fluido.
 */
export function AdminLayout() {
  const [sidebarColapsado, setSidebarColapsado] = useState(false);
  /** Ruta del módulo en el que se abrió el cajón; `null` significa cerrado. */
  const [cajonAbiertoEn, setCajonAbiertoEn] = useState<string | null>(null);
  const { usuario, logout } = useAuth();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const esMovil = useMediaQuery('(max-width: 767px)');

  // El cajón pertenece al módulo en el que se abrió: al cambiar de módulo
  // se contrae solo y deja el módulo a la vista.
  const sidebarMovilAbierto = esMovil && cajonAbiertoEn === pathname;

  // Al cambiar de módulo o al pasar a escritorio el cajón se contrae.
  const [ajustes, setAjustes] = useState({ pathname, esMovil });
  if (ajustes.pathname !== pathname || ajustes.esMovil !== esMovil) {
    const cambioDeModulo = ajustes.pathname !== pathname;
    setAjustes({ pathname, esMovil });
    if (cambioDeModulo || !esMovil) setCajonAbiertoEn(null);
  }

  const abrirSidebarMovil = useCallback(
    () => setCajonAbiertoEn(pathname),
    [pathname],
  );
  const cerrarSidebarMovil = useCallback(() => setCajonAbiertoEn(null), []);

  const modulo = obtenerModulo(pathname);

  // Escape cierra el cajón móvil.
  useEffect(() => {
    if (!sidebarMovilAbierto) return;

    const alPresionar = (evento: KeyboardEvent) => {
      if (evento.key === 'Escape') cerrarSidebarMovil();
    };

    window.addEventListener('keydown', alPresionar);
    return () => window.removeEventListener('keydown', alPresionar);
  }, [sidebarMovilAbierto, cerrarSidebarMovil]);

  // Bloquea el desplazamiento del fondo mientras el cajón está abierto.
  useEffect(() => {
    if (!sidebarMovilAbierto) return;

    const previo = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previo;
    };
  }, [sidebarMovilAbierto]);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className="flex min-h-svh bg-background">
      {/* Overlay para móvil */}
      {sidebarMovilAbierto && esMovil && (
        <div
          className="fixed inset-0 z-30 bg-black/50 md:hidden"
          onClick={cerrarSidebarMovil}
          aria-hidden
        />
      )}

      {/* Sidebar */}
      <Sidebar
        colapsado={sidebarColapsado}
        onAlternarColapso={() => setSidebarColapsado(!sidebarColapsado)}
        sidebarMovilAbierto={sidebarMovilAbierto}
        onCerrarMovil={cerrarSidebarMovil}
      />

      {/* Contenido principal */}
      <div
        className={cn(
          'flex flex-1 flex-col transition-all duration-200',
          sidebarColapsado ? 'md:ml-16' : 'md:ml-64',
        )}
      >
        {/* Navbar */}
        <header className="sticky top-0 z-20 flex h-16 items-center justify-between gap-3 border-b border-border bg-navbar px-4 sm:px-6">
          <div className="flex min-w-0 items-center gap-3">
            <Button
              type="button"
              variant="outline"
              size="icon"
              className="md:hidden"
              onClick={abrirSidebarMovil}
              aria-label="Abrir menú de navegación"
              aria-expanded={sidebarMovilAbierto}
              aria-controls="sidebar-principal"
            >
              <Menu className="size-4" aria-hidden />
            </Button>
            <div className="min-w-0">
              <h1 className="truncate text-lg font-semibold text-navbar-foreground">
                {modulo.label}
              </h1>
              <p className="hidden text-xs text-muted-foreground sm:block">
                Panel de administración
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <ThemeToggle />
            {usuario && (
              <div className="hidden items-center gap-2 text-sm text-muted-foreground sm:flex">
                <span>{usuario.nombre}</span>
              </div>
            )}
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={handleLogout}
              aria-label="Cerrar sesión"
              title="Cerrar sesión"
            >
              <LogOut className="size-4" aria-hidden />
            </Button>
          </div>
        </header>

        {/* Contenido */}
        <main className="flex-1 p-4 sm:p-6">
          <Outlet />
        </main>

        {/* Footer */}
        <footer className="border-t border-border bg-footer px-4 py-3 sm:px-6">
          <p className="text-xs text-muted-foreground">
            Sistema de gestión para restaurante · v1.0
          </p>
        </footer>
      </div>
    </div>
  );
}
