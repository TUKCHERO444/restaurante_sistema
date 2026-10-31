# Sistema de gestión para restaurante — Base inicial

Arquitectura desacoplada: `frontend/` (React + Vite) y `backend/` (Laravel API)
se instalan, configuran y ejecutan de forma independiente. El frontend consume
exclusivamente la API mediante HTTP/JSON. Sin Docker ni despliegue en esta etapa.

> Estado: inicialización verificada. Sin módulos, CRUD ni tablas de negocio.
> La base de datos del restaurante se integrará después.

## Estructura

```text
.
├── frontend/          # React 19 + TypeScript + Vite 8
│   ├── src/
│   │   ├── assets/        # Recursos estáticos
│   │   ├── components/    # Compartidos + ui/ (shadcn: button, card, badge)
│   │   ├── layouts/       # Diseños de página (Outlet de React Router)
│   │   ├── pages/         # Páginas de la SPA
│   │   ├── routes/        # Definición centralizada del enrutador
│   │   ├── services/      # Servicios HTTP (único acceso a la API)
│   │   ├── hooks/         # Hooks (p. ej. consultas TanStack Query)
│   │   ├── types/         # Tipos compartidos (respuestas API, errores)
│   │   ├── lib/           # Instancia Axios + QueryClient compartido
│   │   ├── App.tsx
│   │   └── main.tsx
│   ├── public/
│   ├── .env.example
│   ├── package.json
│   ├── tsconfig.json
│   └── vite.config.ts
├── backend/           # Laravel 12 (PHP 8.2+) — solo API, sin Blade
│   ├── app/Http/Controllers/Api/V1/   # Controladores versionados
│   ├── routes/api.php                 # Rutas bajo /api/v1
│   ├── routes/channels.php            # Canales (Reverb, preparado)
│   ├── routes/console.php             # Scheduler (preparado)
│   ├── config/cors.php                # CORS restringido al frontend
│   ├── .env.example
│   ├── artisan
│   └── composer.json
└── README.md
```

## Base de datos (esquema en español)

20 tablas de negocio traducidas del sistema anterior (ver
`backend/docs/ESQUEMA_TRADUCCION.md` con el análisis y el mapa completo):

`usuarios, areas, mesas, categorias, productos, producto_ingredientes,
reservas, clientes, pedidos, pedido_detalles, cajas, gastos,
movimientos_inventario, repartidores, repartos, configuraciones,
series_documentos, notas_credito, resumenes_diarios, ia_consultas`

- Modelos Eloquent en `backend/app/Models/` con relaciones y casts.
- Controladores base `Api\V1` (CRUD) en `backend/app/Http/Controllers/Api/V1/`,
  expuestos como `Route::apiResources` bajo `/api/v1` (92 rutas).
- Seed de talonarios (`B001/F001/BC01/FC01`) con `php artisan db:seed`.
- Las tablas internas del framework (`cache`, `jobs`, `sessions`, …)
  se mantienen intactas.

### Datos de demostración

`php artisan db:seed` carga ~1.700 registros coherentes (factories +
seeders en `database/`):

- 100 por tabla transaccional: mesas, productos (+100 recetas),
  reservas, clientes, pedido_detalles (~500 líneas en 200 pedidos:
  100 salón + 100 delivery), cajas (1 abierta), gastos, movimientos
  de kardex (actualizan stock), repartos (1:1 con delivery), notas de
  crédito (sobre ACEPTADOS con serie atómica), resúmenes diarios
  (agregados por fecha), ia_consultas.
- Catálogos realistas: 12 áreas, 15 categorías, 12 repartidores,
  26 configuraciones, 4 series. Usuarios: solo el de prueba por defecto.

## Requisitos

| Herramienta | Versión usada           |
| ----------- | ----------------------- |
| PHP         | 8.2+                    |
| Composer    | 2.x                     |
| MySQL/MariaDB | 10.4+ (XAMPP verificado) |
| Node.js     | 20+ (verificado con 24) |
| npm         | 10+                     |

## Instalación

### Backend (Laravel)

```bash
cd backend
composer install
copy .env.example .env        # en Linux/macOS: cp .env.example .env
php artisan key:generate
```

Crear la base de datos MySQL (vacía; las tablas de negocio llegarán después):

```sql
CREATE DATABASE restaurante CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

Configurar `.env` (variables estándar de Laravel):

```ini
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=restaurante
DB_USERNAME=root
DB_PASSWORD=
FRONTEND_URL=http://localhost:5173
CORS_ALLOWED_ORIGINS=http://localhost:5173
```

Ejecutar las migraciones iniciales (solo tablas del framework:
`users`, `cache`, `jobs`, Sanctum — ninguna tabla de negocio):

```bash
php artisan migrate
```

### Frontend (React)

```bash
cd frontend
npm install
copy .env.example .env         # en Linux/macOS: cp .env.example .env
```

Variable de entorno (ver `.env.example`):

```ini
VITE_API_URL=http://localhost:8000/api/v1
```

> Nunca pongas credenciales, secretos ni claves privadas en variables
> `VITE_*`: se exponen en el navegador.

## Ejecución

En dos terminales separadas:

```bash
# Terminal 1 — API en http://localhost:8000
cd backend
php artisan serve --host=127.0.0.1 --port=8000

# Terminal 2 — SPA en http://localhost:5173
cd frontend
npm run dev
```


Servicios opcionales (ya configurados, sin lógica de negocio todavía):

```bash
cd backend
php artisan reverb:start        # WebSockets en :8080 (Reverb)
php artisan queue:work          # Colas (conexión database)
php artisan schedule:work       # Scheduler en desarrollo
```

## Verificación

```bash
# 1. La API responde (endpoint de salud, sin autenticación)
curl http://localhost:8000/api/v1/health
# → {"status":"ok","service":"Restaurante","timestamp":"..."}

# 2. Tests del backend
cd backend
php artisan test

# 3. El frontend compila (typecheck + build)
cd frontend
npm run build

# 4. Calidad de código del frontend
npm run lint

# 5. Comunicación React → Laravel: abrir http://localhost:5173
#    La página muestra "API en línea" usando GET /api/v1/health
#    (Axios + TanStack Query).
```

## Decisiones de configuración

- **Prefijo API `/api/v1`**: definido con `apiPrefix` en
  `backend/bootstrap/app.php`; versionado listo para futuros cambios.
- **Sanctum SPA**: `HasApiTokens` en `User`, `SANCTUM_STATEFUL_DOMAINS`
  y `SESSION_DOMAIN` en `.env`, Axios con `withCredentials`. Cookie/CSRF
  listo para cuando exista el login (sin implementar).
- **CORS**: solo `http://localhost:5173` (env `CORS_ALLOWED_ORIGINS`),
  con credenciales habilitadas para Sanctum.
- **Reverb/Broadcasting**: instalados (`laravel/reverb`,
  `routes/channels.php`, `config/reverb.php`). Sin eventos funcionales.
- **Colas**: `QUEUE_CONNECTION=database`, tabla `jobs` migrada.
  Sin trabajos de negocio.
- **Scheduler**: `routes/console.php` preparado con ejemplo comentado.
  Sin tareas de negocio.
