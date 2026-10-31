<?php

namespace App\Http\Controllers;

use App\Http\Requests\ResumenDiarioFormRequest;
use App\Models\ResumenDiario;
use App\Models\Pedido;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\View\View;
use Illuminate\Support\Facades\DB;

class ResumenDiarioController extends Controller
{
    public function index(Request $request): View
    {
        $resumenes = ResumenDiario::with('usuario')
            ->orderBy('fecha_referencia', 'desc')
            ->get();
        return view('resumenes_diarios.index', compact('resumenes'));
    }

    public function create(): View
    {
        return view('resumenes_diarios.create');
    }

    public function store(ResumenDiarioFormRequest $request): RedirectResponse
    {
        $fechaReferencia = $request->input('fecha_referencia');

        DB::transaction(function () use ($fechaReferencia) {
            // Obtener boletas del día
            $boletas = Pedido::where('tipo_comprobante', 'boleta')
                ->where('estado', 'completada')
                ->whereDate('creado_en', $fechaReferencia)
                ->get();

            if ($boletas->isEmpty()) {
                throw new \Exception('No hay boletas para la fecha seleccionada.');
            }

            // Verificar si ya existe un resumen para esa fecha
            $existe = ResumenDiario::where('fecha_referencia', $fechaReferencia)->exists();
            if ($existe) {
                throw new \Exception('Ya existe un resumen diario para esta fecha.');
            }

            // Generar correlativo
            $ultimoCorrelativo = ResumenDiario::where('fecha_referencia', $fechaReferencia)
                ->max('correlativo') ?? 0;
            $correlativo = $ultimoCorrelativo + 1;

            $identificador = 'RC-' . date('Ymd', strtotime($fechaReferencia)) . '-' . $correlativo;

            return ResumenDiario::create([
                'fecha_referencia' => $fechaReferencia,
                'fecha_generacion' => now()->toDateString(),
                'correlativo' => $correlativo,
                'identificador' => $identificador,
                'total_documentos' => $boletas->count(),
                'monto_total' => $boletas->sum('total'),
                'estado_sunat' => 'PENDIENTE',
                'usuario_id' => auth()->id(),
            ]);
        });

        return redirect()->route('resumenes-diarios.index')
            ->with('success', 'Resumen diario creado exitosamente.');
    }

    public function show(ResumenDiario $resumenDiario): View
    {
        $resumenDiario->load('usuario');
        return view('resumenes_diarios.show', compact('resumenDiario'));
    }

    public function destroy(ResumenDiario $resumenDiario): RedirectResponse
    {
        if ($resumenDiario->estado_sunat !== 'PENDIENTE') {
            return redirect()->route('resumenes-diarios.index')
                ->with('error', 'No se puede eliminar un resumen enviado.');
        }

        $resumenDiario->delete();

        return redirect()->route('resumenes-diarios.index')
            ->with('success', 'Resumen diario eliminado exitosamente.');
    }
}
