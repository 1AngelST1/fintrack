import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../environments/environment.production';
import { map } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class ReportsService {
  // Aseguramos la barra al final para evitar errores de redirección
  private api = `${environment.apiUrl}/transactions/`;

  constructor(private http: HttpClient) {}

  // Balance mensual
  getMonthlyBalance(filters: { usuarioId?: number; fechaDesde?: string; fechaHasta?: string } = {}) {
    let params = new HttpParams();
    if (filters.usuarioId) params = params.set('usuarioId', String(filters.usuarioId));
    
    // [CORRECCIÓN] Usar los nombres que Django espera
    if (filters.fechaDesde) params = params.set('fechaDesde', filters.fechaDesde);
    if (filters.fechaHasta) params = params.set('fechaHasta', filters.fechaHasta);

    return this.http.get<any[]>(this.api, { params }).pipe(
      map(transactions => {
        const ingresos = transactions
          .filter(t => t.tipo === 'Ingreso')
          .reduce((sum, t) => sum + t.monto, 0);
        const gastos = transactions
          .filter(t => t.tipo === 'Gasto')
          .reduce((sum, t) => sum + t.monto, 0);
        return { ingresos, gastos, balance: ingresos - gastos };
      })
    );
  }

  // Gastos por categoría
  getExpensesByCategory(filters: { usuarioId?: number; fechaDesde?: string; fechaHasta?: string } = {}) {
    let params = new HttpParams();
    if (filters.usuarioId) params = params.set('usuarioId', String(filters.usuarioId));
    
    // [CORRECCIÓN] Usar los nombres que Django espera
    if (filters.fechaDesde) params = params.set('fechaDesde', filters.fechaDesde);
    if (filters.fechaHasta) params = params.set('fechaHasta', filters.fechaHasta);

    return this.http.get<any[]>(this.api, { params }).pipe(
      map(transactions => {
        const gastos = transactions.filter(t => t.tipo === 'Gasto');
        const porCategoria: any = {};
        gastos.forEach(g => {
          // Usamos el nombre de la categoría directamente
          const catName = g.categoria || 'Sin categoría';
          porCategoria[catName] = (porCategoria[catName] || 0) + g.monto;
        });
        return porCategoria;
      })
    );
  }

  // Evolución mensual de ingresos y gastos
  getMonthlyEvolution(filters: { usuarioId?: number; fechaDesde?: string; fechaHasta?: string } = {}) {
    let params = new HttpParams();
    if (filters.usuarioId) params = params.set('usuarioId', String(filters.usuarioId));
    
    // [CORRECCIÓN] Usar los nombres que Django espera
    if (filters.fechaDesde) params = params.set('fechaDesde', filters.fechaDesde);
    if (filters.fechaHasta) params = params.set('fechaHasta', filters.fechaHasta);

    return this.http.get<any[]>(this.api, { params }).pipe(
      map(transactions => {
        const porMes: any = {};
        
        transactions.forEach(t => {
          // Ajuste de fecha para evitar problemas de zona horaria
          const fecha = new Date(t.fecha + 'T00:00:00');
          const mesAnio = `${fecha.getFullYear()}-${String(fecha.getMonth() + 1).padStart(2, '0')}`;
          
          if (!porMes[mesAnio]) {
            porMes[mesAnio] = { ingresos: 0, gastos: 0 };
          }
          
          if (t.tipo === 'Ingreso') {
            porMes[mesAnio].ingresos += t.monto;
          } else {
            porMes[mesAnio].gastos += t.monto;
          }
        });

        // Ordenar por mes
        const mesesOrdenados = Object.keys(porMes).sort();
        return mesesOrdenados.map(mes => ({
          mes,
          ingresos: porMes[mes].ingresos,
          gastos: porMes[mes].gastos
        }));
      })
    );
  }
}