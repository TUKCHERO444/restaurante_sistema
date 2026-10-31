<?php

namespace App\Http\Controllers;

use App\Http\Requests\UsuarioFormRequest;
use App\Models\Usuario;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\View\View;

class UsuarioController extends Controller
{
    public function index(Request $request): View
    {
        $usuarios = Usuario::orderBy('nombre')->get();
        return view('usuarios.index', compact('usuarios'));
    }

    public function create(): View
    {
        return view('usuarios.create');
    }

    public function store(UsuarioFormRequest $request): RedirectResponse
    {
        Usuario::create($request->validated());

        return redirect()->route('usuarios.index')
            ->with('success', 'Usuario creado exitosamente.');
    }

    public function edit(Usuario $usuario): View
    {
        return view('usuarios.edit', compact('usuario'));
    }

    public function update(UsuarioFormRequest $request, Usuario $usuario): RedirectResponse
    {
        $data = $request->validated();

        // Si no se envía contraseña, no actualizarla
        if (empty($data['contrasena'])) {
            unset($data['contrasena']);
        }

        $usuario->update($data);

        return redirect()->route('usuarios.index')
            ->with('success', 'Usuario actualizado exitosamente.');
    }

    public function destroy(Usuario $usuario): RedirectResponse
    {
        // Integridad: no eliminar si tiene pedidos, cajas, gastos, etc.
        if ($usuario->pedidos()->count() > 0) {
            return redirect()->route('usuarios.index')
                ->with('error', 'No se puede eliminar: el usuario tiene pedidos asociados.');
        }

        if ($usuario->cajas()->count() > 0) {
            return redirect()->route('usuarios.index')
                ->with('error', 'No se puede eliminar: el usuario tiene cajas asociadas.');
        }

        if ($usuario->gastos()->count() > 0) {
            return redirect()->route('usuarios.index')
                ->with('error', 'No se puede eliminar: el usuario tiene gastos asociados.');
        }

        $usuario->delete();

        return redirect()->route('usuarios.index')
            ->with('success', 'Usuario eliminado exitosamente.');
    }
}
