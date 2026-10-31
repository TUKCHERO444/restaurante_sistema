<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Usuario;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

/**
 * Autenticación de la API mediante Sanctum SPA (cookies).
 *
 * POST /api/v1/login  → { usuario, token }
 * POST /api/v1/logout → 204
 * GET  /api/v1/user   → usuario autenticado
 */
class AuthController extends Controller
{
    /**
     * Inicia sesión y devuelve el token de Sanctum.
     */
    public function login(Request $request): JsonResponse
    {
        $credentials = $request->validate([
            'correo' => ['required', 'email'],
            'contrasena' => ['required', 'string'],
        ]);

        $usuario = Usuario::where('correo', $credentials['correo'])->first();

        if (! $usuario || ! Hash::check($credentials['contrasena'], $usuario->contrasena)) {
            throw ValidationException::withMessages([
                'correo' => ['Las credenciales no coinciden con nuestros registros.'],
            ]);
        }

        // Revocar tokens previos (sesión única por usuario).
        $usuario->tokens()->delete();

        $token = $usuario->createToken('auth-token')->plainTextToken;

        return response()->json([
            'usuario' => $usuario,
            'token' => $token,
        ]);
    }

    /**
     * Cierra la sesión revocando el token actual.
     */
    public function logout(Request $request): JsonResponse
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json(null, 204);
    }

    /**
     * Devuelve el usuario autenticado.
     */
    public function user(Request $request): JsonResponse
    {
        return response()->json($request->user());
    }
}
