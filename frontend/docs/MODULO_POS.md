# Punto de Venta (POS) — Interfaz Gráfica y Generación de Comanda

**Proyecto:** `restaurante/` — Laravel (PHP) + Blade + Bootstrap 5 + MySQL
**Módulo:** Punto de Venta en mesa — toma de pedido, carrito, cobro y comanda a cocina
**Companion doc:** ver `docs/MODULO_MESAS.md` (diseñador de salón y mapa de mesas).

**Archivos clave:**
- Controlador: `app/Http/Controllers/PosController.php`
- Controlador cocina: `app/Http/Controllers/KitchenController.php`
- Vistas: `resources/views/pos/index.blade.php`, `resources/views/pos/order.blade.php`, `resources/views/pos/partials/cart.blade.php`, `resources/views/pos/partials/split_content.blade.php`
- Comanda: `resources/views/sales/kitchen_ticket.blade.php` · Pre-cuenta: `resources/views/sales/ticket.blade.php`
- KDS (cocina): `resources/views/kitchen/index.blade.php`
- Rutas: `routes/web.php` (líneas 51–78)

---

## 1. Visión general: dos pantallas conectadas

El POS es un flujo de **dos pantallas que comparten la misma posición física de la mesa** (`tables.x_pos/y_pos`):

```
[1] /pos  (pos.index)                [2] /pos/table/{table}  (pos.order)
    MAPA DE MESAS                        TOMA DE PEDIDO
    ┌───────────────┐   click mesa       ┌──────────┬──────────┬─────────┐
    │ ▢ Mesa 1      │ ───────────────►   │Categorías│ Productos │ Carrito │
    │ ▢ Mesa 2 🔴   │                    │          │  tiles    │ + TOTAL │
    │ ▢ Mesa 3 🟡   │ ◄───────────────   │          │           │ COBRAR  │
    └───────────────┘   "Volver"         └──────────┴──────────┴─────────┘
                                                    │
                                       addToOrder() AJAX → Order + OrderDetail
                                                    │
                                        [3] Comanda / KDS de cocina
                                            kitchen_ticket  ·  /kitchen
```

Ambas rutas están dentro del grupo `middleware(['auth'])`, y la apertura de mesa (`pos.index`, `pos.order`) además pasa por el middleware **`cash_register`** (obliga a tener caja abierta).

---

## 2. Pantalla 1 — Mapa de Mesas (`pos.index`)

Es la puerta de entrada. Reutiliza **exactamente** las coordenadas guardadas por el módulo de mesas.

**Consulta (`PosController::index`, líneas 25–40):**

```php
$areas = Area::with(['tables' => function($q) {
    $q->with(['orders' => fn($q) => $q->where('status', 'pending'),
              'reservations' => fn($q) => $q->where('status','confirmed')
                  ->whereDate('reservation_time', Carbon::today())
                  ->where('reservation_time','>=', Carbon::now()->subHours(2))
                  ->orderBy('reservation_time','asc')]);
}])->get();
```

- **Zonas = pestañas** (`nav-pills`), una por `Area`.
- **Cada mesa** se pinta como tarjeta `position:absolute` con `left:{{ x_pos }}px; top:{{ y_pos }}px;` (110×110), dentro de un lienzo de 650px con `overflow:auto` y cuadrícula `radial-gradient`.
- El enlace de cada tarjeta es `route('pos.order', $table->id)`.

**Semántica de color (derivada de datos, no de `tables.status`):**

| Condición | Clase | Icono | Badge |
|---|---|---|---|
| Orden `pending` en la mesa | `border-danger` rojo | `bi-display-fill` rojo | **CONSUMO** + total `S/ xx.xx` |
| Reserva `confirmed` de hoy (≥ now−2h) y sin orden | `border-warning` amarillo | `bi-display` gris | **N RESERVA(S)** + hora/nombre |
| Ninguna | `border-success` verde | `bi-display` gris | **LIBRE** |

