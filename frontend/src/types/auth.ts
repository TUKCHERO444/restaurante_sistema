/** Tipos de autenticación y usuarios del sistema. */

export type Rol = 'administrador' | 'cajero' | 'mozo' | 'cocina';

export interface Usuario {
  id: number;
  nombre: string;
  correo: string;
  rol: Rol;
  creado_en: string;
  actualizado_en: string;
}

export interface LoginRequest {
  correo: string;
  contrasena: string;
}

export interface LoginResponse {
  usuario: Usuario;
  token: string;
}

export interface UsuarioRequest {
  nombre: string;
  correo: string;
  contrasena: string;
  rol: Rol;
}
