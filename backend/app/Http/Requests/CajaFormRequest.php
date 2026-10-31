<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class CajaFormRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'monto_apertura' => 'required|numeric|min:0|max:999999.99',
            'notas' => 'nullable|string|max:500',
        ];
    }

    public function messages(): array
    {
        return [
            'monto_apertura.required' => 'El monto de apertura es obligatorio.',
            'monto_apertura.min' => 'El monto no puede ser negativo.',
        ];
    }
}
