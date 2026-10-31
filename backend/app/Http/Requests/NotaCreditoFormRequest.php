<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class NotaCreditoFormRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'pedido_id' => 'required|exists:pedidos,id',
            'codigo_motivo' => 'required|string|size:2|in:01,02,03,06,07,13',
            'descripcion_motivo' => 'required|string|max:255',
        ];
    }

    public function messages(): array
    {
        return [
            'pedido_id.required' => 'El pedido es obligatorio.',
            'pedido_id.exists' => 'El pedido seleccionado no existe.',
            'codigo_motivo.required' => 'El código de motivo es obligatorio.',
            'codigo_motivo.size' => 'El código debe tener exactamente 2 caracteres.',
            'codigo_motivo.in' => 'Código inválido. Use: 01, 02, 03, 06, 07 o 13.',
            'descripcion_motivo.required' => 'La descripción del motivo es obligatoria.',
        ];
    }
}
