// presupuesto.ts
export interface Presupuesto {
  id?: number;
  categoriaId: number;
  montoMaximo: number;
  periodo: 'mensual' | 'trimestral';
}
