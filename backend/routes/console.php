<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schedule;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

/*
|--------------------------------------------------------------------------
| Tareas programadas
|--------------------------------------------------------------------------
|
| El Scheduler de Laravel está habilitado. Las futuras tareas del
| restaurante (p. ej. cierres diarios, recordatorios) se registrarán
| aquí con `Schedule::command(...)->daily();`, sin lógica de negocio
| por ahora.
|
| En desarrollo: php artisan schedule:work
| En producción: * * * * * php artisan schedule:run >> /dev/null 2>&1
|
*/

// Schedule::command('inspire')->hourly();
