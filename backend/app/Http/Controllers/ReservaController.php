<?php

namespace App\Http\Controllers;

use App\Http\Requests\ReservaFormRequest;
use App\Models\Reserva;
use App\Models\Mesa;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\View\View;

class ReservaController extends Controller
{
    public function index(Request $request): View
    {
        $reservas = Reserva::with('mesa')
            ->where('fecha_reserva', '>=', now()->startOfDay())
            ->orderBy('fecha_reserva')
            ->get();
        $mesas = Mesa::orderBy('nombre')->get();
        return view('reservas.index', compact('reservas', 'mesas'));
    }

    public function create(): View
    {
        $mesas = Mesa::where('estado', 'libre')->orderBy('nombre')->get();
        return view('reservas.create', compact('mesas'));
    }

    public function store(ReservaFormRequest $request): RedirectResponse
    {
        $data = $request->validated();
        $data['estado'] = 'pendiente';

        Reserva::create($data);

        return redirect()->route('reservas.index')
            ->with('success', 'Reserva creada exitosamente.');
    }

    public function edit(Reserva $reserva): View
    {
        $mesas = Mesa::orderBy('nombre')->get();
        return view('reservas.edit', compact('reserva', 'mesas'));
    }

    public function update(ReservaFormRequest $request, Reserva $reserva): RedirectResponse
    {
        $reserva->update($request->validated());

        return redirect()->route('reservas.index')
            ->with('success', 'Reserva actualizada exitosamente.');
    }

    public function destroy(Reserva $reserva): RedirectResponse
    {
        $reserva->delete();

        return redirect()->route('reservas.index')
            ->with('success', 'Reserva eliminada exitosamente.');
    }

    /**
     * Confirmar reserva.
     */
    public function confirm(Reserva $reserva): RedirectResponse
    {
        $reserva->update(['estado' => 'confirmada']);

        // Si tiene mesa asignada, actualizar estado de la mesa
        if ($reserva->mesa_id) {
            $reserva->mesa->update(['estado' => 'reservada']);
        }

        return redirect()->route('reservas.index')
            ->with('success', 'Reserva confirmada.');
    }

    /**
     * Cancelar reserva.
     */
    public function cancel(Reserva $reserva): RedirectResponse
    {
        $reserva->update(['estado' => 'cancelada']);

        // Liberar mesa si estaba asignada
        if ($reserva->mesa_id && $reserva->mesa->estado === 'reservada') {
            $reserva->mesa->update(['estado' => 'libre']);
        }

        return redirect()->route('reservas.index')
            ->with('success', 'Reserva cancelada.');
    }
}
