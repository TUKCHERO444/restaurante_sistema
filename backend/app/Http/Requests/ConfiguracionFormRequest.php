<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class ConfiguracionFormRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $rules = [
            'clave' => 'required|string|max:255|unique:configuraciones,clave',
            'valor' => 'nullable|string',
        ];

        if ($this->isMethod('put') || $this->isMethod('patch')) {
            $rules['clave'] = 'required|string|max:255|unique:configuraciones,clave,' . $this->route('configuracion');
        }

        return $rules;
    }

    public function messages(): array
    {
        return [
            'clave.required' => 'La clave es obligatoria.',
            'clave.unique' => 'Esta configuración ya existe.',
            'clave.max' => 'La clave no puede exceder 255 caracteres.',
        ];
    }
}
