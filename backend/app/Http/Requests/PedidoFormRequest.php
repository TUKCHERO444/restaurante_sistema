<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class PedidoFormRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'mesa_id' => 'nullable|exists:mesas,id',
            'cliente_id' => 'nullable|exists:clientes,id',
            'nombre_cliente' => 'required|string|max:255',
            'documento_cliente' => 'nullable|string|max:20',
            'tipo_comprobante' => 'required|in:ticket,boleta,factura',
            'metodo_pago' => 'required|in:efectivo,tarjeta',
            'monto_recibido' => 'nullable|numeric|min:0',
            'descuento' => 'nullable|numeric|min:0|max:999999.99',
            'propina' => 'nullable|numeric|min:0|max:999999.99',
            'notas' => 'nullable|string|max:500',
        ];
    }

    public function messages(): array
    {
        return [
            'nombre_cliente.required' => 'El nombre del cliente es obligatorio.',
            'tipo_comprobante.required' => 'El tipo de comprobante es obligatorio.',
            'tipo_comprobante.in' => 'Tipo inválido. Use: ticket, boleta o factura.',
            'metodo_pago.required' => 'El método de pago es obligatorio.',
            'metodo_pago.in' => 'Método inválido. Use: efectivo o tarjeta.',
        ];
    }
}
