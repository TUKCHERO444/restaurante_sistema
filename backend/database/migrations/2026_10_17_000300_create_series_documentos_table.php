<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('series_documentos', function (Blueprint $table) {
            $table->id();
            $table->string('codigo_documento', 2); // 01/03/07/08
            $table->string('tipo_documento', 30); // factura/boleta/nota_credito_*
            $table->string('serie', 4)->unique(); // B001/F001/BC01/FC01
            $table->unsignedInteger('ultimo_numero')->default(0);
            $table->boolean('activo')->default(true);
            $table->timestamp('creado_en')->nullable();
            $table->timestamp('actualizado_en')->nullable();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('series_documentos');
    }
};
