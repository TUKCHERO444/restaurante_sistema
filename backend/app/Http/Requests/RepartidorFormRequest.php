<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class RepartidorFormRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'nombre' => 'required|string|max:255',
            'telefono' => 'nullable|string|max:20',
            'activo' => 'boolean',
        ];
    }

    public function messages(): array
    {
        return [
            'nombre.required' => 'El nombre del repartidor es obligatorio.',
        ];
    }
}
