<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('repartos', function (Blueprint $table) {
            $table->id();
            $table->foreignId('pedido_id')->constrained('pedidos')->cascadeOnDelete();
            $table->foreignId('cliente_id')->nullable()->constrained('clientes')->nullOnDelete();
            $table->string('nombre_cliente');
            $table->string('telefono_cliente');
            $table->text('direccion');
            $table->string('referencia')->nullable();
            $table->foreignId('repartidor_id')->nullable()->constrained('repartidores')->nullOnDelete();
            $table->foreignId('usuario_id')->constrained('usuarios');
            $table->foreignId('caja_id')->nullable()->constrained('cajas')->nullOnDelete();
            $table->enum('estado', ['pendiente', 'en_preparacion', 'en_camino', 'entregado', 'cancelado'])->default('pendiente');
            $table->enum('metodo_pago', ['efectivo', 'tarjeta', 'transferencia'])->default('efectivo');
            $table->decimal('costo_envio', 8, 2)->default(0);
            $table->text('notas')->nullable();
            $table->timestamp('programado_para')->nullable();
            $table->timestamp('entregado_en')->nullable();
            $table->timestamp('creado_en')->nullable();
            $table->timestamp('actualizado_en')->nullable();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('repartos');
    }
};
