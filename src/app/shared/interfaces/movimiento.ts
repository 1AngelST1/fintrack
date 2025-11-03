// movimiento.ts
export interface Movimiento {
  id?: number;
  usuarioId: number;
  tipo: 'Ingreso' | 'Gasto';
  categoria: string; // Nombre de la categoría
  categoriaId?: number; // ID opcional si se decide usar relación
  monto: number;
  fecha: string; // formato: yyyy-mm-dd
  descripcion?: string;
}
