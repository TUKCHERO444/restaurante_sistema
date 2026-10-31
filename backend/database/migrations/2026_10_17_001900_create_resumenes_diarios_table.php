<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('resumenes_diarios', function (Blueprint $table) {
            $table->id();
            $table->date('fecha_referencia');
            $table->date('fecha_generacion');
            $table->unsignedInteger('correlativo');
            $table->unique(['fecha_referencia', 'correlativo']);
            $table->string('identificador', 30); // RC-aaaammdd-N
            $table->unsignedInteger('total_documentos')->default(0);
            $table->decimal('monto_total', 14, 2)->default(0);
            $table->string('estado_sunat', 30)->default('PENDIENTE');
            $table->string('ticket', 100)->nullable();
            $table->string('codigo_sunat', 10)->nullable();
            $table->text('descripcion_sunat')->nullable();
            $table->string('ruta_xml')->nullable();
            $table->string('ruta_cdr')->nullable();
            $table->string('hash', 100)->nullable();
            $table->timestamp('enviado_en')->nullable();
            $table->timestamp('consultado_en')->nullable();
            $table->foreignId('usuario_id')->nullable()->constrained('usuarios')->nullOnDelete();
            $table->timestamp('creado_en')->nullable();
            $table->timestamp('actualizado_en')->nullable();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('resumenes_diarios');
    }
};