> La conexión con mesas es puramente por **posicionamiento absoluto sobre el mismo eje de coordenadas**; el estado se calcula en tiempo real con las relaciones `orders` y `reservations`.

---

## 3. Pantalla 2 — Toma de Pedido (`pos.order`, `PosController::order`)

### 3.1 Query que arma la pantalla (líneas 42–57)

```php
$categories = Category::with(['products' => fn($q) =>
        $q->where('is_active', true)->where('is_saleable', true)
    ])->where('is_active', true)->get();

$order = Order::where('table_id', $table->id)
              ->where('status','pending')->with('details.product')->first();

$occupiedTableIds = Order::where('status','pending')->pluck('table_id');
$freeTables = Table::whereNotIn('id', $occupiedTableIds)
                   ->where('id','!=',$table->id)->with('area')->get();

$clients = Client::select('id','name','document_number')->orderBy('name')->get();
```

Claves de conexión:
- **Productos** → solo categorías activas y productos `is_active = true` **y** `is_saleable = true` (los insumos puros no se venden).
- **Mesa → Orden**: se busca la orden **abierta** (`status = 'pending'`) de esa mesa. Si existe, el POS continúa esa cuenta.
- **Mesas libres** alimentan el modal "Mover Mesa" (solo destinos sin orden abierta).

### 3.2 Estructura de la interfaz (3 columnas en viewport fijo)

La vista se monta en `#pos-wrap` con `position:fixed; inset:0; left:220px;` (respeta el sidebar de 220px), `display:flex; flex-direction:column`:

```
┌─ TOPBAR ────────────────────────────────────────────────────────────┐
│ [← Volver]  Mesa: M1 / Zona: Terraza      [Mover Mesa]  usuario     │
├─ CUERPO (flex row, flex:1) ─────────────────────────────────────────┤
│ ┌Categorías─┐ ┌──────── Productos ────────┐ ┌──── Carrito (280px) ─┐ │
│ │ 155px     │ │ buscador código barras    │ │ Cuenta Actual        │ │
│ │ • Todo    │ │ grid 2/3/4 cols de tiles  │ │ tabla PROD/CANT/TOT  │ │
│ │ • Bebidas │ │ [img]+precio+stock+nombre │ │ …                    │ │
│ │ • Platos  │ │ hover → "Agregar"           │ │ Subtotal/Desc/Prop   │ │
│ │           │ │                            │ │ TOTAL                │ │
│ │           │ │                            │ │ [Opc][Div][Pre]      │ │
│ │           │ │                            │ │ [   COBRAR   ]       │ │
│ └───────────┘ └────────────────────────────┘ └──────────────────────┘ │
└──────────────────────────────────────────────────────────────────────┘
```

### 3.3 Columna izquierda — Categorías
- `list-group` con botón "Todo" + un botón por categoría.
- Imagen de categoría (`storage/…`) o icono `bi-tag`.
- `onclick="filterProducts('cat-{id}')"` → oculta/muestra tiles por clase `cat-{id}` (filtrado 100% en cliente).

### 3.4 Columna central — Productos (tiles)
- Grid `row-cols-2 / lg-3 / xl-4`.
- Se define una **paleta fija de 8 colores** (`$catPalette`) y se asigna por ciclo a cada categoría (`$catColorMap`); la paleta se inyecta como variables CSS `--pal-bg`, `--pal-icon`, `--pal-border` en cada tarjeta.
- Cada tarjeta (`div.pos-product-card`) tiene:
  - **Imagen** o **bloque con icono** de la paleta.
  - **Badge precio** (`pos-price-badge`, arriba-derecha).
  - **Badge stock** (`pos-stock-badge`) **solo si `stock` no es null**; rojo pulsante si `stock <= 5`.
  - Nombre + categoría en el pie.
  - **Overlay "Agregar"** al hover.
- Al hacer clic → `onclick="addToOrder({{ $product->id }})"`.

