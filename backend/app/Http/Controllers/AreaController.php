<?php

namespace App\Http\Controllers;

use App\Http\Requests\AreaFormRequest;
use App\Models\Area;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\View\View;

class AreaController extends Controller
{
    public function index(Request $request): View
    {
        $areas = Area::withCount('mesas')->orderBy('nombre')->get();
        return view('areas.index', compact('areas'));
    }

    public function create(): View
    {
        return view('areas.create');
    }

    public function store(AreaFormRequest $request): RedirectResponse
    {
        Area::create($request->validated());

        return redirect()->route('areas.index')
            ->with('success', 'Área creada exitosamente.');
    }

    public function edit(Area $area): View
    {
        return view('areas.edit', compact('area'));
    }

    public function update(AreaFormRequest $request, Area $area): RedirectResponse
    {
        $area->update($request->validated());

        return redirect()->route('areas.index')
            ->with('success', 'Área actualizada exitosamente.');
    }

    public function destroy(Area $area): RedirectResponse
    {
        // Integridad: no eliminar si tiene mesas asociadas
        if ($area->mesas()->count() > 0) {
            return redirect()->route('areas.index')
                ->with('error', 'No se puede eliminar: el área tiene mesas asociadas.');
        }

        $area->delete();

        return redirect()->route('areas.index')
            ->with('success', 'Área eliminada exitosamente.');
    }
}
