# Módulo de Mesas — Diseño de Salón y Mapa Operativo

**Proyecto:** `restaurante/` — Laravel (PHP) + Blade + Bootstrap 5 + MySQL
**Módulo:** Gestión de Áreas (Zonas) y Mesas — CRUD visual con plano arrastrable
**Ruta base:** `/tables` (nombre `tables.*`)
**Archivos clave:**
- Controlador: `app/Http/Controllers/TableController.php`
- Modelos: `app/Models/Area.php`, `app/Models/Table.php`
- Vista: `resources/views/tables/index.blade.php`
- Rutas: `routes/web.php` (líneas 182–188)
- Migraciones: `2025_12_25_151405_create_areas_table.php`, `2025_12_25_151405_create_tables_table.php`, `2025_12_29_140318_add_position_to_tables_table.php`, `2025_12_29_142451_add_coords_to_tables.php`
- Vista operativa (consumidora): `resources/views/pos/index.blade.php`

---

## 1. Propósito

El módulo permite **construir gráficamente el salón del restaurante**: el administrador crea **Zonas/Áreas** (ej. "Terraza", "Salón Principal", "Segundo Piso"), agrega **Mesas**, y luego **arrastra cada mesa** sobre un lienzo con cuadrícula para definir la distribución física real. Esa misma coordenada (`x_pos`, `y_pos`) se reutiliza en el **Punto de Venta** para mostrar el mapa interactivo con el estado de cada mesa.

Existen, por tanto, **dos vistas del mismo plano**:

| Vista | Ruta | Rol que accede | Objetivo |
|---|---|---|---|
| **Diseño de Salón** | `tables.index` | `admin` | Crear/borrar zonas, crear/borrar mesas y **guardar** posiciones |
| **Mapa Operativo (POS)** | `pos.index` | `admin`, `cashier`, `waiter` | Ver el estado en vivo y abrir la orden de una mesa |

---

## 2. Modelo de datos

### 2.1 Tabla `areas`
| Columna | Tipo | Notas |
|---|---|---|
| `id` | bigint PK | |
| `name` | string(255) | Nombre de la zona. Ej.: "Terraza" |
| `created_at` / `updated_at` | timestamps | |

### 2.2 Tabla `tables`
| Columna | Tipo | Default | Notas |
|---|---|---|---|
| `id` | bigint PK | | |
| `area_id` | FK → `areas.id` | | `onDelete('cascade')` |
| `name` | string(255) | | Ej.: "Mesa 1", "M-04" |
| `seats` | integer | `4` | Capacidad de comensales |
| `status` | enum | `available` | `available` / `occupied` / `reserved` |
| `x_pos` | integer | `0` (luego `10`) | Coordenada horizontal en px |
| `y_pos` | integer | `0` (luego `10`) | Coordenada vertical en px |
| `created_at` / `updated_at` | timestamps | | |

> Nota: existen **dos migraciones** de coordenadas. `add_position_to_tables_table` agrega `x_pos`/`y_pos` con default `0`; `add_coords_to_tables` las vuelve a intentar con default `10` pero **solo si la columna no existe** (`Schema::hasColumn`), por lo que en bases ya migradas queda el default `0`.

### 2.3 Relaciones Eloquent

```
Area 1 ────< N Table 1 ────< N Order      (Order.table_id nullable)
                        └──< N Reservation (Reservation.table_id nullable, SET NULL)
```

- `Area::tables()` → `hasMany(Table::class)`
- `Table::area()` → `belongsTo(Area::class)`
- `Table::orders()` → `hasMany(Order::class)`
- `Table::reservations()` → `hasMany(Reservation::class)`

`Table::$fillable = ['name', 'area_id', 'x_pos', 'y_pos', 'width', 'height', 'status']`.
`Area::$fillable = ['name']`.

> ⚠️ `width` y `height` figuran como *fillable* en el modelo pero **no existen como columnas** en ninguna migración. Si se intentaran asignar por *mass assignment* fallaría; el sistema no las usa (los tamaños se fijan en CSS: 100×100 en el diseñador y 110×110 en el POS).

---

## 3. Construcción de la interfaz gráfica (`tables/index.blade.php`)

La vista extiende el layout `layouts.app` (Bootstrap 5.3.2 + Bootstrap Icons por CDN).

### 3.1 Estructura visual (de arriba a abajo)

