# Resumen Ejecutivo — Sistema Restaurante (POS + Gestión + Facturación Electrónica SUNAT Perú)

**Proyecto:** `restaurante/` — Laravel (PHP) + Blade + Bootstrap 5 + MySQL  
**Fecha análisis:** 2026-10-16  
**Alcance:** migraciones (36 archivos), modelos (18), controladores (24), `routes/web.php` (191 líneas), vistas (47 Blade en 20 carpetas), JS.

---

## 1. Visión general

Sistema integral para restaurante que cubre **salón, cocina, caja, delivery, reservas, clientes, inventario/recetas, gastos, facturación electrónica SUNAT, reportes/BI, carta QR pública y asistente IA**.

Roles: `admin` (todo), `cashier`/`cajero` (POS + cobro + gastos + delivery + ventas), `waiter`/`mozo` (POS + cocina + reservas). Middleware `auth`, `role:`, `cash_register` (obliga caja abierta para ver POS), `throttle` (IA).

---

## 2. Base de datos — 22 tablas de negocio + sistema Laravel

### 2.1 Identidad / sistema
| Tabla | Columnas clave | Notas |
|---|---|---|
| `users` | id, name, email UNIQUE, password, role ENUM(admin,cashier,waiter,kitchen) default admin | Sin FK. `activeCashRegister()` = caja abierta del usuario |
| `cache`, `cache_locks`, `jobs`, `job_batches`, `failed_jobs`, `sessions` | estándar Laravel | Sin modelo de negocio |

### 2.2 Catálogo
| Tabla | Columnas clave |
|---|---|
| `categories` | id, name, image NULL, is_active default true |
| `products` | id, category_id FK→categories CASCADE, name, code NULL, barcode NULL UNIQUE, price(10,2), promotional_price NULL, cost NULL, stock NULL (NULL=ilimitado), is_saleable default true (false=insumo puro), image NULL, is_active, is_chef_recommendation, is_new |
| `product_ingredients` (pivote sin modelo) | id, product_id FK→products CASCADE (plato), ingredient_id FK→products CASCADE (insumo), quantity(10,2) |

### 2.3 Salón
| Tabla | Columnas clave |
|---|---|
| `areas` | id, name |
| `tables` | id, area_id FK→areas CASCADE, name, seats default 4, status ENUM(available,occupied,reserved), x_pos, y_pos (plano arrastrable) |
| `reservations` | id, client_name, phone NULL, reservation_time datetime, people, table_id NULL FK→tables SET NULL, note NULL, status ENUM(pending,confirmed,cancelled) |

### 2.4 Ventas (núcleo)
| Tabla | Columnas clave |
|---|---|
| `orders` | id, table_id NULL FK→tables (NULL=delivery/mostrador), user_id FK→users, client_id NULL FK→clients SET NULL, status ENUM(pending,completed,cancelled), total(10,2), subtotal/igv/total_gravada/exonerada/inafecta/gratuita(12,2), discount, tip, payment_method (cash/card), received_amount, change_amount, document_type (Ticket/Boleta/Factura), client_name default 'Público General', client_document NULL, serie(4) NULL, correlativo NULL, UNIQUE(document_type,serie,correlativo), cash_register_id NULL FK→cash_registers SET NULL, sunat_status default PENDING (PENDING/SENT/ACCEPTED/OBSERVED/REJECTED/ERROR/VOIDED), sunat_code, sunat_description, xml_path, cdr_path, pdf_path, hash, sent_at |
| `order_details` | id, order_id FK→orders CASCADE, product_id FK→products, quantity default 1, price (congelado), note NULL, status ENUM(pending,cooking,served) |

### 2.5 Caja y gastos
| Tabla | Columnas clave |
|---|---|
| `cash_registers` | id, user_id FK→users CASCADE, opening_time, closing_time NULL, opening_amount, closing_amount NULL, expected_amount NULL, difference NULL, status ENUM(open,closed), notes NULL |
| `expenses` | id, description, amount(10,2), user_id FK→users, cash_register_id NULL FK→cash_registers SET NULL |

### 2.6 Inventario / clientes
| Tabla | Columnas clave |
|---|---|
| `inventory_logs` (kardex) | id, product_id FK→products CASCADE, user_id FK→users, type (sale/purchase/adjustment), quantity, old_stock, new_stock, note NULL |
| `clients` | id, name, document_type default DNI, document_number NULL, email/phone/address NULL |

