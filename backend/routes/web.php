<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AreaController;
use App\Http\Controllers\CategoriaController;
use App\Http\Controllers\CajaController;
use App\Http\Controllers\ClienteController;
use App\Http\Controllers\ConfiguracionController;
use App\Http\Controllers\GastoController;
use App\Http\Controllers\MesaController;
use App\Http\Controllers\MovimientoInventarioController;
use App\Http\Controllers\NotaCreditoController;
use App\Http\Controllers\PedidoController;
use App\Http\Controllers\ProductoController;
use App\Http\Controllers\RepartidorController;
use App\Http\Controllers\RepartoController;
use App\Http\Controllers\ReservaController;
use App\Http\Controllers\ResumenDiarioController;
use App\Http\Controllers\SerieDocumentoController;
use App\Http\Controllers\UsuarioController;

// Ruta pública de bienvenida
Route::get('/', function () {
    return view('welcome');
});

// ============================================================================
// RUTAS DE NEGOCIO — Sistema Restaurante
// ============================================================================

// Módulo: Configuraciones (clave-valor)
Route::resource('configuraciones', ConfiguracionController::class);

// Módulo: Categorías
Route::resource('categorias', CategoriaController::class);

// Módulo: Áreas
Route::resource('areas', AreaController::class);

// Módulo: Mesas (con posiciones drag&drop)
Route::resource('mesas', MesaController::class);
Route::post('mesas/posiciones', [MesaController::class, 'updatePositions'])->name('mesas.posiciones');

// Módulo: Series de Documentos (SUNAT)
Route::resource('series-documentos', SerieDocumentoController::class);

// Módulo: Usuarios
Route::resource('usuarios', UsuarioController::class);

// Módulo: Clientes
Route::resource('clientes', ClienteController::class);

// Módulo: Productos (con receta y ajuste de stock)
Route::resource('productos', ProductoController::class);
Route::post('productos/{producto}/toggle', [ProductoController::class, 'toggle'])->name('productos.toggle');
Route::post('productos/{producto}/adjust', [ProductoController::class, 'adjust'])->name('productos.adjust');
Route::post('productos/{producto}/ingredientes', [ProductoController::class, 'syncIngredientes'])->name('productos.ingredientes');

// Módulo: Cajas (apertura/cierre)
Route::get('cajas', [CajaController::class, 'index'])->name('cajas.index');
Route::get('cajas/create', [CajaController::class, 'create'])->name('cajas.create');
Route::post('cajas', [CajaController::class, 'store'])->name('cajas.store');
Route::get('cajas/{caja}', [CajaController::class, 'show'])->name('cajas.show');
Route::post('cajas/{caja}/cerrar', [CajaController::class, 'processClose'])->name('cajas.cerrar');

// Módulo: Reservas
Route::resource('reservas', ReservaController::class);
Route::post('reservas/{reserva}/confirmar', [ReservaController::class, 'confirm'])->name('reservas.confirmar');
Route::post('reservas/{reserva}/cancelar', [ReservaController::class, 'cancel'])->name('reservas.cancelar');

// Módulo: Gastos
Route::get('gastos', [GastoController::class, 'index'])->name('gastos.index');
Route::get('gastos/create', [GastoController::class, 'create'])->name('gastos.create');
Route::post('gastos', [GastoController::class, 'store'])->name('gastos.store');
Route::delete('gastos/{gasto}', [GastoController::class, 'destroy'])->name('gastos.destroy');

// Módulo: Movimientos de Inventario (kardex)
Route::resource('movimientos-inventario', MovimientoInventarioController::class);

// Módulo: Pedidos (con checkout y detalles)
Route::resource('pedidos', PedidoController::class);
Route::post('pedidos/{pedido}/detalles', [PedidoController::class, 'addDetalle'])->name('pedidos.detalles.store');
Route::put('pedidos/{pedido}/detalles/{detalle}', [PedidoController::class, 'updateDetalle'])->name('pedidos.detalles.update');
Route::delete('pedidos/{pedido}/detalles/{detalle}', [PedidoController::class, 'removeDetalle'])->name('pedidos.detalles.destroy');
Route::post('pedidos/{pedido}/checkout', [PedidoController::class, 'checkout'])->name('pedidos.checkout');
Route::post('detalles/{detalle}/estado', [PedidoController::class, 'updateDetalleStatus'])->name('detalles.estado');

// Módulo: Repartos (delivery)
Route::resource('repartos', RepartoController::class);
Route::post('repartos/{reparto}/estado', [RepartoController::class, 'updateStatus'])->name('repartos.estado');
Route::post('repartos/{reparto}/asignar', [RepartoController::class, 'assignDriver'])->name('repartos.asignar');
Route::post('repartos/{reparto}/checkout', [RepartoController::class, 'checkout'])->name('repartos.checkout');

// Módulo: Repartidores
Route::resource('repartidores', RepartidorController::class);

// Módulo: Notas de Crédito
Route::resource('notas-credito', NotaCreditoController::class);

// Módulo: Resúmenes Diarios
Route::resource('resumenes-diarios', ResumenDiarioController::class);
