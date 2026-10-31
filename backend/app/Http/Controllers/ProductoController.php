<?php

namespace App\Http\Controllers;

use App\Http\Requests\ProductoFormRequest;
use App\Models\Producto;
use App\Models\Categoria;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\View\View;
use Illuminate\Support\Facades\Storage;

class ProductoController extends Controller
{
    public function index(Request $request): View
    {
        $productos = Producto::with('categoria')
            ->orderBy('nombre')
            ->get();
        return view('productos.index', compact('productos'));
    }

    public function create(): View
    {
        $categorias = Categoria::where('activo', true)->orderBy('nombre')->get();
        return view('productos.create', compact('categorias'));
    }

    public function store(ProductoFormRequest $request): RedirectResponse
    {
        $data = $request->validated();
        $data['vendible'] = $request->boolean('vendible', true);
        $data['activo'] = $request->boolean('activo', true);
        $data['recomendado_chef'] = $request->boolean('recomendado_chef', false);
        $data['nuevo'] = $request->boolean('nuevo', false);

        if ($request->hasFile('imagen')) {
            $data['imagen'] = $request->file('imagen')->store('productos', 'public');
        }

        Producto::create($data);

        return redirect()->route('productos.index')
            ->with('success', 'Producto creado exitosamente.');
    }

    public function edit(Producto $producto): View
    {
        $categorias = Categoria::where('activo', true)->orderBy('nombre')->get();
        return view('productos.edit', compact('producto', 'categorias'));
    }

    public function update(ProductoFormRequest $request, Producto $producto): RedirectResponse
    {
        $data = $request->validated();
        $data['vendible'] = $request->boolean('vendible', false);
        $data['activo'] = $request->boolean('activo', false);
        $data['recomendado_chef'] = $request->boolean('recomendado_chef', false);
        $data['nuevo'] = $request->boolean('nuevo', false);

        if ($request->hasFile('imagen')) {
            if ($producto->imagen) {
                Storage::disk('public')->delete($producto->imagen);
            }
            $data['imagen'] = $request->file('imagen')->store('productos', 'public');
        }

        $producto->update($data);

        return redirect()->route('productos.index')
            ->with('success', 'Producto actualizado exitosamente.');
    }

    public function destroy(Producto $producto): RedirectResponse
    {
        // Integridad: no eliminar si tiene pedidos o movimientos de inventario
        if ($producto->detalles()->count() > 0) {
            return redirect()->route('productos.index')
                ->with('error', 'No se puede eliminar: el producto tiene pedidos asociados.');
        }

        if ($producto->movimientos()->count() > 0) {
            return redirect()->route('productos.index')
                ->with('error', 'No se puede eliminar: el producto tiene movimientos de inventario.');
        }

        if ($producto->imagen) {
            Storage::disk('public')->delete($producto->imagen);
        }

        $producto->delete();

        return redirect()->route('productos.index')
            ->with('success', 'Producto eliminado exitosamente.');
    }

    /**
     * Toggle de visibilidad (activo/inactivo).
     */
    public function toggle(Producto $producto): RedirectResponse
    {
        $producto->update(['activo' => !$producto->activo]);

        return redirect()->route('productos.index')
            ->with('success', 'Estado del producto actualizado.');
    }

    /**
     * Ajuste de stock (entrada/salida) con registro en kardex.
     */
    public function adjust(Request $request, Producto $producto): RedirectResponse
    {
        $request->validate([
            'tipo' => 'required|in:entrada,salida',
            'cantidad' => 'required|integer|min:1',
            'nota' => 'nullable|string|max:255',
        ]);

        $cantidad = $request->input('cantidad');
        $tipo = $request->input('tipo');

        if ($tipo === 'salida') {
            $cantidad = -$cantidad;
        }

        $stockAnterior = $producto->stock ?? 0;
        $stockNuevo = $stockAnterior + $cantidad;

        if ($stockNuevo < 0) {
            return redirect()->route('productos.index')
                ->with('error', 'Stock insuficiente para la salida.');
        }

        $producto->update(['stock' => $stockNuevo]);

        // Registrar en kardex
        $producto->movimientos()->create([
            'usuario_id' => auth()->id(),
            'tipo' => $tipo === 'entrada' ? 'compra' : 'venta',
            'cantidad' => $cantidad,
            'stock_anterior' => $stockAnterior,
            'stock_nuevo' => $stockNuevo,
            'nota' => $request->input('nota'),
        ]);

        return redirect()->route('productos.index')
            ->with('success', 'Stock ajustado exitosamente.');
    }

    /**
     * Sincronizar ingredientes de la receta.
     */
    public function syncIngredientes(Request $request, Producto $producto): RedirectResponse
    {
        $request->validate([
            'ingredientes' => 'nullable|array',
            'ingredientes.*.id' => 'exists:productos,id',
            'ingredientes.*.cantidad' => 'numeric|min:0.01',
        ]);

        $sync = [];
        foreach ($request->input('ingredientes', []) as $ing) {
            $sync[$ing['id']] = ['cantidad' => $ing['cantidad']];
        }

        $producto->ingredientes()->sync($sync);

        return redirect()->route('productos.edit', $producto)
            ->with('success', 'Receta actualizada exitosamente.');
    }
}
