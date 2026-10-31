<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class SerieDocumentoFormRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $rules = [
            'codigo_documento' => 'required|string|size:2|in:01,03,07,08',
            'tipo_documento' => 'required|string|max:30|in:factura,boleta,nota_credito_boleta,nota_credito_factura',
            'serie' => 'required|string|size:4|unique:series_documentos,serie',
            'ultimo_numero' => 'integer|min:0',
            'activo' => 'boolean',
        ];

        if ($this->isMethod('put') || $this->isMethod('patch')) {
            $rules['serie'] = 'required|string|size:4|unique:series_documentos,serie,' . $this->route('serie_documento');
        }

        return $rules;
    }

    public function messages(): array
    {
        return [
            'codigo_documento.required' => 'El código de documento es obligatorio.',
            'codigo_documento.size' => 'El código debe tener exactamente 2 caracteres.',
            'codigo_documento.in' => 'Código inválido. Use: 01, 03, 07 u 08.',
            'tipo_documento.required' => 'El tipo de documento es obligatorio.',
            'tipo_documento.in' => 'Tipo inválido. Use: factura, boleta, nota_credito_boleta o nota_credito_factura.',
            'serie.required' => 'La serie es obligatoria.',
            'serie.size' => 'La serie debe tener exactamente 4 caracteres.',
            'serie.unique' => 'Esta serie ya existe.',
            'ultimo_numero.integer' => 'El último número debe ser un entero.',
            'ultimo_numero.min' => 'El último número no puede ser negativo.',
        ];
    }
}
