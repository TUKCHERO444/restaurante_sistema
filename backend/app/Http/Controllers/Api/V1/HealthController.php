<?php

namespace App\Http\Controllers\Api\V1;

use Illuminate\Http\JsonResponse;

/**
 * Endpoint de comprobación de salud de la API.
 *
 * GET /api/v1/health → 200 { status, service, timestamp }
 *
 * No requiere autenticación. Sirve para verificar que Laravel
 * responde y que el frontend puede alcanzar el backend.
 */
class HealthController
{
    public function __invoke(): JsonResponse
    {
        return response()->json([
            'status' => 'ok',
            'service' => config('app.name'),
            'timestamp' => now()->toIso8601String(),
        ]);
    }
}
