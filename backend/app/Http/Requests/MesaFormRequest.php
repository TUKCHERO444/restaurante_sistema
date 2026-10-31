<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class MesaFormRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'area_id' => 'required|exists:areas,id',
            'nombre' => 'required|string|max:255',
            'asientos' => 'required|integer|min:1|max:50',
            'estado' => 'required|in:libre,ocupada,reservada',
            'pos_x' => 'integer|min:0',
            'pos_y' => 'integer|min:0',
        ];
    }

    public function messages(): array
    {
        return [
            'area_id.required' => 'El área es obligatoria.',
            'area_id.exists' => 'El área seleccionada no existe.',
            'nombre.required' => 'El nombre de la mesa es obligatorio.',
            'asientos.required' => 'El número de asientos es obligatorio.',
            'asientos.min' => 'Debe tener al menos 1 asiento.',
            'asientos.max' => 'No puede tener más de 50 asientos.',
            'estado.required' => 'El estado es obligatorio.',
            'estado.in' => 'Estado inválido. Use: libre, ocupada o reservada.',
        ];
    }
}
