<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Schema;
use Tests\TestCase;

class EsquemaBaseTest extends TestCase
{
    use RefreshDatabase;

    public function test_todas_las_tablas_del_dominio_existen(): void
    {
        $tablas = [
            'usuarios',
            'areas',
            'mesas',
            'categorias',
            'productos',
            'producto_ingredientes',
            'reservas',
            'clientes',
            'pedidos',
            'pedido_detalles',
            'cajas',
            'gastos',
            'movimientos_inventario',
            'repartidores',
            'repartos',
            'configuraciones',
            'series_documentos',
            'notas_credito',
            'resumenes_diarios',
            'ia_consultas',
        ];

        foreach ($tablas as $tabla) {
            $this->assertTrue(
                Schema::hasTable($tabla),
                "Falta la tabla [{$tabla}]."
            );
        }
    }
}
