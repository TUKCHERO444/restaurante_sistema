<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class ResumenDiarioFormRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'fecha_referencia' => 'required|date|before_or_equal:today',
        ];
    }

    public function messages(): array
    {
        return [
            'fecha_referencia.required' => 'La fecha de referencia es obligatoria.',
            'fecha_referencia.before_or_equal' => 'La fecha no puede ser futura.',
        ];
    }
}
