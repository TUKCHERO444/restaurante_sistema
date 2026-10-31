<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class ReservaFormRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'nombre_cliente' => 'required|string|max:255',
            'telefono' => 'nullable|string|max:20',
            'fecha_reserva' => 'required|date|after:now',
            'personas' => 'required|integer|min:1|max=50',
            'mesa_id' => 'nullable|exists:mesas,id',
            'nota' => 'nullable|string|max:500',
        ];
    }

    public function messages(): array
    {
        return [
            'nombre_cliente.required' => 'El nombre del cliente es obligatorio.',
            'fecha_reserva.required' => 'La fecha de reserva es obligatoria.',
            'fecha_reserva.after' => 'La fecha debe ser futura.',
            'personas.required' => 'El número de personas es obligatorio.',
            'personas.min' => 'Debe ser al menos 1 persona.',
            'mesa_id.exists' => 'La mesa seleccionada no existe.',
        ];
    }
}
