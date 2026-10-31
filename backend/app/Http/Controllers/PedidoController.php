<?php

namespace App\Http\Controllers;

use App\Http\Requests\PedidoFormRequest;
use App\Http\Requests\PedidoDetalleFormRequest;
use App\Models\Pedido;
use App\Models\PedidoDetalle;
use App\Models\Producto;
use App\Models\Mesa;
use App\Models\Cliente;
use App\Models\Caja;
use App\Models\SerieDocumento;
use App\Models\MovimientoInventario;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\View\View;
use Illuminate\Support\Facades\DB;

class PedidoController extends Controller
{
    public function index(Request $request): View
    {
        $pedidos = Pedido::with(['mesa', 'usuario', 'cliente', 'detalles.producto'])
            ->orderBy('creado_en', 'desc')
            ->get();
        return view('pedidos.index', compact('pedidos'));
    }

    public function create(): View
    {
        $mesas = Mesa::where('estado', 'libre')->orderBy('nombre')->get();
        $clientes = Cliente::orderBy('nombre')->get();
        $productos = Producto::where('activo', true)->where('vendible', true)->orderBy('nombre')->get();
        return view('pedidos.create', compact('mesas', 'clientes', 'productos'));
    }

    public function store(PedidoFormRequest $request): RedirectResponse
    {
        $data = $request->validated();
        $data['usuario_id'] = auth()->id();
        $data['estado'] = 'pendiente';

        // Caja activa del usuario
        $cajaAbierta = Caja::where('usuario_id', auth()->id())
            ->where('estado', 'abierta')
            ->first();
        $data['caja_id'] = $cajaAbierta?->id;

        $pedido = Pedido::create($data);

        return redirect()->route('pedidos.show', $pedido)
            ->with('success', 'Pedido creado exitosamente.');
    }

    public function show(Pedido $pedido): View
    {
        $pedido->load(['mesa', 'usuario', 'cliente', 'detalles.producto', 'caja']);
        return view('pedidos.show', compact('pedido'));
    }

    public function edit(Pedido $pedido): View
    {
        $mesas = Mesa::orderBy('nombre')->get();
        $clientes = Cliente::orderBy('nombre')->get();
        $productos = Producto::where('activo', true)->where('vendible', true)->orderBy('nombre')->get();
        return view('pedidos.edit', compact('pedido', 'mesas', 'clientes', 'productos'));
    }

    public function update(PedidoFormRequest $request, Pedido $pedido): RedirectResponse
    {
        if ($pedido->estado !== 'pendiente') {
            return redirect()->route('pedidos.index')
                ->with('error', 'Solo se pueden editar pedidos pendientes.');
        }

        $pedido->update($request->validated());

        return redirect()->route('pedidos.show', $pedido)
            ->with('success', 'Pedido actualizado exitosamente.');
    }

    public function destroy(Pedido $pedido): RedirectResponse
    {
        if ($pedido->estado !== 'pendiente') {
            return redirect()->route('pedidos.index')
                ->with('error', 'Solo se pueden eliminar pedidos pendientes.');
        }

        $pedido->delete();

        return redirect()->route('pedidos.index')
            ->with('success', 'Pedido eliminado exitosamente.');
    }

    /**
     * Agregar producto al pedido.
     */
    public function addDetalle(PedidoDetalleFormRequest $request, Pedido $pedido): RedirectResponse
    {
        if ($pedido->estado !== 'pendiente') {
            return redirect()->route('pedidos.show', $pedido)
                ->with('error', 'Solo se pueden agregar productos a pedidos pendientes.');
        }

        $producto = Producto::findOrFail($request->input('producto_id'));

        // Verificar stock
        if ($producto->stock !== null && $producto->stock < $request->input('cantidad')) {
            return redirect()->route('pedidos.show', $pedido)
                ->with('error', 'Stock insuficiente.');
        }

        $pedido->detalles()->create([
            'producto_id' => $producto->id,
            'cantidad' => $request->input('cantidad'),
            'precio' => $producto->precio_promocional ?? $producto->precio,
            'nota' => $request->input('nota'),
            'estado' => 'pendiente',
        ]);

        return redirect()->route('pedidos.show', $pedido)
            ->with('success', 'Producto agregado.');
    }