### 2.7 Delivery
| Tabla | Columnas clave |
|---|---|
| `delivery_drivers` | id, name, phone NULL, is_active |
| `deliveries` | id, order_id FK→orders CASCADE, client_id NULL FK→clients SET NULL, client_name, client_phone, address, reference NULL, driver_id NULL FK→drivers SET NULL, user_id FK→users, cash_register_id NULL FK→cash_registers SET NULL, status ENUM(pending,preparing,on_way,delivered,cancelled), payment_method ENUM(cash,card,transfer), delivery_fee(8,2), notes NULL, scheduled_at NULL, delivered_at NULL |

### 2.8 Facturación electrónica SUNAT Perú
| Tabla | Columnas clave |
|---|---|
| `document_series` | id, document_code(2) (01/03/07/08), document_type (factura/boleta/nota_credito/nota_debito), serie(4) UNIQUE (B001/F001/FC01/BC01), last_number, is_active. `DocumentSeries::next()` con `lockForUpdate` |
| `credit_notes` | id, order_id FK→orders CASCADE, serie(4), correlativo, UNIQUE(serie,correlativo), document_type default nota_credito, reason_code(2) Cat.09, reason_description, subtotal/igv/total, sunat_status/code/description, xml/cdr/pdf/hash, sent_at, user_id NULL FK→users SET NULL |
| `daily_summaries` (RC boletas) | id, reference_date, generation_date, correlativo, identifier (RC-yyyymmdd-N), UNIQUE(reference_date,correlativo), total_documents, total_amount(14,2), sunat_status (PENDING/TICKET/ACCEPTED/...), ticket, sunat_code/description, xml/cdr, hash, sent_at, consulted_at, user_id NULL |
| `settings` (clave-valor) | id, key UNIQUE, value NULL — empresa, moneda, ticket, SUNAT (ruc, razón, ubigeo, ambiente beta/produccion, igv 18%, SOL user/pass, cert pfx/p12) |

---

## 3. Modelos y relaciones

```
users 1──<N orders, cash_registers, expenses, inventory_logs, deliveries, credit_notes, daily_summaries
users 1──1 cash_registers(active, open, latest)
categories 1──<N products
products 1──<N order_details, inventory_logs
products N<──>N products vía product_ingredients (ingredients() belongsToMany + pivot quantity)
areas 1──<N tables
tables 1──<N orders (nullable) + reservations (SET NULL)
clients 1──<N orders + deliveries
cash_registers 1──<N orders + expenses + deliveries
orders 1──<N order_details (CASCADE) + credit_notes (CASCADE) + 1 delivery
delivery_drivers 1──<N deliveries
document_series / daily_summaries / settings : sin FK (lógica por código)
```

Lógica en modelos: `Product::recipe_cost` (suma cost*pivot), `Order::full_number` + `isElectronic()`, `Delivery::status_label/color/total_with_fee + scopes today/active`, `DocumentSeries::next()` atómico, casts decimales/fechas.

**Desalineaciones detectadas:** `Product.fillable.description` sin columna; `Table.fillable width,height` sin columnas; `Client.fillable` omite `document_type` e incluye `notes` inexistente; `users.role` enum vs string en migración condicional.

---

## 4. Controladores, rutas y comunicación

### 4.1 Mapa de rutas (`routes/web.php`)
- **Público:** `GET/POST /login`, `POST /logout`, `GET /menu` (carta QR).
- **Auth (todos):** caja abrir/cerrar, `GET /pos`, `GET /pos/table/{table}`, `POST /pos/.../add|barcode|discount|move|split`, `POST|DELETE /pos/detail/...`, `GET /kitchen` + `POST /kitchen/{detail}/status`, reservas CRUD.
- **Auth+admin,cashier:** `POST /pos/order/{order}/checkout`, `/sales`, `/sales/daily-report`, `/sales/{order}/ticket`, gastos `POST|DELETE /expenses`, delivery completo + drivers.
- **Auth+admin:** `/billing`, `/credit-notes`, `/daily-summaries`, `/` dashboard, `/reports`, `/assistant|/chat-ia|/ia/api/{accion}`, `/cash-registers`, resources `clients|categories|products|users`, `/inventory/logs`, `/settings`, `/system`, `/tables`.

