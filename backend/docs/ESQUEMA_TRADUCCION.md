# Análisis y traducción del esquema — Español técnico

Origen: `docs/DICCIONARIO_BASE_DATOS.md` + `docs/RESUMEN_EJECUTIVO.md`
(BD `restaurante_db`, sistema monolítico anterior en inglés).
Destino: esquema nuevo en español dentro de este proyecto API (`backend/`).

## 1. Análisis del esquema origen

- **20 tablas de negocio** (19 con migración + `ia_consultas` creada por código,
  sin migración) y **7 de sistema** Laravel.
- **Single-tenant** (ver §0 del diccionario): sin `tenant_id`; `settings`
  guarda la única razón social (exigencia SUNAT Perú).
- Sin borrado lógico `deleted_at`: bandera `activo` + borrado físico puntual.
- Dinero por capas: operativo `DECIMAL(10,2)`, fiscal `DECIMAL(12,2)`,
  agregados `DECIMAL(14,2)`, envío `DECIMAL(8,2)`.
- `stock NULL` = no se controla / ilimitado; `vendible=false` = insumo puro.
- Estados como `ENUM` MySQL (mesas, pedidos, caja, cocina, delivery, SUNAT).
- Módulo país-específico: series, notas de crédito, resúmenes diarios y
  columnas `sunat_*` / desglose IGV en `pedidos` (facturación electrónica Perú).
- **Desalineaciones origen** (se corrigen aquí): `products.fillable`
  con `description` inexistente; `tables.fillable` con `width/height`
  inexistentes; `clients.fillable` sin `document_type` y con `notes`
  inexistente; `users.role` enum vs string según migración.

## 2. Decisiones de traducción

1. Solo se traduce el **dominio negocio**. Tablas internas del framework
   (`cache`, `jobs`, `sessions`, `password_reset_tokens`,
   `personal_access_tokens`, `migrations`) quedan intactas en inglés.
2. Vocabulario alineado con las vistas `v_ia_*` del sistema anterior
   (ya usaban español: venta, mesa, caja, gasto, reparto…).
3. `snake_case`, sin `ñ` ni tildes (`contrasena`, `numero_documento`).
4. `created_at/updated_at` → `creado_en/actualizado_en` mediante
   `ModeloBase` (`CREATED_AT` / `UPDATED_AT`).
5. `usuarios` sustituye a `users` (se reescribe la migración inicial;
   la BD local aún no tiene datos reales). Auth compatible vía overrides
   en el modelo (`contrasena`, `correo`, `token_recuerdame`) y
   `config/auth.php` → `App\Models\Usuario`.
6. Dinero peruano: `efectivo/tarjeta/transferencia`, vuelto (`vuelto`),
   IGV 18%, `Público general`, DNI/RUC.
7. `ENUM` con valores en español (ver §4).

## 3. Mapa de tablas

| Origen (EN)          | Destino (ES)           | Modelo            | Notas                              |
| -------------------- | ---------------------- | ----------------- | ---------------------------------- |
| `users`              | `usuarios`             | `Usuario`         | Autenticable + Sanctum             |
| `areas`              | `areas`                | `Area`            | Zonas del salón                    |
| `tables`             | `mesas`                | `Mesa`            | Con plano (`pos_x`, `pos_y`)       |
| `categories`         | `categorias`           | `Categoria`       |                                    |
| `products`           | `productos`            | `Producto`        | Vendibles e insumos                |
| `product_ingredients`| `producto_ingredientes`| — (pivote)        | Receta: `cantidad`                 |
| `reservations`       | `reservas`             | `Reserva`         |                                    |
| `clients`            | `clientes`             | `Cliente`         | Se corrige fillable                |
| `orders`             | `pedidos`              | `Pedido`          | Cabecera venta (núcleo)            |
| `order_details`      | `pedido_detalles`      | `PedidoDetalle`   | Línea de cocina (KDS)              |
| `cash_registers`     | `cajas`                | `Caja`            | Turnos de caja                     |
| `expenses`           | `gastos`               | `Gasto`           |                                    |
| `inventory_logs`     | `movimientos_inventario`| `MovimientoInventario` | Kardex                        |
| `delivery_drivers`   | `repartidores`         | `Repartidor`      |                                    |
| `deliveries`         | `repartos`             | `Reparto`         | Delivery con `pedido` 1:1          |
| `settings`           | `configuraciones`      | `Configuracion`   | Clave-valor (empresa + SUNAT)      |
| `document_series`    | `series_documentos`    | `SerieDocumento`  | Talonarios B/F/BC/FC + `siguiente()`|
| `credit_notes`       | `notas_credito`        | `NotaCredito`     | Solo sobre pedido aceptado SUNAT   |
| `daily_summaries`    | `resumenes_diarios`    | `ResumenDiario`   | RC de boletas                      |
| `ia_consultas`       | `ia_consultas`         | `IaConsulta`      | Ya estaba en español               |

## 4. Mapa de columnas y enums