    /**
     * Actualizar cantidad de un detalle.
     */
    public function updateDetalle(Request $request, Pedido $pedido, PedidoDetalle $detalle): RedirectResponse
    {
        $request->validate([
            'cantidad' => 'required|integer|min:1|max:999',
        ]);

        if ($pedido->estado !== 'pendiente') {
            return redirect()->route('pedidos.show', $pedido)
                ->with('error', 'Solo se pueden modificar pedidos pendientes.');
        }

        $detalle->update(['cantidad' => $request->input('cantidad')]);

        return redirect()->route('pedidos.show', $pedido)
            ->with('success', 'Cantidad actualizada.');
    }

    /**
     * Eliminar detalle del pedido.
     */
    public function removeDetalle(Pedido $pedido, PedidoDetalle $detalle): RedirectResponse
    {
        if ($pedido->estado !== 'pendiente') {
            return redirect()->route('pedidos.show', $pedido)
                ->with('error', 'Solo se pueden modificar pedidos pendientes.');
        }

        $detalle->delete();

        return redirect()->route('pedidos.show', $pedido)
            ->with('success', 'Producto eliminado.');
    }

    /**
     * Checkout: completar pedido, calcular totales, descontar stock, generar comprobante.
     */
    public function checkout(Request $request, Pedido $pedido): RedirectResponse
    {
        if ($pedido->estado !== 'pendiente') {
            return redirect()->route('pedidos.index')
                ->with('error', 'El pedido ya fue procesado.');
        }

        $request->validate([
            'tipo_comprobante' => 'required|in:ticket,boleta,factura',
            'metodo_pago' => 'required|in:efectivo,tarjeta',
            'monto_recibido' => 'nullable|numeric|min:0',
            'descuento' => 'nullable|numeric|min:0',
            'propina' => 'nullable|numeric|min:0',
        ]);

        DB::transaction(function () use ($request, $pedido) {
            // Calcular totales
            $subtotal = $pedido->detalles->sum(fn ($d) => $d->precio * $d->cantidad);
            $descuento = $request->input('descuento', 0);
            $propina = $request->input('propina', 0);
            $igv = ($subtotal - $descuento) * 0.18;
            $total = $subtotal - $descuento + $igv + $propina;

            // Generar comprobante si es boleta/factura
            $serie = null;
            $correlativo = null;
            if (in_array($request->input('tipo_comprobante'), ['boleta', 'factura'])) {
                $tipoDoc = $request->input('tipo_comprobante') === 'boleta' ? 'boleta' : 'factura';
                $serieDoc = SerieDocumento::where('tipo_documento', $tipoDoc)->where('activo', true)->first();
                if ($serieDoc) {
                    $correlativo = SerieDocumento::siguiente($serieDoc->serie);
                    $serie = $serieDoc->serie;
                }
            }

            // Actualizar pedido
            $pedido->update([
                'estado' => 'completada',
                'tipo_comprobante' => $request->input('tipo_comprobante'),
                'metodo_pago' => $request->input('metodo_pago'),
                'monto_recibido' => $request->input('monto_recibido'),
                'vuelto' => $request->input('monto_recibido') ? $request->input('monto_recibido') - $total : 0,
                'descuento' => $descuento,
                'propina' => $propina,
                'subtotal' => $subtotal,
                'igv' => $igv,
                'total' => $total,
                'total_gravado' => $subtotal - $descuento,
                'serie' => $serie,
                'correlativo' => $correlativo,
            ]);

            // Actualizar estado de mesa
            if ($pedido->mesa_id) {
                $pedido->mesa->update(['estado' => 'ocupada']);
            }

            // Descontar stock y registrar kardex
            foreach ($pedido->detalles as $detalle) {
                $producto = $detalle->producto;
                if ($producto->stock !== null) {
                    $stockAnterior = $producto->stock;
                    $stockNuevo = $stockAnterior - $detalle->cantidad;
                    $producto->update(['stock' => $stockNuevo]);

                    MovimientoInventario::create([
                        'producto_id' => $producto->id,
                        'usuario_id' => auth()->id(),
                        'tipo' => 'venta',
                        'cantidad' => -$detalle->cantidad,
                        'stock_anterior' => $stockAnterior,
                        'stock_nuevo' => $stockNuevo,
                        'nota' => 'Venta #' . $pedido->id,
                    ]);
                }
            }
        });

        return redirect()->route('pedidos.show', $pedido)
            ->with('success', 'Pedido completado exitosamente.');
    }

    /**
     * Cambiar estado del detalle (cocina).
     */
    public function updateDetalleStatus(Request $request, PedidoDetalle $detalle): RedirectResponse
    {
        $request->validate([
            'estado' => 'required|in:pendiente,en_cocina,servido',
        ]);

        $detalle->update(['estado' => $request->input('estado')]);

        return response()->json(['success' => true]);
    }
}
