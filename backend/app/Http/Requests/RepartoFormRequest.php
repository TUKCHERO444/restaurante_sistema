<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class RepartoFormRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'cliente_id' => 'nullable|exists:clientes,id',
            'nombre_cliente' => 'required|string|max:255',
            'telefono_cliente' => 'required|string|max:20',
            'direccion' => 'required|string|max:500',
            'referencia' => 'nullable|string|max:255',
            'repartidor_id' => 'nullable|exists:repartidores,id',
            'metodo_pago' => 'required|in:efectivo,tarjeta,transferencia',
            'costo_envio' => 'nullable|numeric|min:0|max:9999.99',
            'notas' => 'nullable|string|max:500',
            'programado_para' => 'nullable|date|after:now',
        ];
    }

    public function messages(): array
    {
        return [
            'nombre_cliente.required' => 'El nombre del cliente es obligatorio.',
            'telefono_cliente.required' => 'El teléfono es obligatorio.',
            'direccion.required' => 'La dirección es obligatoria.',
            'metodo_pago.required' => 'El método de pago es obligatorio.',
            'metodo_pago.in' => 'Método inválido. Use: efectivo, tarjeta o transferencia.',
        ];
    }
}
