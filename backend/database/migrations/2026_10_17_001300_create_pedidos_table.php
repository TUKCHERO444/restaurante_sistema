<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('pedidos', function (Blueprint $table) {
            $table->id();
            // NULL = delivery/mostrador
            $table->foreignId('mesa_id')->nullable()->constrained('mesas')->restrictOnDelete();
            $table->foreignId('usuario_id')->constrained('usuarios');
            $table->foreignId('cliente_id')->nullable()->constrained('clientes')->nullOnDelete();
            $table->foreignId('caja_id')->nullable()->constrained('cajas')->nullOnDelete();
            $table->enum('estado', ['pendiente', 'completada', 'anulada'])->default('pendiente');

            // Totales (fiscal 12,2 para desglose SUNAT)
            $table->decimal('total', 10, 2)->default(0);
            $table->decimal('subtotal', 12, 2)->default(0);
            $table->decimal('igv', 12, 2)->default(0);
            $table->decimal('total_gravado', 12, 2)->default(0);
            $table->decimal('total_exonerado', 12, 2)->default(0);
            $table->decimal('total_inafecto', 12, 2)->default(0);
            $table->decimal('total_gratuito', 12, 2)->default(0);

            // Cobro
            $table->decimal('descuento', 10, 2)->default(0);
            $table->decimal('propina', 10, 2)->default(0);
            $table->string('metodo_pago')->default('efectivo'); // efectivo/tarjeta
            $table->decimal('monto_recibido', 10, 2)->nullable();
            $table->decimal('vuelto', 10, 2)->default(0);

            // Comprobante
            $table->string('tipo_comprobante')->default('ticket'); // ticket/boleta/factura
            $table->string('nombre_cliente')->default('Público general');
            $table->string('documento_cliente')->nullable();
            $table->string('serie', 4)->nullable();
            $table->unsignedInteger('correlativo')->nullable();
            $table->unique(['tipo_comprobante', 'serie', 'correlativo']);

            // Trazabilidad SUNAT
            $table->string('estado_sunat', 30)->default('PENDIENTE');
            $table->string('codigo_sunat', 10)->nullable();
            $table->text('descripcion_sunat')->nullable();
            $table->string('ruta_xml')->nullable();
            $table->string('ruta_cdr')->nullable();
            $table->string('ruta_pdf')->nullable();
            $table->string('hash', 100)->nullable();
            $table->timestamp('enviado_en')->nullable();

            $table->text('notas')->nullable();
            $table->timestamp('creado_en')->nullable();
            $table->timestamp('actualizado_en')->nullable();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('pedidos');
    }
};
