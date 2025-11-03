import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { map } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class ReportsService {
  private api = `${environment.apiUrl}/transactions`;

  constructor(private http: HttpClient) {}

  /** Balance mensual */
  getMonthlyBalance() {
    return this.http.get<any[]>(this.api).pipe(
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

  /** Gastos por categoría */
  getExpensesByCategory() {
    return this.http.get<any[]>(this.api).pipe(
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
}
