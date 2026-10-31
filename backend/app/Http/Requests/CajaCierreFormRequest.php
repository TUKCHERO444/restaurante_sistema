<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class CajaCierreFormRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'monto_cierre' => 'required|numeric|min:0|max:999999.99',
            'notas' => 'nullable|string|max:500',
        ];
    }

    public function messages(): array
    {
        return [
            'monto_cierre.required' => 'El monto de cierre es obligatorio.',
            'monto_cierre.min' => 'El monto no puede ser negativo.',
        ];
    }
}
