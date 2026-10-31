<?php

namespace App\Http\Controllers;

use App\Http\Requests\CajaFormRequest;
use App\Http\Requests\CajaCierreFormRequest;
use App\Models\Caja;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\View\View;

class CajaController extends Controller
{
    public function index(Request $request): View
    {
        $cajas = Caja::with('usuario')
            ->orderBy('apertura_en', 'desc')
            ->get();
        return view('cajas.index', compact('cajas'));
    }

    public function create(): View
    {
        return view('cajas.create');
    }

    public function store(CajaFormRequest $request): RedirectResponse
    {
        // Integridad: no permitir doble apertura del mismo usuario
        $cajaAbierta = Caja::where('usuario_id', auth()->id())
            ->where('estado', 'abierta')
            ->exists();

        if ($cajaAbierta) {
            return redirect()->route('cajas.index')
                ->with('error', 'Ya tiene una caja abierta.');
        }

        Caja::create([
            'usuario_id' => auth()->id(),
            'apertura_en' => now(),
            'monto_apertura' => $request->input('monto_apertura'),
            'estado' => 'abierta',
            'notas' => $request->input('notas'),
        ]);

        return redirect()->route('cajas.index')
            ->with('success', 'Caja abierta exitosamente.');
    }

    public function show(Caja $caja): View
    {
        $caja->load('usuario');
        return view('cajas.show', compact('caja'));
    }

    /**
     * Cierre de caja: calcula esperado y diferencia.
     */
    public function processClose(CajaCierreFormRequest $request, Caja $caja): RedirectResponse
    {
        if ($caja->estado === 'cerrada') {
            return redirect()->route('cajas.index')
                ->with('error', 'La caja ya está cerrada.');
        }

        // Calcular monto esperado: apertura + ventas efectivo - gastos
        $ventasEfectivo = $caja->pedidos()
            ->where('estado', 'completada')
            ->where('metodo_pago', 'efectivo')
            ->sum('total');

        $gastos = $caja->gastos()->sum('monto');

        $montoEsperado = $caja->monto_apertura + $ventasEfectivo - $gastos;
        $montoCierre = $request->input('monto_cierre');
        $diferencia = $montoCierre - $montoEsperado;

        $caja->update([
            'cierre_en' => now(),
            'monto_cierre' => $montoCierre,
            'monto_esperado' => $montoEsperado,
            'diferencia' => $diferencia,
            'estado' => 'cerrada',
            'notas' => $request->input('notas'),
        ]);

        return redirect()->route('cajas.index')
            ->with('success', 'Caja cerrada exitosamente. Diferencia: ' . number_format($diferencia, 2));
    }
}
