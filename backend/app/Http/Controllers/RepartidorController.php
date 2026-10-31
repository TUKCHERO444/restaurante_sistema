<?php

namespace App\Http\Controllers;

use App\Http\Requests\RepartidorFormRequest;
use App\Models\Repartidor;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\View\View;

class RepartidorController extends Controller
{
    public function index(Request $request): View
    {
        $repartidores = Repartidor::orderBy('nombre')->get();
        return view('repartidores.index', compact('repartidores'));
    }

    public function create(): View
    {
        return view('repartidores.create');
    }

    public function store(RepartidorFormRequest $request): RedirectResponse
    {
        $data = $request->validated();
        $data['activo'] = $request->boolean('activo', true);

        Repartidor::create($data);

        return redirect()->route('repartidores.index')
            ->with('success', 'Repartidor creado exitosamente.');
    }

    public function edit(Repartidor $repartidor): View
    {
        return view('repartidores.edit', compact('repartidor'));
    }

    public function update(RepartidorFormRequest $request, Repartidor $repartidor): RedirectResponse
    {
        $data = $request->validated();
        $data['activo'] = $request->boolean('activo', false);

        $repartidor->update($data);

        return redirect()->route('repartidores.index')
            ->with('success', 'Repartidor actualizado exitosamente.');
    }

    public function destroy(Repartidor $repartidor): RedirectResponse
    {
        // Integridad: no eliminar si tiene repartos asociados
        if ($repartidor->repartos()->count() > 0) {
            return redirect()->route('repartidores.index')
                ->with('error', 'No se puede eliminar: el repartidor tiene repartos asociados.');
        }

        $repartidor->delete();

        return redirect()->route('repartidores.index')
            ->with('success', 'Repartidor eliminado exitosamente.');
    }
}