### 4.2 Qué hace cada controlador
| Controlador | Función |
|---|---|
| `LoginController` | login/logout, redirección por rol (admin→dashboard, resto→POS) |
| `PosController` (núcleo) | mapa mesas+reservas, abrir pedido pending por mesa, add/update/note/remove ítem (AJAX → `pos.partials.cart`), barcode, descuento/propina, mover mesa, split (stub), pre-cuenta, ticket cocina, **checkout**: valida Factura (RUC 11 + razón), calcula IGV 18%, `DocumentSeries::next()`, cierra completed, descuenta stock (producto o insumos receta) + `InventoryLog(sale)`, intenta `SunatService::sendInvoice` no bloqueante |
| `KitchenController` (KDS) | cola FIFO `pending/cooking`, transición pending→cooking→served |
| `CashRegisterController` | apertura (opening_amount, anti-doble), cierre (expected = opening + ventas cash − gastos, difference), historial |
| `SaleController` | historial completed por fechas, totales cash/card, gastos+balance, ticket imprimible, corte Z |
| `DeliveryController` | Kanban today por estado, crear (Order table_id=null + Delivery), ver, cambiar estado (delivered_at), asignar driver, checkout (cobra + descuenta stock + cierra), cancelar, CRUD drivers |
| `BillingController` | bandeja Boleta/Factura con filtros, detalle, reintento SUNAT, descarga XML/CDR |
| `BillingPdfController` | PDF A4 + ticket 80mm con QR (QrCode) + datos empresa |
| `CreditNoteController` | lista, crear solo si order ACCEPTED, store con `DocumentSeries::next()` + envío inmediato, ver, retry, XML/CDR |
| `DailySummaryController` | lista RC, generar por `reference_date` (`DailySummaryBuilder` + `sendSummary` → ticket async), consultar ticket, XML/CDR |
| `DashboardController` | KPIs hoy/mes, meta 5000, charts 12m, top categorías/cinco productos, monitor mesas, bajo stock |
| `ReportController` | BI por rango: ventas por categoría, rendimiento mozos, top5/worst5 |
| `ProductController` | CRUD + barcode único, imagen, flags (saleable/chef/new/promo), receta `sync(ingredients)`, baja lógica, toggle, ajuste stock + kardex |
| `CategoryController` | CRUD (bloquea borrar con productos), imagen |
| `TableController` | áreas+mesas, posiciones drag&drop (`updatePositions` JSON), plano |
| `ClientController` | CRUD + perfil 360: totalSpent, visitas, última, rango (Oro/Plata/Bronce/Nuevo), plato favorito |
| `UserController` | CRUD roles admin/cashier/waiter, hash, anti-auto-borrado |
| `ExpenseController` | alta gasto atado a caja activa, baja |
| `ReservationController` | agenda futura, confirmar/cancelar, borrar |
| `SettingController` | empresa+logo, timezone/moneda/footer, SUNAT completo (ruc/razón/ubigeo/ambiente/igv/SOL/cert) |
| `SystemController` | conteos, reset (truncate orders/details/reservations/expenses/cash/inventory + stock=0, con password), backup/restore `mysqldump/mysql` vía `exec` |
| `MenuController` | carta pública: promos, chef, nuevos, populares (top6), categorías con productos |
| `AssistantController` | vistas IA + proxy `POST /ia/api/{accion}` a `app/Ia/api.php` (PDO/cURL), CSV o JSON, throttle |

### 4.3 Cómo se comunican (flujo operativo)
```
Login → (admin→Dashboard | mozo/cajero→POS, exige caja abierta)
CashRegister abre turno → habilita POS
Table/Area + Reservation → Pos@index (mapa)
Pos@order/add → Order pending + OrderDetail pending
Kitchen consume OrderDetail (pending→cooking→served) en paralelo
Pos@precheck/kitchenTicket → impresión
Pos@checkout (cashier/admin) → Order completed + serie/correlativo + stock/kardex + SUNAT
  → Billing (retry/xml/cdr/pdf) → CreditNote (si ACCEPTED) → DailySummary (boletas)
CashRegister cierra (expected vs real) → Sale/Report/Dashboard leen completed
Delivery (paralelo sin mesa): store→status/driver→checkout/cancel → también genera Order completed
Soporte: Product/Category (carta+barcode+receta), Client (checkout + delivery), User/Setting/System (admin),
Menu QR (vitrina), Assistant IA (BI conversacional sobre mismas tablas)
```

---

## 5. Formularios (Blade + JS)

