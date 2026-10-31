import { createBrowserRouter, Navigate } from 'react-router-dom';
import { AdminLayout } from '@/layouts/AdminLayout';
import { LoginPage } from '@/pages/LoginPage';
import { DashboardPage } from '@/pages/DashboardPage';
import { UsuariosPage } from '@/pages/UsuariosPage';
import { SalonDesignerPage } from '@/pages/SalonDesignerPage';
import { PosMapaPage } from '@/pages/PosMapaPage';
import { PosPedidoPage } from '@/pages/PosPedidoPage';
import { CategoriasPage } from '@/pages/CategoriasPage';
import { ProductosPage } from '@/pages/ProductosPage';
import { ClientesPage } from '@/pages/ClientesPage';
import { ReservasPage } from '@/pages/ReservasPage';
import { PedidosPage } from '@/pages/PedidosPage';
import { CajasPage } from '@/pages/CajasPage';
import { GastosPage } from '@/pages/GastosPage';
import { RepartidoresPage } from '@/pages/RepartidoresPage';
import { RepartosPage } from '@/pages/RepartosPage';
import { MovimientosInventarioPage } from '@/pages/MovimientosInventarioPage';
import { ConfiguracionesPage } from '@/pages/ConfiguracionesPage';
import { SeriesDocumentosPage } from '@/pages/SeriesDocumentosPage';
import { NotasCreditoPage } from '@/pages/NotasCreditoPage';
import { ResumenesDiariosPage } from '@/pages/ResumenesDiariosPage';
import { NotFoundPage } from '@/pages/NotFoundPage';
import { useAuth } from '@/hooks/useAuth';
import type { ReactNode } from 'react';

/**
 * Definición centralizada de rutas de la SPA.
 */
function RutaProtegida({ children }: { children: ReactNode }) {
  const { autenticado, cargando } = useAuth();

  if (cargando) {
    return (
      <div className="flex min-h-svh items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Cargando...</div>
      </div>
    );
  }

  if (!autenticado) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}

export const router = createBrowserRouter([
  {
    path: '/login',
    element: <LoginPage />,
  },
  {
    path: '/admin',
    element: (
      <RutaProtegida>
        <AdminLayout />
      </RutaProtegida>
    ),
    children: [
      { index: true, element: <DashboardPage /> },
      { path: 'usuarios', element: <UsuariosPage /> },
      { path: 'mesas', element: <SalonDesignerPage /> },
      { path: 'pos', element: <PosMapaPage /> },
      { path: 'pos/mesa/:mesaId', element: <PosPedidoPage /> },
      { path: 'categorias', element: <CategoriasPage /> },
      { path: 'productos', element: <ProductosPage /> },
      { path: 'clientes', element: <ClientesPage /> },
      { path: 'reservas', element: <ReservasPage /> },
      { path: 'pedidos', element: <PedidosPage /> },
      { path: 'cajas', element: <CajasPage /> },
      { path: 'gastos', element: <GastosPage /> },
      { path: 'repartidores', element: <RepartidoresPage /> },
      { path: 'repartos', element: <RepartosPage /> },
      { path: 'movimientos', element: <MovimientosInventarioPage /> },
      { path: 'configuraciones', element: <ConfiguracionesPage /> },
      { path: 'series', element: <SeriesDocumentosPage /> },
      { path: 'notas-credito', element: <NotasCreditoPage /> },
      { path: 'resumenes', element: <ResumenesDiariosPage /> },
    ],
  },
  {
    path: '/',
    element: <Navigate to="/admin" replace />,
  },
  {
    path: '*',
    element: <NotFoundPage />,
  },
]);
