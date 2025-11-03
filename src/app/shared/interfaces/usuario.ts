// usuario.ts
export interface Usuario {
  id?: number;
  nombre: string;
  apellidos: string;
  correo: string;
  rol: 'admin' | 'usuario';
  password?: string;
}
