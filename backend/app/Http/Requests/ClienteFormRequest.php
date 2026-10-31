<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class ClienteFormRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $rules = [
            'nombre' => 'required|string|max:255',
            'tipo_documento' => 'required|in:DNI,RUC,CE,PASAPORTE',
            'numero_documento' => 'nullable|string|max:20|unique:clientes,numero_documento',
            'correo' => 'nullable|email|max:255',
            'telefono' => 'nullable|string|max:20',
            'direccion' => 'nullable|string|max:500',
        ];

        if ($this->isMethod('put') || $this->isMethod('patch')) {
            $rules['numero_documento'] = 'nullable|string|max:20|unique:clientes,numero_documento,' . $this->route('cliente');
        }

        return $rules;
    }

    public function messages(): array
    {
        return [
            'nombre.required' => 'El nombre del cliente es obligatorio.',
            'tipo_documento.required' => 'El tipo de documento es obligatorio.',
            'tipo_documento.in' => 'Tipo inválido. Use: DNI, RUC, CE o PASAPORTE.',
            'numero_documento.unique' => 'Este número de documento ya está registrado.',
            'correo.email' => 'Ingrese un correo válido.',
        ];
    }
}