| Módulo / Vista | Método/Action | Campos |
|---|---|---|
| Productos crear `products.create` | POST `products.store` multipart | name* text, category_id* select, barcode text, cost number, price* number, stock number, is_saleable switch checked, promotional_price, is_chef_recommendation switch, is_new switch, image file |
| Productos editar `products.edit` | PUT `products.update` multipart | mismos + stock readonly, cost readonly si tiene receta + escandallo, ingredients[ID] number dinámico (addIngredient JS) |
| Productos index | POST `products.toggle`, DELETE `products.destroy` (confirm), POST `products.adjust` modal (type add/sub select + quantity min1) | activar/desactivar, eliminar, ajuste stock |
| Categorías `categories.index` modal | POST `categories.store` multipart + DELETE destroy | name* (Ej Bebidas), image file |
| Mesas `tables.index` | POST `tables.storeArea` (name*), POST `tables.storeTable` (name*, area_id*), DELETE area/table, `fetch tables.updatePositions` JSON {id,x,y} drag | plano arrastrable |
| Reservas `reservations.index` modal | POST `reservations.store`, PUT `reservations.status` (hidden confirmed/cancelled), DELETE destroy | client_name*, phone, reservation_time* datetime-local, people* min1, table_id select, note textarea |
| Clientes `clients.index` modales | POST `clients.store`, PUT `/clients/+id` JS (editClient), DELETE destroy | name*, document_number, phone, email, address |
| Gastos `sales.index` modal | POST `expenses.store`, DELETE `expenses.destroy` + GET filtros `sales.index?start_date&end_date` | description*, amount* |
| Caja `cash_registers.create/close` | POST `cash_registers.store` (opening_amount* min0), POST `cash_registers.processClose` (closing_amount*, notes) | fondo inicial, conteo físico |
| Delivery crear `delivery.create` | POST `delivery.store` (carrito JS `deliveryCart[]`) | client_id select (autocompleta), client_name*, client_phone*, address* textarea, reference, payment_method* (cash/card/transfer), delivery_fee, driver_id, notes, products[][id/qty] hidden + buscador |
| Delivery detalle `delivery.show` | POST `delivery.cancel`, POST `delivery.driver` (driver_id select), POST `delivery.status` (status select), POST `delivery.checkout` modal (document_type Ticket/Boleta/Factura, received_amount, change JS) | asignar, avanzar, cobrar |
| Drivers `delivery.drivers` | POST `delivery.drivers.store` (name*, phone), PUT update (name*,phone,is_active switch), DELETE destroy | repartidores |
| Usuarios `users.index` + perfil layout | POST `users.store` (name*,email*,password*,role waiter/cashier/admin), PUT `/users/+id` (editUser, password opcional), perfil propio PUT | personal + RBAC |
| Settings `settings.index` | POST `settings.update` multipart | company_name*, phone, address, timezone select, currency S/$/€, ticket_footer, logo file, sunat_ruc 11d, razón, nombre comercial, dirección fiscal, ubigeo, depto/prov/dist/urb, environment beta/produccion, igv_rate, sol_user/pass, cert pfx/p12 + pass |
| POS `pos.order` (AJAX, sin submit) + modales | POST `pos.add|barcode|update|note|discount`, DELETE remove, POST `pos.move` (target_table_id*), POST `pos.checkout` (client_search+datalist, client_id hidden, client_document readonly, document_type, payment cash/card radio, received_amount, change), POST `pos.split` (selected_items[] checkbox, payment radio) | venta en mesa, mover, dividir, cobrar |
| Facturación `billing.index/show` | GET filtros (type,status,from,to,q), POST `billing.retry` (confirm) | bandeja SUNAT |
| NC `credit_notes.create` | POST `credit_notes.store` | reason_code* Cat09, reason_description* |
| RC `daily_summaries.index` | POST `daily_summaries.store` (reference_date* default ayer), POST `daily_summaries.check` | resumen boletas |
| Otros | `reports.index` GET (start/end), `kitchen` POST update (sin inputs), `system` POST backup/restore (file)/reset (password), `login` POST (email*,password*) | BI, KDS, sistema, auth |

JS: `resources/js/app.js/bootstrap.js` solo base; `public/assets/ia/ia.js` (221 lín) chat IA + charts; resto inline por Blade (carrito, drag, modales, vuelto, scanner, split, reloj cocina 15s, Chart.js reportes).

---

## 6. Listado exhaustivo — todas las funciones que cumple el sistema

### A. Acceso y roles
1. Login/logout con validación y regeneración de sesión.
2. Redirección por rol y sidebar/topbar filtrado.
3. CRUD usuarios (admin/cajero/mozo) con hash y anti-auto-eliminación + auto-perfil.

