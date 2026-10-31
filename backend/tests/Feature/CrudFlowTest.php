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

class CrudFlowTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        // Crear usuario autenticado para las pruebas
        $this->usuario = Usuario::factory()->create([
            'correo' => 'test@restaurante.com',
            'contrasena' => bcrypt('password123'),
            'rol' => 'administrador',
        ]);
        $this->actingAs($this->usuario);
    }

    // =========================================================================
    // TEST: Configuraciones CRUD
    // =========================================================================
    public function test_configuraciones_crud_flow()
    {
        // CREATE
        $response = $this->postJson('/configuraciones', [
            'clave' => 'empresa_nombre',
            'valor' => 'Mi Restaurante S.A.C.',
        ]);
        $response->assertRedirect('/configuraciones');
        $this->assertDatabaseHas('configuraciones', ['clave' => 'empresa_nombre']);

        $config = Configuracion::where('clave', 'empresa_nombre')->first();

        // UPDATE
        $response = $this->putJson("/configuraciones/{$config->id}", [
            'clave' => 'empresa_nombre',
            'valor' => 'Nuevo Nombre S.A.C.',
        ]);
        $response->assertRedirect('/configuraciones');
        $this->assertDatabaseHas('configuraciones', ['valor' => 'Nuevo Nombre S.A.C.']);

        // DELETE
        $response = $this->deleteJson("/configuraciones/{$config->id}");
        $response->assertRedirect('/configuraciones');
        $this->assertDatabaseMissing('configuraciones', ['id' => $config->id]);
    }

    // =========================================================================
    // TEST: Categorías CRUD
    // =========================================================================
    public function test_categorias_crud_flow()
    {
        // CREATE
        $response = $this->postJson('/categorias', [
            'nombre' => 'Bebidas',
            'activo' => true,
        ]);
        $response->assertRedirect('/categorias');
        $this->assertDatabaseHas('categorias', ['nombre' => 'Bebidas']);

        $categoria = Categoria::where('nombre', 'Bebidas')->first();

        // UPDATE
        $response = $this->putJson("/categorias/{$categoria->id}", [
            'nombre' => 'Bebidas Frías',
            'activo' => true,
        ]);
        $response->assertRedirect('/categorias');
        $this->assertDatabaseHas('categorias', ['nombre' => 'Bebidas Frías']);

        // DELETE
        $response = $this->deleteJson("/categorias/{$categoria->id}");
        $response->assertRedirect('/categorias');
        $this->assertDatabaseMissing('categorias', ['id' => $categoria->id]);
    }

    // =========================================================================
    // TEST: Integridad — No eliminar categoría con productos
    // =========================================================================
    public function test_integridad_categoria_con_productos()
    {
        $categoria = Categoria::create(['nombre' => 'Platos Fuertes', 'activo' => true]);
        $producto = Producto::create([
            'categoria_id' => $categoria->id,
            'nombre' => 'Lomo Saltado',
            'precio' => 35.00,
        ]);

        // DELETE debe fallar por integridad
        $response = $this->deleteJson("/categorias/{$categoria->id}");
        $response->assertRedirect('/categorias');
        $response->assertSessionHas('error');
        $this->assertDatabaseHas('categorias', ['id' => $categoria->id]);
    }

    // =========================================================================
    // TEST: Áreas CRUD
    // =========================================================================
    public function test_areas_crud_flow()
    {
        // CREATE
        $response = $this->postJson('/areas', [
            'nombre' => 'Salón Principal',
        ]);
        $response->assertRedirect('/areas');
        $this->assertDatabaseHas('areas', ['nombre' => 'Salón Principal']);

        $area = Area::where('nombre', 'Salón Principal')->first();

        // UPDATE
        $response = $this->putJson("/areas/{$area->id}", [
            'nombre' => 'Salón VIP',
        ]);
        $response->assertRedirect('/areas');
        $this->assertDatabaseHas('areas', ['nombre' => 'Salón VIP']);

        // DELETE
        $response = $this->deleteJson("/areas/{$area->id}");
        $response->assertRedirect('/areas');
        $this->assertDatabaseMissing('areas', ['id' => $area->id]);
    }

    // =========================================================================
    // TEST: Mesas CRUD
    // =========================================================================
    public function test_mesas_crud_flow()
    {
        $area = Area::create(['nombre' => 'Terraza']);

        // CREATE
        $response = $this->postJson('/mesas', [
            'area_id' => $area->id,
            'nombre' => 'Mesa 1',
            'asientos' => 4,
            'estado' => 'libre',
            'pos_x' => 100,
            'pos_y' => 200,
        ]);
        $response->assertRedirect('/mesas');
        $this->assertDatabaseHas('mesas', ['nombre' => 'Mesa 1']);

        $mesa = Mesa::where('nombre', 'Mesa 1')->first();

        // UPDATE
        $response = $this->putJson("/mesas/{$mesa->id}", [
            'area_id' => $area->id,
            'nombre' => 'Mesa VIP 1',
            'asientos' => 6,
            'estado' => 'libre',
        ]);
        $response->assertRedirect('/mesas');
        $this->assertDatabaseHas('mesas', ['nombre' => 'Mesa VIP 1']);

        // DELETE
        $response = $this->deleteJson("/mesas/{$mesa->id}");
        $response->assertRedirect('/mesas');
        $this->assertDatabaseMissing('mesas', ['id' => $mesa->id]);
    }

    // =========================================================================
    // TEST: Clientes CRUD
    // =========================================================================
    public function test_clientes_crud_flow()
    {
        // CREATE
        $response = $this->postJson('/clientes', [
            'nombre' => 'Juan Pérez',
            'tipo_documento' => 'DNI',
            'numero_documento' => '12345678',
            'telefono' => '999888777',
            'correo' => 'juan@example.com',
            'direccion' => 'Av. Principal 123',
        ]);
        $response->assertRedirect('/clientes');
        $this->assertDatabaseHas('clientes', ['nombre' => 'Juan Pérez']);

        $cliente = Cliente::where('nombre', 'Juan Pérez')->first();

        // UPDATE
        $response = $this->putJson("/clientes/{$cliente->id}", [
            'nombre' => 'Juan Pérez García',
            'tipo_documento' => 'DNI',
            'numero_documento' => '12345678',
            'telefono' => '999888777',
        ]);
        $response->assertRedirect('/clientes');
        $this->assertDatabaseHas('clientes', ['nombre' => 'Juan Pérez García']);

        // DELETE
        $response = $this->deleteJson("/clientes/{$cliente->id}");
        $response->assertRedirect('/clientes');
        $this->assertDatabaseMissing('clientes', ['id' => $cliente->id]);
    }

    // =========================================================================
    // TEST: Validaciones de formularios
    // =========================================================================
    public function test_validaciones_configuracion()
    {
        // Clave duplicada
        Configuracion::create(['clave' => 'test_key', 'valor' => 'valor1']);

        $response = $this->postJson('/configuraciones', [
            'clave' => 'test_key',
            'valor' => 'valor2',
        ]);
        $response->assertStatus(302);
        $response->assertSessionHasErrors('clave');
    }

    public function test_validaciones_producto()
    {
        $response = $this->postJson('/productos', [
            'categoria_id' => 999, // No existe
            'nombre' => 'Producto Test',
            'precio' => -10,
        ]);
        $response->assertStatus(302);
        $response->assertSessionHasErrors(['categoria_id', 'precio']);
    }

    public function test_validaciones_cliente()
    {
        // Número de documento duplicado
        Cliente::create([
            'nombre' => 'Cliente Existente',
            'tipo_documento' => 'DNI',
            'numero_documento' => '87654321',
        ]);

        $response = $this->postJson('/clientes', [
            'nombre' => 'Cliente Duplicado',
            'tipo_documento' => 'DNI',
            'numero_documento' => '87654321',
        ]);
        $response->assertStatus(302);
        $response->assertSessionHasErrors('numero_documento');
    }

    // =========================================================================
    // TEST: Flujo completo de Pedido con checkout
    // =========================================================================
    public function test_pedido_checkout_flujo()
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
        $response = $this->postJson("/pedidos/{$pedido->id}/detalles", [
            'producto_id' => $producto->id,
            'cantidad' => 2,
        ]);
        $response->assertRedirect("/pedidos/{$pedido->id}");

        // Checkout
        $response = $this->postJson("/pedidos/{$pedido->id}/checkout", [
            'tipo_comprobante' => 'ticket',
            'metodo_pago' => 'efectivo',
            'monto_recibido' => 110.00,
        ]);
        $response->assertRedirect("/pedidos/{$pedido->id}");

        // Verificar stock descontado
        $producto->refresh();
        $this->assertEquals(8, $producto->stock);

        // Verificar pedido completado
        $pedido->refresh();
        $this->assertEquals('completada', $pedido->estado);
    }

    // =========================================================================
    // TEST: Integridad — No eliminar producto con pedidos
    // =========================================================================
    public function test_integridad_producto_con_pedidos()
    {
        $categoria = Categoria::create(['nombre' => 'Platos', 'activo' => true]);
        $producto = Producto::create([
            'categoria_id' => $categoria->id,
            'nombre' => 'Plato con Pedidos',
            'precio' => 25.00,
        ]);

        $pedido = Pedido::create([
            'usuario_id' => $this->usuario->id,
            'nombre_cliente' => 'Test',
            'estado' => 'pendiente',
        ]);

        $pedido->detalles()->create([
            'producto_id' => $producto->id,
            'cantidad' => 1,
            'precio' => 25.00,
        ]);

        // DELETE debe fallar
        $response = $this->deleteJson("/productos/{$producto->id}");
        $response->assertRedirect('/productos');
        $response->assertSessionHas('error');
        $this->assertDatabaseHas('productos', ['id' => $producto->id]);
    }
}
