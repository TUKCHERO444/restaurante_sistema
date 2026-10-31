<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class AreaFormRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'nombre' => 'required|string|max:255',
        ];
    }

    public function messages(): array
    {
        return [
            'nombre.required' => 'El nombre del área es obligatorio.',
            'nombre.max' => 'El nombre no puede exceder 255 caracteres.',
        ];
    }
}
