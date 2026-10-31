<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('productos', function (Blueprint $table) {
            $table->id();
            $table->foreignId('categoria_id')->constrained('categorias')->cascadeOnDelete();
            $table->string('nombre');
            $table->string('codigo')->nullable();
            $table->string('codigo_barras')->nullable()->unique();
            $table->decimal('precio', 10, 2);
            $table->decimal('precio_promocional', 10, 2)->nullable();
            $table->decimal('costo', 10, 2)->nullable();
            $table->integer('stock')->nullable(); // NULL = ilimitado
            $table->boolean('vendible')->default(true); // false = insumo puro
            $table->string('imagen')->nullable();
            $table->boolean('activo')->default(true);
            $table->boolean('recomendado_chef')->default(false);
            $table->boolean('nuevo')->default(false);
            $table->timestamp('creado_en')->nullable();
            $table->timestamp('actualizado_en')->nullable();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('productos');
    }
};