### B. Salón / POS
4. Mapa de áreas y mesas con estados (libre/ocupada/reservada) y total.
5. Diseño visual salón arrastrable con guardado de coordenadas.
6. Apertura de pedido por mesa (pending auto-creado).
7. Agregar por clic y por barcode/escáner con validación.
8. Editar cantidad, nota cocina, eliminar línea (AJAX sin recarga).
9. Descuento y propina por pedido.
10. Mover pedido entre mesas (bloquea destino ocupado).
11. Dividir cuenta (UI lista, stub backend).
12. Pre-cuenta y ticket cocina imprimibles.
13. Checkout con cliente (datalist), documento, pago efectivo/tarjeta, recibido/vuelto.

### C. Cocina (KDS)
14. Cola FIFO de pedidos con líneas pending/cooking.
15. Cambio estado pending→cooking→served, auto-refresh 15s.

### D. Caja y gastos
16. Apertura/cierre turnos con fondo, esperado (ventas cash − gastos), diferencia.
17. Historial turnos auditado.
18. Registro/eliminación gastos atados a caja activa.
19. Middleware que bloquea POS sin caja abierta.

### E. Delivery
20. Kanban por estados + contadores + repartidores activos.
21. Creación con cliente (existente/nuevo), dirección, fee, driver, programado, carrito JS.
22. Detalle con cambio estado, reasignación driver, cancelación (anula order).
23. Cobro propio (Ticket/Boleta/Factura, vuelto) que cierra order y descuenta stock.
24. CRUD repartidores con activos e historial.

### F. Reservas
25. Agenda futura ordenada con mesa asignable.
26. Confirmar/cancelar, eliminar historial, feed a POS (confirmadas hoy).

### G. Clientes / CRM
27. CRUD + contador pedidos.
28. Perfil 360: gasto total, visitas, última, rango fidelidad, plato favorito.

### H. Catálogo e inventario
29. CRUD categorías con imagen y bloqueo si tiene productos.
30. CRUD productos con barcode único, imagen, precio/promo/costo/stock, flags vendible/chef/nuevo/activo.
31. Recetas/escandallos (insumo+cantidad), costo calculado y margen.
32. Baja lógica + toggle visibilidad.
33. Ajustes manuales stock (entradas/mermas) + kardex con saldos y usuario.
34. Descuento automático stock al cobrar (producto directo o insumos receta).
35. Alerta bajo stock (≤5) en dashboard.

### I. Ventas y reportes
36. Historial ventas completed por fechas con totales cash/card, gastos y balance.
37. Ticket imprimible y corte Z diario.
38. Dashboard admin: KPIs hoy/mes, meta, charts 12m, radar categorías, monitor mesas, top productos.
39. Reportes BI: dona categorías, barras mozos, top5/worst5.
40. Asistente IA conversacional + chat con queries, charts y CSV.

### J. Facturación electrónica SUNAT
41. Numeración atómica por serie (B/F/FC/BC).
42. Cálculo IGV 18% y desglose gravada/exonerada/inafecta/gratuita.
43. Envío no bloqueante + estados SUNAT + reintento + trazabilidad (código, hash, rutas XML/CDR/PDF, fechas).
44. Descargas XML/CDR y PDF A4/ticket 80mm con QR.
45. Validación Factura (RUC 11 + razón distinta de Público General).
46. Notas de crédito (motivos Cat.09) solo sobre ACCEPTED + envío inmediato.
47. Resumen diario RC de boletas (generar/enviar ticket async + consultar).
48. Configuración empresa + entorno beta/producción + certificado digital.

### K. Carta pública y sistema
49. Carta QR pública con promos, chef, nuevos, populares y categorías.
50. Settings centralizados (empresa, moneda, timezone, ticket, SUNAT).
51. Sistema: conteos, reset con password (truncate + stock 0), backup/restore SQL vía mysqldump.

---

## 7. Notas técnicas
- Stock `NULL` = ilimitado/servicio; `is_saleable=false` oculta de POS/menú pero sirve como insumo.
- Checkout POS y Delivery comparten lógica stock/kardex pero Delivery siempre crea `Ticket` sin SUNAT automática.
- `pos.split` es stub (`redirect back`).
- Backup/restore usa `exec(mysqldump/mysql)` — requiere binarios y credenciales `.env`.
- Ver PDFs raíz: `documentacion_facturacion_electronica.pdf`, `documentacion_sistema_pos.pdf`.

