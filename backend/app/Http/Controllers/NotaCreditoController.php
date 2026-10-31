<?php

namespace App\Http\Controllers;

use App\Http\Requests\NotaCreditoFormRequest;
use App\Models\NotaCredito;
use App\Models\Pedido;
use App\Models\SerieDocumento;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\View\View;
use Illuminate\Support\Facades\DB;

class NotaCreditoController extends Controller
{
    public function index(Request $request): View
    {
        $notasCredito = NotaCredito::with(['pedido', 'usuario'])
            ->orderBy('creado_en', 'desc')
            ->get();
        return view('notas_credito.index', compact('notasCredito'));
    }

    public function create(): View
    {
        // Solo pedidos con estado_sunat = ACEPTADO
        $pedidos = Pedido::where('estado_sunat', 'ACEPTADO')
            ->where('estado', 'completada')
            ->orderBy('creado_en', 'desc')
            ->get();
        return view('notas_credito.create', compact('pedidos'));
    }

    public function store(NotaCreditoFormRequest $request): RedirectResponse
    {
        $pedido = Pedido::findOrFail($request->input('pedido_id'));

        // Verificar que el pedido tenga comprobante electrónico
        if (!$pedido->serie || !$pedido->correlativo) {
            return redirect()->route('notas-credito.index')
                ->with('error', 'El pedido no tiene comprobante electrónico.');
        }

        DB::transaction(function () use ($request, $pedido) {
            // Determinar serie según tipo de comprobante original
            $tipoNota = $pedido->tipo_comprobante === 'factura' ? 'nota_credito_factura' : 'nota_credito_boleta';
            $serieDoc = SerieDocumento::where('tipo_documento', $tipoNota)->where('activo', true)->first();

            if (!$serieDoc) {
                throw new \Exception('No hay serie activa para notas de crédito.');
            }

            $correlativo = SerieDocumento::siguiente($serieDoc->serie);

            return NotaCredito::create([
                'pedido_id' => $pedido->id,
                'serie' => $serieDoc->serie,
                'correlativo' => $correlativo,
                'tipo_documento' => 'nota_credito',
                'codigo_motivo' => $request->input('codigo_motivo'),
                'descripcion_motivo' => $request->input('descripcion_motivo'),
                'subtotal' => $pedido->subtotal,
                'igv' => $pedido->igv,
                'total' => $pedido->total,
                'usuario_id' => auth()->id(),
            ]);
        });

        return redirect()->route('notas-credito.index')
            ->with('success', 'Nota de crédito creada exitosamente.');
    }

    public function show(NotaCredito $notaCredito): View
    {
        $notaCredito->load(['pedido', 'usuario']);
        return view('notas_credito.show', compact('notaCredito'));
    }

    public function destroy(NotaCredito $notaCredito): RedirectResponse
    {
        if ($notaCredito->estado_sunat !== 'PENDIENTE') {
            return redirect()->route('notas-credito.index')
                ->with('error', 'No se puede eliminar una nota de crédito enviada.');
        }

        $notaCredito->delete();

        return redirect()->route('notas-credito.index')
            ->with('success', 'Nota de crédito eliminada exitosamente.');
    }
}
