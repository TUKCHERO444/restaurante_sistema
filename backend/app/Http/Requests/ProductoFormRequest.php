<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class ProductoFormRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $rules = [
            'categoria_id' => 'required|exists:categorias,id',
            'nombre' => 'required|string|max:255',
            'codigo' => 'nullable|string|max:255',
            'codigo_barras' => 'nullable|string|max:255|unique:productos,codigo_barras',
            'precio' => 'required|numeric|min:0|max:999999.99',
            'precio_promocional' => 'nullable|numeric|min:0|max:999999.99',
            'costo' => 'nullable|numeric|min:0|max:999999.99',
            'stock' => 'nullable|integer|min:0',
            'vendible' => 'boolean',
            'imagen' => 'nullable|image|mimes:jpeg,png,jpg,webp|max:2048',
            'activo' => 'boolean',
            'recomendado_chef' => 'boolean',
            'nuevo' => 'boolean',
        ];

        if ($this->isMethod('put') || $this->isMethod('patch')) {
            $rules['codigo_barras'] = 'nullable|string|max:255|unique:productos,codigo_barras,' . $this->route('producto');
        }

        return $rules;
    }

    public function messages(): array
    {
        return [
            'categoria_id.required' => 'La categoría es obligatoria.',
            'categoria_id.exists' => 'La categoría seleccionada no existe.',
            'nombre.required' => 'El nombre del producto es obligatorio.',
            'precio.required' => 'El precio es obligatorio.',
            'precio.min' => 'El precio no puede ser negativo.',
            'precio_promocional.min' => 'El precio promocional no puede ser negativo.',
            'costo.min' => 'El costo no puede ser negativo.',
            'stock.integer' => 'El stock debe ser un número entero.',
            'stock.min' => 'El stock no puede ser negativo.',
            'codigo_barras.unique' => 'Este código de barras ya está registrado.',
            'imagen.image' => 'El archivo debe ser una imagen.',
            'imagen.mimes' => 'La imagen debe ser JPEG, PNG, JPG o WEBP.',
            'imagen.max' => 'La imagen no puede exceder 2MB.',
        ];
    }
}