| Origen | Destino | Alcance |
| ------ | ------- | ------- |
| `name` | `nombre` | general |
| `email` | `correo` | usuarios, clientes |
| `email_verified_at` | `correo_verificado_en` | usuarios |
| `password` | `contrasena` | usuarios (override `getAuthPassword`) |
| `remember_token` | `token_recuerdame` | usuarios (override nombre token) |
| `role: admin/cashier/waiter/kitchen` | `rol: administrador/cajero/mozo/cocina` | usuarios |
| `seats` | `asientos` | mesas |
| `status: available/occupied/reserved` | `estado: libre/ocupada/reservada` | mesas |
| `x_pos/y_pos` | `pos_x/pos_y` | mesas |
| `category_id` | `categoria_id` | productos |
| `code/barcode` | `codigo/codigo_barras` (UNIQUE) | productos |
| `price/promotional_price/cost` | `precio/precio_promocional/costo` | productos |
| `is_saleable` | `vendible` | productos |
| `image` | `imagen` | productos, categorías |
| `is_active` | `activo` | general |
| `is_chef_recommendation/is_new` | `recomendado_chef/nuevo` | productos |
| `product_id/ingredient_id/quantity` | `producto_id/ingrediente_id/cantidad` | receta |
| `client_name/phone/reservation_time/people/table_id/note` | `nombre_cliente/telefono/fecha_reserva/personas/mesa_id/nota` | reservas |
| `status: pending/confirmed/cancelled` | `estado: pendiente/confirmada/cancelada` | reservas |
| `document_type/document_number` | `tipo_documento/numero_documento` (UNIQUE) | clientes |
| `address` | `direccion` | clientes, repartos |
| `table_id/user_id/client_id/cash_register_id` | `mesa_id/usuario_id/cliente_id/caja_id` | pedidos |
| `status: pending/completed/cancelled` | `estado: pendiente/completada/anulada` | pedidos |
| `subtotal/igv/total_gravada/exonerada/inafecta/gratuita` | `subtotal/igv/total_gravado/exonerado/inafecto/gratuito` (12,2) | pedidos, notas |
| `payment_method: cash/card` | `metodo_pago: efectivo/tarjeta` | pedidos |
| `discount/tip/received_amount/change_amount` | `descuento/propina/monto_recibido/vuelto` | pedidos |
| `document_type: Ticket/Boleta/Factura` | `tipo_comprobante: ticket/boleta/factura` | pedidos |
| `client_name/client_document` | `nombre_cliente/documento_cliente` | pedidos |
| `serie/correlativo` + UNIQUE(`tipo_comprobante,serie,correlativo`) | igual | pedidos |
| `sunat_status: PENDING/SENT/ACCEPTED/OBSERVED/REJECTED/ERROR/VOIDED` | `estado_sunat: PENDIENTE/ENVIADO/ACEPTADO/OBSERVADO/RECHAZADO/ERROR/ANULADO` | pedidos, notas, resúmenes |
| `sunat_code/description/xml_path/cdr_path/pdf_path/hash/sent_at` | `codigo_sunat/descripcion_sunat/ruta_xml/ruta_cdr/ruta_pdf/hash/enviado_en` | fiscal |
| `order_id/product_id/quantity/price/note` | `pedido_id/producto_id/cantidad/precio/nota` | pedido_detalles |
| `status: pending/cooking/served` | `estado: pendiente/en_cocina/servido` | pedido_detalles |
| `opening_time/closing_time/opening_amount/closing_amount/expected_amount/difference` | `apertura_en/cierre_en/monto_apertura/monto_cierre/monto_esperado/diferencia` | cajas |
| `status: open/closed` | `estado: abierta/cerrada` | cajas |
| `description/amount` | `concepto/monto` | gastos |
| `type: sale/purchase/adjustment` | `tipo: venta/compra/ajuste` | movimientos |
| `old_stock/new_stock` | `stock_anterior/stock_nuevo` | movimientos |
| `driver_id` | `repartidor_id` | repartos |
| `status: pending/preparing/on_way/delivered/cancelled` | `estado: pendiente/en_preparacion/en_camino/entregado/cancelado` | repartos |
| `payment_method: cash/card/transfer` | `metodo_pago: efectivo/tarjeta/transferencia` | repartos |
| `delivery_fee` | `costo_envio` (8,2) | repartos |
| `scheduled_at/delivered_at` | `programado_para/entregado_en` | repartos |
| `key/value` (`key` UNIQUE) | `clave/valor` (`clave` UNIQUE) | configuraciones |
| `document_code/document_type/serie/last_number` | `codigo_documento/tipo_documento/serie/ultimo_numero` (`serie` UNIQUE) | series |
| `reason_code/reason_description` | `codigo_motivo/descripcion_motivo` | notas_credito |
| `reference_date/generation_date/correlativo/identifier` | `fecha_referencia/fecha_generacion/correlativo/identificador` | resúmenes |
| `total_documents/total_amount` | `total_documentos/monto_total` (14,2) | resúmenes |
| `ticket/consulted_at` | `ticket/consultado_en` | resúmenes |

Acciones FK idénticas al origen: CASCADE en
productos→categorías, pedido_detalles/notas/reparto→pedidos,
movimientos→productos, cajas→usuarios, mesas→áreas, receta→productos (ambas);
SET NULL en cliente/caja de pedidos, mesa de reservas, caja de gastos,
cliente/repartidor/caja de repartos, usuario de notas/resúmenes;
RESTRICT de mesa en pedidos.
