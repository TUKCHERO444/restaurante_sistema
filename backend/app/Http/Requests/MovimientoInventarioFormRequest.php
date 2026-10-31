<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class MovimientoInventarioFormRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'producto_id' => 'required|exists:productos,id',
            'tipo' => 'required|in:compra,ajuste',
            'cantidad' => 'required|integer|min:1',
            'nota' => 'nullable|string|max:255',
        ];
    }

    public function messages(): array
    {
        return [
            'producto_id.required' => 'El producto es obligatorio.',
            'producto_id.exists' => 'El producto seleccionado no existe.',
            'tipo.required' => 'El tipo de movimiento es obligatorio.',
            'tipo.in' => 'Tipo inválido. Use: compra o ajuste.',
            'cantidad.required' => 'La cantidad es obligatoria.',
            'cantidad.min' => 'La cantidad debe ser al menos 1.',
        ];
    }
}
