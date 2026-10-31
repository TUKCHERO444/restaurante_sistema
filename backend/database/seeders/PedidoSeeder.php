<?php

namespace Database\Seeders;

use App\Models\Caja;
use App\Models\Cliente;
use App\Models\Mesa;
use App\Models\Pedido;
use App\Models\PedidoDetalle;
use App\Models\Producto;
use App\Models\SerieDocumento;
use App\Models\Usuario;
use Illuminate\Database\Seeder;

/**
 * 200 pedidos: 100 de salón + 100 delivery (estos últimos los completa
 * RepartoSeeder con su reparto 1:1).
 *
 * Integridad: totales calculados desde las líneas, numeración atómica
 * por serie y ~100 comprobantes electrónicos en ACEPTADO para las
 * notas de crédito.
 */
class PedidoSeeder extends Seeder
{
    public function run(): void
    {
        $usuario = Usuario::firstOrFail()->id;
        $mesas = Mesa::pluck('id')->all();
        $clientes = Cliente::all();
        $cajas = Caja::where('estado', 'cerrada')->pluck('id')->all();
        $productos = Producto::where('vendible', true)->where('activo', true)->get();

        for ($i = 0; $i < 100; $i++) {
            $this->crearPedido($usuario, $mesas, $clientes, $cajas, $productos, false);
        }

        for ($i = 0; $i < 100; $i++) {
            $this->crearPedido($usuario, $mesas, $clientes, $cajas, $productos, true);
        }
    }

    private function crearPedido(
        int $usuario,
        array $mesas,
        $clientes,
        array $cajas,
        $productos,
        bool $delivery
    ): Pedido {
        $estado = fake()->randomElement(
            $delivery
                ? ['completada', 'completada', 'completada', 'completada', 'pendiente', 'anulada']
                : ['completada', 'completada', 'completada', 'pendiente', 'anulada']
        );

        $cliente = fake()->boolean(60) ? $clientes->random() : null;
        $electronico = $estado === 'completada' && ($delivery || fake()->boolean(80));
        $tipo = ! $electronico ? 'ticket' : fake()->randomElement(['boleta', 'boleta', 'factura']);

        // Factura exige RUC: se usa un cliente con RUC o se genera razón social
        if ($tipo === 'factura' && (! $cliente || strlen((string) $cliente->numero_documento) !== 11)) {
            $cliente = $clientes->where('tipo_documento', 'RUC')->first()
                ?? Cliente::create([
                    'nombre' => fake()->company(),
                    'tipo_documento' => 'RUC',
                    'numero_documento' => '20' . fake()->unique()->numerify('#########'),
                ]);
        }

        $pedido = Pedido::create([
            'mesa_id' => $delivery ? null : $mesas[array_rand($mesas)],
            'usuario_id' => $usuario,
            'cliente_id' => $cliente?->id,
            'caja_id' => $cajas[array_rand($cajas)],
            'estado' => $estado,
            'tipo_comprobante' => $tipo,
            'nombre_cliente' => $cliente?->nombre ?? 'Público general',
            'documento_cliente' => $cliente?->numero_documento,
            'metodo_pago' => fake()->randomElement(['efectivo', 'efectivo', 'tarjeta']),
            'creado_en' => fake()->dateTimeBetween('-60 days', 'now'),
        ]);

        // Líneas con precio congelado del producto
        $bruto = 0;
        $numLineas = fake()->numberBetween(1, 4);

        for ($l = 0; $l < $numLineas; $l++) {
            $producto = $productos->random();
            $cantidad = fake()->numberBetween(1, 3);
            $bruto += $cantidad * (float) $producto->precio;

            PedidoDetalle::create([
                'pedido_id' => $pedido->id,
                'producto_id' => $producto->id,
                'cantidad' => $cantidad,
                'precio' => $producto->precio,
                'nota' => fake()->boolean(15) ? 'Sin picante' : null,
                'estado' => $estado === 'completada'
                    ? 'servido'
                    : fake()->randomElement(['pendiente', 'pendiente', 'en_cocina']),
            ]);
        }

        // Totales coherentes (precios con IGV incluido)
        $descuento = $estado === 'completada' && fake()->boolean(25)
            ? round($bruto * 0.1, 2) : 0;
        $propina = $estado === 'completada' && fake()->boolean(20)
            ? round($bruto * 0.1, 2) : 0;
        $total = round($bruto - $descuento + $propina, 2);
        $gravado = round($total / 1.18, 2);

        $pedido->fill([
            'subtotal' => $total,
            'total' => $total,
            'total_gravado' => $gravado,
            'igv' => round($total - $gravado, 2),
            'descuento' => $descuento,
            'propina' => $propina,
        ]);

        if ($estado === 'completada' && $pedido->metodo_pago === 'efectivo') {
            $recibido = $total + fake()->randomElement([0, 0, 5, 10, 20, 50]);
            $pedido->monto_recibido = $recibido;
            $pedido->vuelto = round($recibido - $total, 2);
        }

        // Numeración atómica + trazabilidad SUNAT para electrónicos
        if ($electronico) {
            $serie = $tipo === 'factura' ? 'F001' : 'B001';
            $pedido->serie = $serie;
            $pedido->correlativo = SerieDocumento::siguiente($serie);
            $pedido->estado_sunat = 'ACEPTADO';
            $pedido->codigo_sunat = '0';
            $pedido->descripcion_sunat = 'Aceptado por SUNAT';
            $pedido->hash = fake()->sha256();
            $pedido->ruta_xml = "sunat/xml/{$serie}-{$pedido->correlativo}.xml";
            $pedido->ruta_cdr = "sunat/cdr/R-{$serie}-{$pedido->correlativo}.zip";
            $pedido->enviado_en = $pedido->creado_en;
        }

        $pedido->save();

        return $pedido->refresh();
    }
}
