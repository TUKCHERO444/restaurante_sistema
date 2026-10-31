<?php

use App\Http\Controllers\Api\V1\AuthController;
use App\Http\Controllers\Api\V1\AreaController;
use App\Http\Controllers\Api\V1\CajaController;
use App\Http\Controllers\Api\V1\CategoriaController;
use App\Http\Controllers\Api\V1\ClienteController;
use App\Http\Controllers\Api\V1\ConfiguracionController;
use App\Http\Controllers\Api\V1\GastoController;
use App\Http\Controllers\Api\V1\HealthController;
use App\Http\Controllers\Api\V1\MesaController;
use App\Http\Controllers\Api\V1\MovimientoInventarioController;
use App\Http\Controllers\Api\V1\NotaCreditoController;
use App\Http\Controllers\Api\V1\PedidoController;
use App\Http\Controllers\Api\V1\PedidoDetalleController;
use App\Http\Controllers\Api\V1\PosController;
use App\Http\Controllers\Api\V1\ProductoController;
use App\Http\Controllers\Api\V1\RepartidorController;
use App\Http\Controllers\Api\V1\RepartoController;
use App\Http\Controllers\Api\V1\ReservaController;
use App\Http\Controllers\Api\V1\ResumenDiarioController;
use App\Http\Controllers\Api\V1\SerieDocumentoController;
use App\Http\Controllers\Api\V1\UsuarioController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes — v1
|--------------------------------------------------------------------------
|
| Todas las rutas de este archivo quedan bajo el prefijo /api/v1
| (ver `apiPrefix` en bootstrap/app.php). El frontend las consume
| exclusivamente como HTTP/JSON.
|
*/

// Comprobación de salud de la API (sin autenticación).
Route::get('/health', HealthController::class)->name('api.v1.health');

// Autenticación (Sanctum SPA — cookies + sesión).
Route::post('/login', [AuthController::class, 'login'])->name('api.v1.login');

// Rutas protegidas: requieren token de Sanctum válido.
Route::middleware('auth:sanctum')->group(function (): void {
    Route::post('/logout', [AuthController::class, 'logout'])->name('api.v1.logout');
    Route::get('/user', [AuthController::class, 'user'])->name('api.v1.user');
});

/*
| Recursos base del dominio (CRUD sin lógica de negocio todavía).
| Protegidos por Sanctum: requieren autenticación para acceder.
*/
Route::middleware('auth:sanctum')->group(function (): void {
    Route::apiResources([
    'usuarios' => UsuarioController::class,
    'areas' => AreaController::class,
    'mesas' => MesaController::class,
    'categorias' => CategoriaController::class,
    'productos' => ProductoController::class,
    'reservas' => ReservaController::class,
    'clientes' => ClienteController::class,
    'pedidos' => PedidoController::class,
    'pedido-detalles' => PedidoDetalleController::class,
    'cajas' => CajaController::class,
    'gastos' => GastoController::class,
    'movimientos-inventario' => MovimientoInventarioController::class,
    'repartidores' => RepartidorController::class,
    'repartos' => RepartoController::class,
    'configuraciones' => ConfiguracionController::class,
    'series-documentos' => SerieDocumentoController::class,
    'notas-credito' => NotaCreditoController::class,
    'resumenes-diarios' => ResumenDiarioController::class,
], [
    'parameters' => [
        'configuraciones' => 'configuracion',
        'repartidores' => 'repartidor',
        'pedido-detalles' => 'detalle',
        'movimientos-inventario' => 'movimiento',
        'series-documentos' => 'serie',
        'notas-credito' => 'nota',
        'resumenes-diarios' => 'resumen',
    ],
    ]);

    // Rutas adicionales para operaciones de pedidos
    Route::prefix('pedidos')->group(function (): void {
        Route::post('{pedido}/detalles', [PedidoController::class, 'addDetalle'])->name('api.v1.pedidos.detalles.store');
        Route::put('{pedido}/detalles/{detalle}', [PedidoController::class, 'updateDetalle'])->name('api.v1.pedidos.detalles.update');
        Route::delete('{pedido}/detalles/{detalle}', [PedidoController::class, 'removeDetalle'])->name('api.v1.pedidos.detalles.destroy');
        Route::post('{pedido}/checkout', [PedidoController::class, 'checkout'])->name('api.v1.pedidos.checkout');
        Route::post('{pedido}/cancelar', [PedidoController::class, 'cancelar'])->name('api.v1.pedidos.cancelar');
    });

    // Rutas adicionales para reservas
    Route::prefix('reservas')->group(function (): void {
        Route::post('{reserva}/confirmar', [ReservaController::class, 'confirm'])->name('api.v1.reservas.confirmar');
        Route::post('{reserva}/cancelar', [ReservaController::class, 'cancel'])->name('api.v1.reservas.cancelar');
    });

    // Rutas adicionales para repartos
    Route::prefix('repartos')->group(function (): void {
        Route::post('{reparto}/estado', [RepartoController::class, 'updateStatus'])->name('api.v1.repartos.estado');
        Route::post('{reparto}/asignar', [RepartoController::class, 'assignDriver'])->name('api.v1.repartos.asignar');
        Route::post('{reparto}/checkout', [RepartoController::class, 'checkout'])->name('api.v1.repartos.checkout');
    });

    // Rutas adicionales para productos
    Route::prefix('productos')->group(function (): void {
        Route::post('{producto}/toggle', [ProductoController::class, 'toggle'])->name('api.v1.productos.toggle');
        Route::post('{producto}/adjust', [ProductoController::class, 'adjust'])->name('api.v1.productos.adjust');
        Route::post('{producto}/ingredientes', [ProductoController::class, 'syncIngredientes'])->name('api.v1.productos.ingredientes');
    });

    // Rutas para mesas
    Route::post('mesas/posiciones', [MesaController::class, 'updatePositions'])->name('api.v1.mesas.posiciones');

    // API del Punto de Venta (POS)
    Route::prefix('pos')->group(function (): void {
        Route::get('mapa-mesas', [PosController::class, 'mapaMesas'])->name('api.v1.pos.mapa-mesas');
        Route::get('categorias', [PosController::class, 'categoriasConProductos'])->name('api.v1.pos.categorias');
        Route::get('clientes', [PosController::class, 'buscarClientes'])->name('api.v1.pos.clientes');
        Route::get('mesa/{mesa}', [PosController::class, 'obtenerPedido'])->name('api.v1.pos.mesa.show');

        Route::post('pedido/{mesa}/agregar', [PosController::class, 'agregarProducto'])->name('api.v1.pos.pedido.agregar');
        Route::post('pedido/{pedido}/opciones', [PosController::class, 'aplicarOpciones'])->name('api.v1.pos.pedido.opciones');
        Route::post('pedido/{pedido}/mover-mesa', [PosController::class, 'moverMesa'])->name('api.v1.pos.pedido.mover-mesa');
        Route::post('pedido/{pedido}/cobrar', [PosController::class, 'cobrar'])->name('api.v1.pos.pedido.cobrar');

        Route::put('detalle/{detalle}/cantidad', [PosController::class, 'actualizarCantidad'])->name('api.v1.pos.detalle.cantidad');
        Route::put('detalle/{detalle}/nota', [PosController::class, 'guardarNota'])->name('api.v1.pos.detalle.nota');
        Route::delete('detalle/{detalle}', [PosController::class, 'eliminarLinea'])->name('api.v1.pos.detalle.destroy');
    });
});
