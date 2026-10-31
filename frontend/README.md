# Frontend — Sistema de Gestión para Restaurante

React 19 + TypeScript + Vite 8 + Tailwind CSS v4 + shadcn/ui.

## Estructura

```text
src/
├── components/       # Componentes reutilizables
│   ├── ui/          # shadcn/ui (button, card, badge, input, dialog, select, skeleton, label)
│   ├── Sidebar.tsx  # Navegación lateral (AdminLTE)
│   ├── ThemeToggle.tsx
│   └── HealthStatus.tsx
├── hooks/           # useAuth, useTheme, useHealth
├── layouts/         # AdminLayout (sidebar + navbar + content)
├── pages/           # LoginPage, DashboardPage, UsuariosPage, NotFoundPage
├── routes/          # Router centralizado con protección de rutas
├── services/        # auth.service, usuarios.service, health.service
├── types/           # api.ts, auth.ts
├── lib/             # api.ts (Axios), queryClient.ts, utils.ts
├── App.tsx
└── main.tsx
```

## Decisiones de configuración

- **Autenticación**: Sanctum SPA con token en localStorage (`restaurante-token`).
- **Rutas protegidas**: Componente `RutaProtegida` que verifica autenticación antes de renderizar.
- **Layout AdminLTE**: Sidebar fijo colapsable + navbar superior + contenido fluido.
- **Tema claro/oscuro**: Sin recargar, con persistencia en localStorage (`restaurante-tema`).
- **Tokens CSS**: Paleta AdminLTE con azul corporativo, sidebar oscuro en ambos temas.
- **Tipografía**: Inter (cuerpo) + Plus Jakarta Sans (títulos).
- **Iconos**: lucide-react, sin emojis.
- **CRUD Usuarios**: Lista, crea, edita y elimina usuarios con confirmación.

## Usuario de prueba

```text
Correo: prueba@ejemplo.com
Contraseña: contrasena
Rol: administrador
```

## Desarrollo

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
```
