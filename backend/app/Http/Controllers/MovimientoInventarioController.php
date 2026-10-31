<?php

namespace App\Http\Controllers;

use App\Http\Requests\MovimientoInventarioFormRequest;
use App\Models\MovimientoInventario;
use App\Models\Producto;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\View\View;

class MovimientoInventarioController extends Controller
{
    public function index(Request $request): View
    {
        $movimientos = MovimientoInventario::with(['producto', 'usuario'])
            ->orderBy('creado_en', 'desc')
            ->get();
        return view('movimientos_inventario.index', compact('movimientos'));
    }

    public function create(): View
    {
        $productos = Producto::where('activo', true)->orderBy('nombre')->get();
        return view('movimientos_inventario.create', compact('productos'));
    }

    public function store(MovimientoInventarioFormRequest $request): RedirectResponse
    {
        $producto = Producto::findOrFail($request->input('producto_id'));
        $cantidad = $request->input('cantidad');
        $tipo = $request->input('tipo');

        $stockAnterior = $producto->stock ?? 0;
        $stockNuevo = $stockAnterior + $cantidad;

        if ($stockNuevo < 0) {
            return redirect()->route('movimientos-inventario.index')
                ->with('error', 'Stock insuficiente.');
        }

        $producto->update(['stock' => $stockNuevo]);

        MovimientoInventario::create([
            'producto_id' => $producto->id,
            'usuario_id' => auth()->id(),
            'tipo' => $tipo,
            'cantidad' => $cantidad,
            'stock_anterior' => $stockAnterior,
            'stock_nuevo' => $stockNuevo,
            'nota' => $request->input('nota'),
        ]);

        return redirect()->route('movimientos-inventario.index')
            ->with('success', 'Movimiento registrado exitosamente.');
    }

    public function show(MovimientoInventario $movimiento): View
    {
        $movimiento->load(['producto', 'usuario']);
        return view('movimientos_inventario.show', compact('movimiento'));
    }
}