1. **Encabezado**
   - Título: `<i class="bi bi-grid-3x3-gap-fill"></i> Diseño de Salón`.
   - Subtítulo: *"Arrastra las mesas y guarda la distribución"*.
   - Botonera a la derecha:
     - `Nueva Zona` (outline) → abre modal `#areaModal`.
     - `Nueva Mesa` (primary) → abre modal `#tableModal`.
     - `Guardar Diseño` (success, `id="btnSave"`) → ejecuta `savePositions()`.

2. **Pestañas de Zonas** (`nav-tabs`, `#areaTabs`)
   - Una pestaña por cada `Area` (`@foreach($areas ...)`).
   - La primera es `active`.

3. **Contenido de cada Zona** (`tab-pane`)
   - Barra de ayuda + botón **Eliminar Zona** (form POST con `@method('DELETE')` y `onsubmit="return confirm(...)"`).
   - **Lienzo (canvas)**: `div.salon-canvas` de `600px` de alto, `position-relative`, `overflow:hidden`, fondo de cuadrícula generado con CSS:
     ```css
     background-image: radial-gradient(#dee2e6 1px, transparent 1px);
     background-size: 20px 20px;
     ```
   - Una **mesa** por registro: `div.draggable-table` posicionado de forma absoluta con `left:{{ x_pos }}px; top:{{ y_pos }}px;`, tamaño `100×100`, `cursor:grab`.
     - Icono `bi-display` (verde `text-success` si `available`, rojo `text-danger` si no).
     - Nombre de la mesa.
     - Botón "x" (form DELETE anidado arriba-derecha) para borrar la mesa, con `confirm`.

4. **Modales**
   - `#areaModal`: input `name` → `POST tables.storeArea`.
   - `#tableModal`: input `name` + `select area_id` (todas las zonas) → `POST tables.storeTable`.

### 3.2 Diagrama de composición

```
┌──────────────────────────────────────────────────────────┐
│  Diseño de Salón          [Nueva Zona][Nueva Mesa][Guardar]│
├──────────────────────────────────────────────────────────┤
│  [ Terraza ] [ Salón Principal ] [ Segundo Piso ]          │  ← tabs por zona
├──────────────────────────────────────────────────────────┤
│  i Arrastra las mesas…            [Eliminar Zona]          │
│  ┌──── canvas 600px, fondo cuadriculado, overflow:hidden ─┐│
│  │   ▢ Mesa 1        ▢ Mesa 2                             ││
│  │                                                          ││
│  │            ▢ Mesa 3                                      ││
│  └──────────────────────────────────────────────────────────┘│
└──────────────────────────────────────────────────────────┘
```

### 3.3 Lógica de arrastre (JavaScript, sin librerías)

Registrada en `DOMContentLoaded` sobre todos los `.draggable-table`:

- **`dragStart`** (`mousedown`): ignora el evento si el click fue dentro de un `<form>` (para no arrastrar al pulsar borrar). Calcula el offset entre el puntero y el `offsetLeft`/`offsetTop` de la mesa, sube `z-index` a 100 y aplica `shadow-lg`.
- **`drag`** (`mousemove`): recalcula `left`/`top` = `clientX/Y − offset`. **Acota solo a 0** (`if currentX < 0 → 0`), es decir, evita salir por arriba/izquierda pero **no limita** por abajo/derecha (el `overflow:hidden` del canvas recorta visualmente).
- **`dragEnd`** (`mouseup`): restaura `cursor`, `z-index` y sombra.

### 3.4 Guardado del plano (`savePositions()`)

1. Deshabilita el botón y muestra "Guardando…".
2. Recorre **todos** los `.draggable-table` de la página y arma un array:
   ```js
   { id: data-id, x: parseInt(style.left), y: parseInt(style.top) }
   ```
3. Hace `fetch POST` a `tables.updatePositions` enviando JSON `{ positions: [...] }` con cabecera `X-CSRF-TOKEN`.
4. Según la respuesta (`status: 'success'`) muestra alerta de éxito o de error. En `catch` sugiere ejecutar `php artisan migrate`.

> El recorrido es **global** (toma mesas de todas las pestañas), lo cual es correcto porque cada elemento conserva su propia coordenada independientemente de si su pestaña está visible.

---

## 4. CRUD — Nivel funcional y técnico

### 4.1 Resumen de operaciones

