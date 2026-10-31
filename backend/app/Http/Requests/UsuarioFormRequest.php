<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UsuarioFormRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $rules = [
            'nombre' => 'required|string|max:255',
            'correo' => 'required|email|max:255|unique:usuarios,correo',
            'contrasena' => 'required|string|min:8|confirmed',
            'rol' => ['required', Rule::in(['administrador', 'cajero', 'mozo', 'cocina'])],
        ];

        if ($this->isMethod('put') || $this->isMethod('patch')) {
            $rules['correo'] = 'required|email|max:255|unique:usuarios,correo,' . $this->route('usuario');
            $rules['contrasena'] = 'nullable|string|min:8|confirmed';
        }

        return $rules;
    }

    public function messages(): array
    {
        return [
            'nombre.required' => 'El nombre es obligatorio.',
            'correo.required' => 'El correo es obligatorio.',
            'correo.email' => 'Ingrese un correo válido.',
            'correo.unique' => 'Este correo ya está registrado.',
            'contrasena.required' => 'La contraseña es obligatoria.',
            'contrasena.min' => 'La contraseña debe tener al menos 8 caracteres.',
            'contrasena.confirmed' => 'Las contraseñas no coinciden.',
            'rol.required' => 'El rol es obligatorio.',
            'rol.in' => 'Rol inválido. Use: administrador, cajero, mozo o cocina.',
        ];
    }
}
