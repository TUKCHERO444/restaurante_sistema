<?php

namespace App\Http\Controllers;

use App\Http\Requests\ConfiguracionFormRequest;
use App\Models\Configuracion;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\View\View;

class ConfiguracionController extends Controller
{
    public function index(Request $request): View
    {
        $configuraciones = Configuracion::orderBy('clave')->get();
        return view('configuraciones.index', compact('configuraciones'));
    }

    public function create(): View
    {
        return view('configuraciones.create');
    }

    public function store(ConfiguracionFormRequest $request): RedirectResponse
    {
        Configuracion::create($request->validated());

        return redirect()->route('configuraciones.index')
            ->with('success', 'Configuración creada exitosamente.');
    }

    public function edit(Configuracion $configuracion): View
    {
        return view('configuraciones.edit', compact('configuracion'));
    }

    public function update(ConfiguracionFormRequest $request, Configuracion $configuracion): RedirectResponse
    {
        $configuracion->update($request->validated());

        return redirect()->route('configuraciones.index')
            ->with('success', 'Configuración actualizada exitosamente.');
    }

    public function destroy(Configuracion $configuracion): RedirectResponse
    {
        $configuracion->delete();

        return redirect()->route('configuraciones.index')
            ->with('success', 'Configuración eliminada exitosamente.');
    }
}
