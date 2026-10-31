import { UtensilsCrossed } from 'lucide-react';
import { Outlet } from 'react-router-dom';
import { ThemeToggle } from '@/components/ThemeToggle';

/** Diseño raíz: encabezado, contenido de la ruta y pie mínimo. */
export function RootLayout() {
  return (
    <div className="flex min-h-svh flex-col">
      <header className="border-b">
        <div className="mx-auto flex h-16 w-full max-w-5xl items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-2">
            <span className="flex size-9 items-center justify-center rounded-md bg-primary text-primary-foreground">
              <UtensilsCrossed className="size-5" aria-hidden />
            </span>
            <div className="leading-tight">
              <p className="font-semibold">Sistema de restaurante</p>
              <p className="text-xs text-muted-foreground">
                Base inicial · sin módulos todavía
              </p>
            </div>
          </div>
          <ThemeToggle />
        </div>
      </header>
      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-8 sm:px-6">
        <Outlet />
      </main>
      <footer className="border-t">
        <p className="mx-auto w-full max-w-5xl px-4 py-4 text-xs text-muted-foreground sm:px-6">
          React + Laravel API · Comunicación por HTTP/JSON
        </p>
      </footer>
    </div>
  );
}
