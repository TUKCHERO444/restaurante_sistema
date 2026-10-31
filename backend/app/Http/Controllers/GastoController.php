<?php

namespace App\Http\Controllers;

use App\Http\Requests\GastoFormRequest;
use App\Models\Gasto;
use App\Models\Caja;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\View\View;

class GastoController extends Controller
{
    public function index(Request $request): View
    {
        $gastos = Gasto::with(['usuario', 'caja'])
            ->orderBy('creado_en', 'desc')
            ->get();
        return view('gastos.index', compact('gastos'));
    }

    public function create(): View
    {
        return view('gastos.create');
    }

    public function store(GastoFormRequest $request): RedirectResponse
    {
        // Integridad: gasto atado a caja activa del usuario
        $cajaAbierta = Caja::where('usuario_id', auth()->id())
            ->where('estado', 'abierta')
            ->first();

        if (!$cajaAbierta) {
            return redirect()->route('gastos.index')
                ->with('error', 'Debe tener una caja abierta para registrar gastos.');
        }

        Gasto::create([
            'concepto' => $request->input('concepto'),
            'monto' => $request->input('monto'),
            'usuario_id' => auth()->id(),
            'caja_id' => $cajaAbierta->id,
        ]);

        return redirect()->route('gastos.index')
            ->with('success', 'Gasto registrado exitosamente.');
    }

    public function destroy(Gasto $gasto): RedirectResponse
    {
        $gasto->delete();

        return redirect()->route('gastos.index')
            ->with('success', 'Gasto eliminado exitosamente.');
    }
}