### 3.5 Columna derecha — Carrito / Cuenta
Renderiza el partial `pos.partials.cart` dentro de `#cart-container`. Contiene:
- Tabla de líneas: quitar (`x`), nombre, precio, **stepper −/+** y subtotal por línea, con icono de **nota** si existe.
- Mover cantidades: `updateQty(id, qty)`; con `qty<1` pide confirmación de borrado.
- **Totales**: Subtotal, Descuento (si >0), Propina (si >0) y **TOTAL** (`total + tip − discount`). Input oculto `#cartTotalValue` alimenta el modal de cobro.
- Botones: **Opc.** (`#optionsModal`: descuento y propina), **Div.** (dividir cuenta), **Pre** (pre-cuenta) y **COBRAR** (`#checkoutModal`).

### 3.6 Modales
- `#noteModal`: nota de cocina por línea (`saveNote()` → `pos.note`).
- `#moveTableModal`: mover la orden a mesa libre (`pos.move`, select `target_table_id`).
- `#optionsModal`: descuento global + propina (`applyOptions()` → `pos.discount`).
- `#checkoutModal` (solo si `$order`): cliente (datalist `#clientsList` + `searchClient()` rellena `client_id`/`client_document`), tipo de documento (Ticket/Boleta/Factura), método de pago (Efectivo/Tarjeta), monto recibido y cambio.

> **`#checkoutModal` solo se imprime si ya existe una orden** (`@if($order)`), por lo que el botón "COBRAR" solo funciona cuando hay items en la cuenta.

---

## 4. Conexión Mesa ↔ Productos: cómo se genera la comanda

### 4.1 El carrito vive en servidor (AJAX que devuelve HTML)

No hay estado de carrito en JS. Cada acción hace `fetch` y **reemplaza** `#cart-container` con el HTML renderizado por el servidor (`getCartHtml()`, líneas 298–304). Patrón uniforme:

```js
window.addToOrder = function(productId) {
    fetch(`/pos/order/${tableId}/add`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "X-CSRF-TOKEN": csrfToken },
        body: JSON.stringify({ product_id: productId })
    }).then(r => r.text()).then(html => {
        document.getElementById('cart-container').innerHTML = html;
        updateCheckoutTotal();
    });
};
```

### 4.2 Alta de línea — `addItemToTable()` (líneas 88–110)

Es el corazón de la conexión **Mesa → Orden → Producto → Detalle**:

```php
DB::transaction(function() use ($table, $product) {
    $order = Order::firstOrCreate(
        ['table_id' => $table->id, 'status' => 'pending'],   // ← crea la orden abierta de la mesa
        ['user_id' => auth()->id() ?? 1, 'total' => 0]
    );

    $detail = $order->details()->where('product_id', $product->id)->first();
    if ($detail) {
        $detail->increment('quantity');                       // suma si ya existe
    } else {
        $order->details()->create([
            'product_id' => $product->id,
            'quantity'   => 1,
            'price'      => $product->price,                  // precio congelado
            'status'     => 'pending',
        ]);
    }
    $this->recalculateTotal($order);
});
```

Reglas de esta pieza:
- **Una sola orden abierta por mesa** (`firstOrCreate` sobre `table_id + status=pending`).
- Al agregar el **mismo producto** dos veces, se **incrementa la cantidad** en lugar de crear otra línea.
- El **precio se congela** en `order_details.price` al momento de agregar (no cambia si luego cambia el precio del producto).
- Todo dentro de una **transacción** y con `recalculateTotal()` al final.

### 4.3 Recálculo del total (líneas 291–296)

```php
$subtotal = $order->details->sum(fn($d) => $d->price * $d->quantity);
$total = ($subtotal - ($order->discount ?? 0)) + ($order->tip ?? 0);
$order->update(['total' => max(0, $total)]);
```

### 4.4 Mapa de endpoints usados por la vista

