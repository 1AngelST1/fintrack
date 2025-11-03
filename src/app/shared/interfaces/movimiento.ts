// movimiento.ts
export interface Movimiento {
  id?: number;
  tipo: 'Ingreso' | 'Gasto';
  categoriaId: number;
  monto: number;
  fecha: string;
  descripcion?: string;
  usuarioId: number;
}
