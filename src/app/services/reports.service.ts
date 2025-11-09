import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../environments/environment.production';
import { map } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class ReportsService {
  private api = `${environment.apiUrl}/transactions`;

  constructor(private http: HttpClient) {}

  // Balance mensual
  getMonthlyBalance(filters: { usuarioId?: number; fechaDesde?: string; fechaHasta?: string } = {}) {
    let params = new HttpParams();
    if (filters.usuarioId) params = params.set('usuarioId', String(filters.usuarioId));
    if (filters.fechaDesde) params = params.set('fecha_gte', filters.fechaDesde);
    if (filters.fechaHasta) params = params.set('fecha_lte', filters.fechaHasta);

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
    if (filters.fechaDesde) params = params.set('fecha_gte', filters.fechaDesde);
    if (filters.fechaHasta) params = params.set('fecha_lte', filters.fechaHasta);

    return this.http.get<any[]>(this.api, { params }).pipe(
      map(transactions => {
        const gastos = transactions.filter(t => t.tipo === 'Gasto');
        const porCategoria: any = {};
        gastos.forEach(g => {
          porCategoria[g.categoria] = (porCategoria[g.categoria] || 0) + g.monto;
        });
        return porCategoria;
      })
    );
  }

  // Evolución mensual de ingresos y gastos
  getMonthlyEvolution(filters: { usuarioId?: number; fechaDesde?: string; fechaHasta?: string } = {}) {
    let params = new HttpParams();
    if (filters.usuarioId) params = params.set('usuarioId', String(filters.usuarioId));
    if (filters.fechaDesde) params = params.set('fecha_gte', filters.fechaDesde);
    if (filters.fechaHasta) params = params.set('fecha_lte', filters.fechaHasta);

    return this.http.get<any[]>(this.api, { params }).pipe(
      map(transactions => {
        const porMes: any = {};
        
        transactions.forEach(t => {
          const fecha = new Date(t.fecha);
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
