<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('notas_credito', function (Blueprint $table) {
            $table->id();
            $table->foreignId('pedido_id')->constrained('pedidos')->cascadeOnDelete();
            $table->string('serie', 4);
            $table->unsignedInteger('correlativo');
            $table->unique(['serie', 'correlativo']);
            $table->string('tipo_documento', 30)->default('nota_credito');
            $table->string('codigo_motivo', 2); // Catálogo 09 SUNAT
            $table->string('descripcion_motivo');
            $table->decimal('subtotal', 12, 2)->default(0);
            $table->decimal('igv', 12, 2)->default(0);
            $table->decimal('total', 12, 2)->default(0);
            $table->string('estado_sunat', 30)->default('PENDIENTE');
            $table->string('codigo_sunat', 10)->nullable();
            $table->text('descripcion_sunat')->nullable();
            $table->string('ruta_xml')->nullable();
            $table->string('ruta_cdr')->nullable();
            $table->string('ruta_pdf')->nullable();
            $table->string('hash', 100)->nullable();
            $table->timestamp('enviado_en')->nullable();
            $table->foreignId('usuario_id')->nullable()->constrained('usuarios')->nullOnDelete();
            $table->timestamp('creado_en')->nullable();
            $table->timestamp('actualizado_en')->nullable();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('notas_credito');
    }
};