| Acción UI | Endpoint | Método | Router name |
|---|---|---|---|
| Agregar por clic | `/pos/order/{table}/add` | POST | `pos.add` |
| Agregar por código de barras | `/pos/order/{table}/barcode` | POST | `pos.barcode` |
| Cambiar cantidad | `/pos/detail/{detail}/update` | POST | `pos.update` |
| Guardar nota | `/pos/detail/{detail}/note` | POST | `pos.note` |
| Eliminar línea | `/pos/detail/{detail}` | DELETE | `pos.remove` |
| Descuento/propina | `/pos/order/{order}/discount` | POST | `pos.discount` |
| Mover mesa | `/pos/order/{order}/move` | POST | `pos.move` |
| Pre-cuenta | `/pos/order/{order}/precheck` | GET | `pos.precheck` |
| Dividir (ver) | `/pos/order/{order}/split-content` | GET | `pos.split.content` |
| Dividir (procesar) | `/pos/order/{order}/split` | POST | `pos.split` |
| Comanda cocina | `/pos/order/{order}/kitchen-ticket` | GET | `pos.kitchen` |
| Cobrar | `/pos/order/{order}/checkout` | POST | `pos.checkout` |

### 4.5 Código de barras
`#barcodeInput` (`autofocus`); al pulsar **Enter** llama `addByBarcode(code)` → POST `pos.barcode`. El backend busca `Product::where('barcode',…)->where('is_active')->where('is_saleable')->first()`; si no existe devuelve `404 {error}`.

---

## 5. La comanda (orden de cocina)

### 5.1 Comanda impresa — `sales/kitchen_ticket.blade.php`
- Documento HTML **80mm** con `window.onload = window.print()` (impresión automática) y botón flotante de reimpresión.
- Cabecera: **MESA**, **Mozo** (`$order->user->name`), fecha/hora.
- Por cada `order_detail`: **cantidad grande** + nombre del producto + **nota resaltada** (fondo negro) si existe.
- Pie: `--- FIN DE ORDEN #{id} ---`.
- Se sirve por `PosController::kitchenTicket(Order $order)` → `route('pos.kitchen')`.

> ⚠️ La ruta `pos.kitchen` **está definida** pero **no tiene botón** en `cart.blade.php` ni en `order.blade.php`: la comanda impresa hoy no está cableada a la UI (se puede abrir por URL directa). Ver deudas técnicas §8.

### 5.2 Monitor de Cocina (KDS) — `kitchen/index.blade.php`
- `KitchenController::index()` trae órdenes con detalles `pending`/`cooking`, orden FIFO (`orderBy('created_at','asc')`), con `table` y `details` filtrados.
- Tarjetas por orden: cabecera roja (pendiente) o amarilla (en preparación), "Mesa: X" o "Para Llevar" (si `table` null), folio y hora.
- Cada línea muestra cantidad, producto (tachado si `served`) y nota; botón que avanza estado: **Empezar** (`pending→cooking`) o **Listo** (`cooking→served`) vía POST `kitchen.update`.
- **Auto-recarga cada 15 s** + reloj en vivo.

### 5.3 Ciclo de vida del detalle y de la comanda

```
Producto agregado      order_details.status = 'pending'
        │
        ├─ (cocina) Empezar  → 'cooking'      ┌ visible en KDS
        │                                      │
        ├─ (cocina) Listo    → 'served'       └ desaparece del KDS
        │
        └─ Cobro (checkout)  → Order.status = 'completed'
```

> La `Order` no se marca como enviada a cocina en un paso separado: el detalle nace `pending` y **el KDS lo recoge automáticamente** porque filtra por `status in ('pending','cooking')`.

---

## 6. Cobro y cierre — `checkout()` (líneas 166–289)

Es el puente entre la operación de salón y los módulos financiero/inventario/SUNAT:

