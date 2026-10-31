<?php

namespace Tests\Feature;

use Tests\TestCase;
use App\Models\Usuario;
use App\Models\Categoria;
use App\Models\Producto;
use App\Models\Cliente;
use App\Models\Area;
use App\Models\Mesa;
use App\Models\Pedido;
use App\Models\Configuracion;
use App\Models\SerieDocumento;
use Illuminate\Foundation\Testing\RefreshDatabase;

class ApiCrudFlowTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->usuario = Usuario::factory()->create([
            'correo' => 'test@restaurante.com',
            'contrasena' => bcrypt('password123'),
            'rol' => 'administrador',
        ]);
        $this->actingAs($this->usuario, 'sanctum');
    }

    // =========================================================================
    // API: Configuraciones CRUD
    // =========================================================================
    public function test_api_configuraciones_crud_flow()
    {
        // CREATE
        $response = $this->postJson('/api/v1/configuraciones', [
            'clave' => 'empresa_nombre',
            'valor' => 'Mi Restaurante S.A.C.',
        ]);
        $response->assertStatus(201);
        $this->assertDatabaseHas('configuraciones', ['clave' => 'empresa_nombre']);

        $config = Configuracion::where('clave', 'empresa_nombre')->first();

        // READ
        $response = $this->getJson("/api/v1/configuraciones/{$config->id}");
        $response->assertStatus(200)->assertJson(['clave' => 'empresa_nombre']);

        // UPDATE
        $response = $this->putJson("/api/v1/configuraciones/{$config->id}", [
            'clave' => 'empresa_nombre',
            'valor' => 'Nuevo Nombre S.A.C.',
        ]);
        $response->assertStatus(200);
        $this->assertDatabaseHas('configuraciones', ['valor' => 'Nuevo Nombre S.A.C.']);

        // DELETE
        $response = $this->deleteJson("/api/v1/configuraciones/{$config->id}");
        $response->assertStatus(204);
        $this->assertDatabaseMissing('configuraciones', ['id' => $config->id]);
    }

    // =========================================================================
    // API: Categorías CRUD
    // =========================================================================
    public function test_api_categorias_crud_flow()
    {
        // CREATE
        $response = $this->postJson('/api/v1/categorias', [
            'nombre' => 'Bebidas',
            'activo' => true,
        ]);
        $response->assertStatus(201);
        $this->assertDatabaseHas('categorias', ['nombre' => 'Bebidas']);

        $categoria = Categoria::where('nombre', 'Bebidas')->first();

        // UPDATE
        $response = $this->putJson("/api/v1/categorias/{$categoria->id}", [
            'nombre' => 'Bebidas Frías',
            'activo' => true,
        ]);
        $response->assertStatus(200);
        $this->assertDatabaseHas('categorias', ['nombre' => 'Bebidas Frías']);

        // DELETE
        $response = $this->deleteJson("/api/v1/categorias/{$categoria->id}");
        $response->assertStatus(204);
        $this->assertDatabaseMissing('categorias', ['id' => $categoria->id]);
    }

    // =========================================================================
    // API: Validaciones de formularios
    // =========================================================================
    public function test_api_validaciones_configuracion()
    {
        Configuracion::create(['clave' => 'test_key', 'valor' => 'valor1']);

        // Clave duplicada
        $response = $this->postJson('/api/v1/configuraciones', [
            'clave' => 'test_key',
            'valor' => 'valor2',
        ]);
        $response->assertStatus(422)->assertJsonValidationErrors('clave');
    }

    public function test_api_validaciones_producto()
    {
        // Categoría inexistente + precio negativo
        $response = $this->postJson('/api/v1/productos', [
            'categoria_id' => 999,
            'nombre' => 'Producto Test',
            'precio' => -10,
        ]);
        $response->assertStatus(422)->assertJsonValidationErrors(['categoria_id', 'precio']);
    }

    public function test_api_validaciones_cliente()
    {
        Cliente::create([
            'nombre' => 'Cliente Existente',
            'tipo_documento' => 'DNI',
            'numero_documento' => '87654321',
        ]);

        // Número de documento duplicado
        $response = $this->postJson('/api/v1/clientes', [
            'nombre' => 'Cliente Duplicado',
            'tipo_documento' => 'DNI',
            'numero_documento' => '87654321',
        ]);
        $response->assertStatus(422)->assertJsonValidationErrors('numero_documento');
    }

    // =========================================================================
    // API: Flujo completo de Pedido con checkout
    // =========================================================================
    public function test_api_pedido_checkout_flujo()
    {
        $categoria = Categoria::create(['nombre' => 'Platos', 'activo' => true]);
        $producto = Producto::create([
            'categoria_id' => $categoria->id,
            'nombre' => 'Pollo a la Brasa',
            'precio' => 45.00,
            'stock' => 10,
        ]);

        // Crear caja abierta
        $caja = \App\Models\Caja::create([
            'usuario_id' => $this->usuario->id,
            'apertura_en' => now(),
            'monto_apertura' => 100.00,
            'estado' => 'abierta',
        ]);

        // Crear pedido
        $pedido = Pedido::create([
            'usuario_id' => $this->usuario->id,
            'caja_id' => $caja->id,
            'nombre_cliente' => 'Público General',
            'estado' => 'pendiente',
        ]);

        // Agregar detalle
        $response = $this->postJson("/api/v1/pedidos/{$pedido->id}/detalles", [
            'producto_id' => $producto->id,
            'cantidad' => 2,
        ]);
        $response->assertStatus(201);

        // Checkout
        $response = $this->postJson("/api/v1/pedidos/{$pedido->id}/checkout", [
            'tipo_comprobante' => 'ticket',
            'metodo_pago' => 'efectivo',
            'monto_recibido' => 110.00,
        ]);
        $response->assertStatus(200);

        // Verificar stock descontado
        $producto->refresh();
        $this->assertEquals(8, $producto->stock);

        // Verificar pedido completado
        $pedido->refresh();
        $this->assertEquals('completada', $pedido->estado);
    }

    // =========================================================================
    // API: Listado y paginación
    // =========================================================================
    public function test_api_paginacion()
    {
        Categoria::factory()->count(20)->create();

        $response = $this->getJson('/api/v1/categorias');
        $response->assertStatus(200);
        $response->assertJsonStructure([
            'data' => [],
            'links' => [],
            'current_page' => [],
            'per_page' => [],
            'total' => [],
        ]);
    }
}
