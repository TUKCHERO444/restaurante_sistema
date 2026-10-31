<?php

namespace App\Http\Controllers;

use App\Http\Requests\SerieDocumentoFormRequest;
use App\Models\SerieDocumento;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\View\View;

class SerieDocumentoController extends Controller
{
    public function index(Request $request): View
    {
        $series = SerieDocumento::orderBy('codigo_documento')->get();
        return view('series_documentos.index', compact('series'));
    }

    public function create(): View
    {
        return view('series_documentos.create');
    }

    public function store(SerieDocumentoFormRequest $request): RedirectResponse
    {
        $data = $request->validated();
        $data['activo'] = $request->boolean('activo', true);
        $data['ultimo_numero'] = $data['ultimo_numero'] ?? 0;

        SerieDocumento::create($data);

        return redirect()->route('series-documentos.index')
            ->with('success', 'Serie de documento creada exitosamente.');
    }

    public function edit(SerieDocumento $serieDocumento): View
    {
        return view('series_documentos.edit', compact('serieDocumento'));
    }

    public function update(SerieDocumentoFormRequest $request, SerieDocumento $serieDocumento): RedirectResponse
    {
        $data = $request->validated();
        $data['activo'] = $request->boolean('activo', false);

        $serieDocumento->update($data);

        return redirect()->route('series-documentos.index')
            ->with('success', 'Serie de documento actualizada exitosamente.');
    }

    public function destroy(SerieDocumento $serieDocumento): RedirectResponse
    {
        $serieDocumento->delete();

        return redirect()->route('series-documentos.index')
            ->with('success', 'Serie de documento eliminada exitosamente.');
    }
}
