<?php

namespace App\Http\Controllers;

use App\Http\Requests\MesaFormRequest;
use App\Models\Mesa;
use App\Models\Area;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\View\View;

class MesaController extends Controller
{
    public function index(Request $request): View
    {
        $areas = Area::with('mesas')->orderBy('nombre')->get();
        return view('mesas.index', compact('areas'));
    }

    public function create(): View
    {
        $areas = Area::orderBy('nombre')->get();
        return view('mesas.create', compact('areas'));
    }

    public function store(MesaFormRequest $request): RedirectResponse
    {
        Mesa::create($request->validated());

        return redirect()->route('mesas.index')
            ->with('success', 'Mesa creada exitosamente.');
    }

    public function edit(Mesa $mesa): View
    {
        $areas = Area::orderBy('nombre')->get();
        return view('mesas.edit', compact('mesa', 'areas'));
    }

    public function update(MesaFormRequest $request, Mesa $mesa): RedirectResponse
    {
        $mesa->update($request->validated());

        return redirect()->route('mesas.index')
            ->with('success', 'Mesa actualizada exitosamente.');
    }

    public function destroy(Mesa $mesa): RedirectResponse
    {
        // Integridad: no eliminar si tiene pedidos o reservas
        if ($mesa->pedidos()->count() > 0) {
            return redirect()->route('mesas.index')
                ->with('error', 'No se puede eliminar: la mesa tiene pedidos asociados.');
        }

        if ($mesa->reservas()->count() > 0) {
            return redirect()->route('mesas.index')
                ->with('error', 'No se puede eliminar: la mesa tiene reservas asociadas.');
        }

        $mesa->delete();

        return redirect()->route('mesas.index')
            ->with('success', 'Mesa eliminada exitosamente.');
    }

    /**
     * Actualización de posiciones mediante drag&drop (JSON).
     */
    public function updatePositions(Request $request): RedirectResponse
    {
        $request->validate([
            'posiciones' => 'required|array',
            'posiciones.*.id' => 'required|exists:mesas,id',
            'posiciones.*.x' => 'required|integer|min:0',
            'posiciones.*.y' => 'required|integer|min:0',
        ]);

        foreach ($request->input('posiciones') as $pos) {
            Mesa::where('id', $pos['id'])->update([
                'pos_x' => $pos['x'],
                'pos_y' => $pos['y'],
            ]);
        }

        return response()->json(['success' => true]);
    }
}