1. Valida `order.status === 'pending'`.
2. Determina `payment_method` (`cash`/`card`), calcula `received` y `change`.
3. Si `document_type === 'Factura'` exige **RUC de 11 dígitos** y razón social (regla Perú).
4. En transacción:
   - Si es Boleta/Factura calcula **IGV 18%** (`SunatConfig::igvFactor()`) y asigna **serie/correlativo** (`DocumentSeries::next()`).
   - Actualiza la orden a `status='completed'` con datos de pago, cliente, `cash_register_id` y campos SUNAT (`sunat_status='PENDING'`).
   - **Descuenta inventario**:
     - Si el producto tiene **receta** (`product_ingredients`), descuenta cada insumo `quantity_pivote × cantidad`.
     - Si no, descuenta `product.stock` (solo si no es null).
     - Cada movimiento crea un registro en **`inventory_logs`** (tipo `sale`).
5. Envía a **SUNAT** (no bloqueante; si falla queda `PENDING/ERROR` para reintento desde Facturación).
6. Redirige a `pos.index` con mensaje (incluye número de comprobante si es electrónico).

Al completarse, la mesa **deja de tener orden `pending`** y vuelve a mostrar verde "LIBRE" en el mapa.

---

## 7. Reglas y restricciones del POS

- **Caja abierta obligatoria** para abrir mesas (middleware `cash_register`).
- **Solo productos `is_active` y `is_saleable`** se muestran y se pueden vender.
- **Una orden `pending` por mesa** (`firstOrCreate`); agregar repetido incrementa cantidad.
- **Precio congelado** en el detalle al momento de agregar.
- **Mover mesa** rechaza destinos con orden abierta (`'Ocupada.'`).
- **Factura** requiere RUC de 11 dígitos + razón social.
- **Inventario** se descuenta solo al **cobrar** (no al agregar), vía receta (ingredientes) o stock directo.
- **Notas de cocina** por línea (`order_details.note`) se imprimen en la comanda y se ven en el KDS.
- **Total = Σ(precio×cant) − descuento + propina**, con suelo en 0.
- Roles: personal operativo (`admin`, `cashier`, `waiter`) accede al POS; el **cobro** (`pos.checkout`) está dentro de `role:admin,cashier`.
- El carrito no persiste en JS: el estado canónico es la BD (`orders` + `order_details`).

---

## 8. Observaciones y deudas técnicas

- **Comanda impresa sin botón**: `pos.kitchen` existe pero no está enlazada en la UI del POS; la única vía "automática" a cocina es el **KDS** (`/kitchen`).
- **`pos.split` es un stub** (`processSplit` solo hace `redirect()->back()`), por lo que la pantalla de división calcula el total pero **no persiste** la parte cobrada.
- **`orders.notes`** existe en la migración original pero **no se usa** en el POS (la nota vive por línea en `order_details.note`).
- **Escucha de teclado por `keypress`** en el input de barras (algunos lectores modernos emiten `keydown`); funciona porque se usa el buffer del input + Enter.
- **Stock mostrado no se re-valida contra disponibilidad** al agregar: se puede agregar un producto con stock 0; el descuento se hace al cobrar (puede quedar negativo si no hay validación previa).
- **Paleta de categorías** es fija (8 colores) y cicla; si hay más de 8 categorías, se repiten colores.
- El cambio de **cantidad con `updateQty`** y demás AJAX **siempre reemplaza** todo el carrito (no hay parches parciales), lo que simplifica pero re-renderiza completo en cada click.
- **Auto-recarga del KDS** cada 15 s puede interrumpir la interacción si el usuario está pulsando un botón justo en ese momento.

---

## 9. Resumen en una línea

El **POS** conecta **mesas** (plano con `x_pos/y_pos` y estado en vivo) con **productos** (`is_active`/`is_saleable`) mediante un carrito **server-side por AJAX**: agregar un producto crea/reutiliza la **orden abierta de la mesa** y una línea en `order_details`, cuya suma alimenta el total y el modal de cobro; al **cobrar** se cierra la orden, se descuenta **inventario** (receta o stock), se emite el comprobante (**SUNAT** opcional) y la mesa vuelve a "LIBRE"; la **comanda** llega a cocina por el **KDS** (`/kitchen`) y por el ticket térmico `sales/kitchen_ticket`.
