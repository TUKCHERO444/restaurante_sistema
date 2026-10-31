import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Pencil, Trash2, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { usuariosService } from '@/services/usuarios.service';
import type { Usuario, Rol } from '@/types/auth';
import type { ApiError } from '@/types/api';

const ROLES: { value: Rol; label: string }[] = [
  { value: 'administrador', label: 'Administrador' },
  { value: 'cajero', label: 'Cajero' },
  { value: 'mozo', label: 'Mozo' },
  { value: 'cocina', label: 'Cocina' },
];

/**
 * Página de gestión de usuarios (CRUD).
 * Lista, crea, edita y elimina usuarios del sistema.
 */
export function UsuariosPage() {
  const queryClient = useQueryClient();
  const [busqueda, setBusqueda] = useState('');
  const [modalAbierto, setModalAbierto] = useState(false);
  const [usuarioEditando, setUsuarioEditando] = useState<Usuario | null>(null);
  const [confirmacionEliminar, setConfirmacionEliminar] = useState<Usuario | null>(null);

  // Form state
  const [nombre, setNombre] = useState('');
  const [correo, setCorreo] = useState('');
  const [contrasena, setContrasena] = useState('');
  const [rol, setRol] = useState<Rol>('mozo');
  const [errorForm, setErrorForm] = useState<string | null>(null);

  // Queries
  const { data, isLoading } = useQuery({
    queryKey: ['usuarios'],
    queryFn: () => usuariosService.listar(),
  });

  // Mutations
  const crearMutation = useMutation({
    mutationFn: usuariosService.crear,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['usuarios'] });
      cerrarModal();
    },
    onError: (err: ApiError) => setErrorForm(err.message),
  });

  const actualizarMutation = useMutation({
    mutationFn: ({ id, datos }: { id: number; datos: Partial<Usuario> }) =>
      usuariosService.actualizar(id, datos),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['usuarios'] });
      cerrarModal();
    },
    onError: (err: ApiError) => setErrorForm(err.message),
  });

  const eliminarMutation = useMutation({
    mutationFn: usuariosService.eliminar,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['usuarios'] });
      setConfirmacionEliminar(null);
    },
  });

  const abrirModalCrear = () => {
    setUsuarioEditando(null);
    setNombre('');
    setCorreo('');
    setContrasena('');
    setRol('mozo');
    setErrorForm(null);
    setModalAbierto(true);
  };

  const abrirModalEditar = (usuario: Usuario) => {
    setUsuarioEditando(usuario);
    setNombre(usuario.nombre);
    setCorreo(usuario.correo);
    setContrasena('');
    setRol(usuario.rol);
    setErrorForm(null);
    setModalAbierto(true);
  };

  const cerrarModal = () => {
    setModalAbierto(false);
    setUsuarioEditando(null);
    setErrorForm(null);
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorForm(null);

    if (usuarioEditando) {
      const datos: Partial<Usuario & { contrasena?: string }> = { nombre, correo, rol };
      if (contrasena) datos.contrasena = contrasena;
      actualizarMutation.mutate({ id: usuarioEditando.id, datos });
    } else {
      crearMutation.mutate({ nombre, correo, contrasena, rol });
    }
  };

  const usuariosFiltrados = data?.data.filter(
    (u) =>
      u.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
      u.correo.toLowerCase().includes(busqueda.toLowerCase()),
  );

  return (
    <div className="flex flex-col gap-6">
      {/* Encabezado */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Usuarios</h2>
          <p className="text-muted-foreground">
            Gestión de usuarios del sistema
          </p>
        </div>
        <Button type="button" onClick={abrirModalCrear}>
          <Plus className="size-4" aria-hidden />
          Nuevo usuario
        </Button>
      </div>

      {/* Búsqueda */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
        <Input
          type="search"
          placeholder="Buscar por nombre o correo..."
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* Tabla */}
      <Card>
        <CardHeader>
          <CardTitle>Lista de usuarios</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex flex-col gap-2">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : !usuariosFiltrados?.length ? (
            <p className="py-8 text-center text-muted-foreground">
              No se encontraron usuarios.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="pb-3 text-left font-medium text-muted-foreground">Nombre</th>
                    <th className="pb-3 text-left font-medium text-muted-foreground">Correo</th>
                    <th className="pb-3 text-left font-medium text-muted-foreground">Rol</th>
                    <th className="pb-3 text-right font-medium text-muted-foreground">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {usuariosFiltrados.map((usuario) => (
                    <tr key={usuario.id} className="border-b border-border last:border-0">
                      <td className="py-3 font-medium">{usuario.nombre}</td>
                      <td className="py-3 text-muted-foreground">{usuario.correo}</td>
                      <td className="py-3">
                        <Badge variant="secondary">
                          {ROLES.find((r) => r.value === usuario.rol)?.label}
                        </Badge>
                      </td>
                      <td className="py-3">
                        <div className="flex justify-end gap-1">
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => abrirModalEditar(usuario)}
                            aria-label={`Editar ${usuario.nombre}`}
                          >
                            <Pencil className="size-4" aria-hidden />
                          </Button>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => setConfirmacionEliminar(usuario)}
                            aria-label={`Eliminar ${usuario.nombre}`}
                            className="text-destructive hover:text-destructive"
                          >
                            <Trash2 className="size-4" aria-hidden />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modal crear/editar */}
      <Dialog open={modalAbierto} onOpenChange={setModalAbierto}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {usuarioEditando ? 'Editar usuario' : 'Nuevo usuario'}
            </DialogTitle>
            <DialogDescription>
              {usuarioEditando
                ? 'Modifica los datos del usuario.'
                : 'Completa los datos para crear un nuevo usuario.'}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {errorForm && (
              <div
                role="alert"
                className="rounded-md border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive"
              >
                {errorForm}
              </div>
            )}

            <div className="flex flex-col gap-2">
              <Label htmlFor="nombre">Nombre</Label>
              <Input
                id="nombre"
                value={nombre}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNombre(e.target.value)}
                required
              />
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="correo">Correo electrónico</Label>
              <Input
                id="correo"
                type="email"
                value={correo}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCorreo(e.target.value)}
                required
              />
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="contrasena">
                Contraseña {!usuarioEditando && '(mínimo 8 caracteres)'}
              </Label>
              <Input
                id="contrasena"
                type="password"
                value={contrasena}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setContrasena(e.target.value)}
                required={!usuarioEditando}
                minLength={8}
                placeholder={usuarioEditando ? 'Dejar vacío para no cambiar' : ''}
              />
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="rol">Rol</Label>
              <Select value={rol} onValueChange={(v) => setRol(v as Rol)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ROLES.map((r) => (
                    <SelectItem key={r.value} value={r.value}>
                      {r.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={cerrarModal}>
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={crearMutation.isPending || actualizarMutation.isPending}
              >
                {crearMutation.isPending || actualizarMutation.isPending
                  ? 'Guardando...'
                  : usuarioEditando
                    ? 'Guardar cambios'
                    : 'Crear usuario'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Modal confirmación eliminar */}
      <Dialog open={!!confirmacionEliminar} onOpenChange={() => setConfirmacionEliminar(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Eliminar usuario</DialogTitle>
            <DialogDescription>
              ¿Estás seguro de que deseas eliminar a{' '}
              <strong>{confirmacionEliminar?.nombre}</strong>? Esta acción no se
              puede deshacer.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmacionEliminar(null)}>
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={() =>
                confirmacionEliminar && eliminarMutation.mutate(confirmacionEliminar.id)
              }
              disabled={eliminarMutation.isPending}
            >
              {eliminarMutation.isPending ? 'Eliminando...' : 'Eliminar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
