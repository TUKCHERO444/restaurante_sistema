<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('reservas', function (Blueprint $table) {
            $table->id();
            $table->string('nombre_cliente');
            $table->string('telefono')->nullable();
            $table->dateTime('fecha_reserva');
            $table->integer('personas');
            $table->foreignId('mesa_id')->nullable()->constrained('mesas')->nullOnDelete();
            $table->text('nota')->nullable();
            $table->enum('estado', ['pendiente', 'confirmada', 'cancelada'])->default('pendiente');
            $table->timestamp('creado_en')->nullable();
            $table->timestamp('actualizado_en')->nullable();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('reservas');
    }
};