| Recurso | Crear | Leer | Actualizar | Eliminar |
|---|---|---|---|---|
| **Área/Zona** | ✅ `storeArea` | ✅ `index` | ❌ | ✅ `destroyArea` (borra mesas en cascada) |
| **Mesa** | ✅ `storeTable` | ✅ `index` | ⚠️ solo posición (`updatePositions`) | ✅ `destroyTable` |
| **Posición** | — | — | ✅ `updatePositions` | — |

No existe **edición del nombre** de zona ni de mesa, ni de `seats`. La única "edición" soportada es mover mesas y guardar el mapa.

### 4.2 Rutas (`routes/web.php`, dentro de `middleware(['role:admin'])`)

```php
Route::get   ('/tables',                 [TableController::class, 'index'])           ->name('tables.index');
Route::post  ('/tables/area',            [TableController::class, 'storeArea'])       ->name('tables.storeArea');
Route::delete('/tables/area/{area}',     [TableController::class, 'destroyArea'])     ->name('tables.destroyArea');
Route::post  ('/tables/table',           [TableController::class, 'storeTable'])      ->name('tables.storeTable');
Route::delete('/tables/table/{table}',   [TableController::class, 'destroyTable'])    ->name('tables.destroyTable');
Route::post  ('/tables/update-positions',[TableController::class, 'updatePositions']) ->name('tables.updatePositions');
```

### 4.3 Controlador (`TableController.php`)

- **`index()`** — `Area::with('tables')->get()` y retorna `tables.index`. (Una sola consulta con eager loading.)
- **`storeArea(Request)`** — valida `name => required`, `Area::create($request->all())`, redirige atrás con flash `success = 'Zona creada.'`.
- **`destroyArea(Area $area)`** — `$area->tables()->delete()` y luego `$area->delete()` (borrado explícito de mesas + *route model binding*), redirige con `'Zona eliminada.'`.
- **`storeTable(Request)`** — valida `name => required` y `area_id => required|exists:areas,id`; crea la mesa con `status = 'available'` y posición fija inicial `x_pos = 50`, `y_pos = 50`; redirige con `'Mesa creada.'`.
- **`destroyTable(Table $table)`** — `$table->delete()` + `'Mesa eliminada.'`.
- **`updatePositions(Request)`** — recibe `positions` (array). Si no es array responde `400 JSON error`. Itera, hace `Table::find($id)` y actualiza `x_pos`/`y_pos` casteando a `(int)`. Devuelve `{status:'success', message:'Mapa guardado correctamente'}`.

### 4.4 Flujo técnico de una creación de mesa

```
UI: modal #tableModal
   └─ POST /tables/table  {name, area_id, _token}
        └─ TableController@storeTable
             ├─ validate name required, area_id exists:areas.id
             ├─ Table::create(name, area_id, status=available, x_pos=50, y_pos=50)
             └─ redirect back  →  flash "Mesa creada."
```

### 4.5 Flujo técnico del guardado del plano

```
UI: [Guardar Diseño] → savePositions()
   └─ fetch POST /tables/update-positions  (JSON {positions:[{id,x,y}]}, X-CSRF-TOKEN)
        └─ TableController@updatePositions
             ├─ if !is_array($positions) → 400 {status:error}
             ├─ foreach: Table::find(id)->update(x_pos=(int)x, y_pos=(int)y)
             └─ 200 {status:success}
   └─ finally: rehabilita botón
```

---

## 5. Casos de uso

1. **Crear una zona** — Botón *Nueva Zona* → nombre ("Terraza") → se añade como nueva pestaña vacía.
2. **Agregar mesas a una zona** — Botón *Nueva Mesa* → nombre + selección de zona en el desplegable. Aparece en la esquina (50,50) del lienzo de su zona.
3. **Distribuir / reorganizar el salón** — Arrastrar cada mesa a su posición real y pulsar *Guardar Diseño*. Las coordenadas se persisten y son las que usa el POS.
4. **Eliminar una mesa** — Botón "x" sobre la mesa (con confirmación).
5. **Eliminar una zona completa** — *Eliminar Zona* → borra la zona y todas sus mesas (cascada), previa confirmación.
6. **Operar una mesa desde el POS** — En `pos.index` el mapa se dibuja con las mismas `x_pos`/`y_pos`; al hacer clic en una mesa se abre `pos.order` para tomar el pedido.

