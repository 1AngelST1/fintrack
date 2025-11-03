// categoria.ts
export interface Categoria {
  id?: number;
  nombre: string;
  tipo: 'Ingreso' | 'Gasto';
  color: string;
  estado: boolean;
}
