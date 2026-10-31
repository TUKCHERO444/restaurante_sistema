<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class GastoFormRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'concepto' => 'required|string|max:255',
            'monto' => 'required|numeric|min:0.01|max:999999.99',
        ];
    }

    public function messages(): array
    {
        return [
            'concepto.required' => 'El concepto del gasto es obligatorio.',
            'monto.required' => 'El monto es obligatorio.',
            'monto.min' => 'El monto debe ser mayor a 0.',
        ];
    }
}
