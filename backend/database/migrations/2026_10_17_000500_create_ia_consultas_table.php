<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('ia_consultas', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('usuario_id')->index(); // → usuarios.id (lógico, sin FK)
            $table->string('pregunta', 500);
            $table->string('titulo', 160)->nullable();
            $table->text('sql_texto');
            $table->string('grafico')->nullable();
            $table->boolean('favorito')->default(false);
            $table->integer('veces')->default(1);
            $table->dateTime('creado_en')->nullable();
            $table->dateTime('ultimo_uso')->nullable();
            $table->index(['usuario_id', 'favorito']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('ia_consultas');
    }
};
