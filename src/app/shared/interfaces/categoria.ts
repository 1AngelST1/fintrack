// categoria.ts
export interface Categoria {
  id?: number;
  usuarioId: number;
  nombre: string;
  tipo: 'Ingreso' | 'Gasto';
  color: string;
  estado: boolean;
}
