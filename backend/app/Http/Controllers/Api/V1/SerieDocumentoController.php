<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\SerieDocumento;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/** CRUD base de talonarios. La numeración atómica vive en `SerieDocumento::siguiente()`. */
class SerieDocumentoController extends Controller
{
    public function index(): JsonResponse
    {
        return response()->json(SerieDocumento::paginate(15));
    }

    public function store(Request $request): JsonResponse
    {
        $datos = $request->validate($this->reglas());

        return response()->json(SerieDocumento::create($datos), 201);
    }

    public function show(SerieDocumento $serie): JsonResponse
    {
        return response()->json($serie);
    }

    public function update(Request $request, SerieDocumento $serie): JsonResponse
    {
        $datos = $request->validate($this->reglas(true));
        $serie->update($datos);

        return response()->json($serie);
    }

    public function destroy(SerieDocumento $serie): JsonResponse
    {
        $serie->delete();

        return response()->json(null, 204);
    }

    protected function reglas(bool $parcial = false): array
    {
        $opcional = $parcial ? 'sometimes|' : '';

        return [
            'codigo_documento' => "{$opcional}required|string|size:2",
            'tipo_documento' => "{$opcional}required|string|max:30",
            'serie' => "{$opcional}required|string|size:4|unique:series_documentos,serie",
            'ultimo_numero' => "{$opcional}nullable|integer|min:0",
            'activo' => "{$opcional}nullable|boolean",
        ];
    }
}