---

## 6. Reglas y restricciones

### 6.1 Reglas de negocio / integridad
- **Nombre obligatorio** para zona y mesa (`required`).
- Una mesa **siempre pertenece a una zona válida** (`area_id` → `exists:areas,id`).
- Al **borrar una zona**, se eliminan sus mesas por **FK `onDelete('cascade')`** (y además explícitamente en el controlador).
- Una mesa nace en estado **`available`** con posición inicial **(50,50)**.
- El **POS** (a diferencia del diseñador) **no permite** modificar la distribución.
- Borrar una mesa/área **no borra** órdenes ni reservas: `orders.table_id` es **nullable** (delivery/mostrador) y `reservations.table_id` se pone en **`SET NULL`**.
- Al **mover** una orden en el POS solo se ofrecen mesas **libres** (`pos.moveTable` rechaza destino ocupado).

### 6.2 Estados y semántica de color (mapa operativo `pos.index`)

El estado **no se lee de `tables.status`** en el POS; se **deriva en tiempo de consulta**:

- Orden activa = `orders.status = 'pending'` → tarjeta **roja** (`border-danger`) con badge "CONSUMO" y el total.
- Reserva = `reservations.status = 'confirmed'` **de hoy**, con hora `>= now()-2h` → tarjeta **amarilla** (`border-warning`) con las horas/nombres.
- Ninguna de las dos → tarjeta **verde** (`border-success`) con badge "LIBRE".

| Estado mostrado | Condición | Color |
|---|---|---|
| Disponible | sin orden `pending` ni reservas de hoy | Verde (`bg-success`) |
| Ocupada | existe orden `pending` en la mesa | Rojo (`bg-danger`) |
| Reservada (hoy) | reserva `confirmed` de hoy dentro de la ventana ±2h | Amarillo (`bg-warning`) |

### 6.3 Reglas de presentación
- Lienzo del diseñador: **600px** de alto, `overflow:hidden` → las mesas nunca se desplazan visualmente fuera del panel.
- Lienzo del POS: **650px** de alto, `overflow:auto`.
- Cuadrícula de referencia espacial: puntos de `1px` cada `20px` (`radial-gradient`).
- Tamaños: mesa **100×100** (diseñador) y **110×110** (POS).
- El arrastre solo se acota a **≥0**; no hay límite máximo programado (se recorta por `overflow`).

---

## 7. Acceso y permisos

- Todas las rutas de `tables.*` están dentro del grupo `Route::middleware(['role:admin'])` → **solo el rol `admin`** accede al diseñador.
- Aparece en el menú lateral solo para `admin` (`layouts/app.blade.php`, bloque `@if($role === 'admin')`): ítem **"Mesas"** con icono `bi-grid-3x3-gap-fill`.
- El **mapa operativo** (`pos.*`) lo usan `admin`, `cashier` y `waiter`, protegido además por el middleware `cash_register` (requiere caja abierta para ver el POS).

---

## 8. Observaciones y deudas técnicas

- **No hay edición** de nombres ni de `seats` (no hay `update` en el CRUD de áreas/mesas). El campo `seats` existe en BD pero **no se captura en el formulario** `#tableModal`.
- `width`/`height` en `Table::$fillable` **no tienen columna** en BD; los tamaños son fijos por CSS.
- `updatePositions` **no valida** cada `id` contra el área/permiso; itera lo que llegue y hace `find` (ignora IDs inexistentes).
- `destroyArea` realiza borrado explícito de `tables()` además de la FK cascade: redundante pero inofensivo.
- El arrastre usa eventos de **mouse** (no táctil / no `pointer events`), por lo que en pantallas táctiles no funciona de forma nativa.
- No hay control de **solapamiento** de mesas ni *snap* a la cuadrícula; la posición es totalmente libre y en píxeles.
- `storeArea` usa `$request->all()` con `Area::$fillable = ['name']`, por lo que campos extra se descartan de forma segura.

---

## 9. Resumen en una línea

El **módulo de mesas** es un **diseñador visual de salón** (áreas + mesas con drag & drop y guardado de coordenadas) exclusivo del rol `admin`, cuyo resultado —el plano `x_pos`/`y_pos` por zona— **alimenta directamente el mapa interactivo del POS**, donde las mesas se colorean en vivo según órdenes abiertas y reservas confirmadas del día.
