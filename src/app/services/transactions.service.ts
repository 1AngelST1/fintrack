import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../environments/environment.production';
import { Movimiento } from '../shared/interfaces/movimiento';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class TransactionsService {
  private apiUrl = `${environment.apiUrl}/transactions`;

  constructor(
    private http: HttpClient,
    private auth: AuthService
  ) { }

  getAll(filters: {
    usuarioId?: number;
    tipo?: string;
    categoria?: string;
    fechaDesde?: string;
    fechaHasta?: string;
    page?: number;
    limit?: number;
  } = {}): Observable<Movimiento[]> {
    let params = new HttpParams();

    // Aplicar filtros
    if (filters.usuarioId != null) {
      params = params.set('usuarioId', String(filters.usuarioId));
    }
    if (filters.tipo) {
      params = params.set('tipo', filters.tipo);
    }
    if (filters.categoria) {
      params = params.set('categoria', filters.categoria);
    }
    if (filters.fechaDesde) {
      params = params.set('fecha_gte', filters.fechaDesde);
    }
    if (filters.fechaHasta) {
      params = params.set('fecha_lte', filters.fechaHasta);
    }
    if (filters.page) {
      params = params.set('_page', String(filters.page));
    }
    if (filters.limit) {
      params = params.set('_limit', String(filters.limit));
    }

    // Ordenar por fecha descendente (más recientes primero)
    params = params.set('_sort', 'fecha');
    params = params.set('_order', 'desc');

    return this.http.get<Movimiento[]>(this.apiUrl, { params });
  }

  // Obtener transacción por ID

  getById(id: number): Observable<Movimiento> {
    return this.http.get<Movimiento>(`${this.apiUrl}/${id}`);
  }

  //Obtener transacciones por usuario
  getByUserId(usuarioId: number): Observable<Movimiento[]> {
    return this.getAll({ usuarioId });
  }

  // Obtener transacciones por tipo
  getByTipo(tipo: 'Ingreso' | 'Gasto'): Observable<Movimiento[]> {
    return this.getAll({ tipo });
  }

  getByCategoria(categoria: string): Observable<Movimiento[]> {
    return this.getAll({ categoria });
  }

  create(movimiento: Partial<Movimiento>): Observable<Movimiento> {
    // Asignar usuarioId actual si no viene
    const user = this.auth.getCurrentUser();
    if (user && !movimiento.usuarioId) {
      movimiento.usuarioId = user.id;
    }

    return this.http.post<Movimiento>(this.apiUrl, movimiento);
  }

  //Actualizar transacción existente
  //Usa PATCH para actualización parcial (mantiene campos no enviados)
  update(id: number, movimiento: Partial<Movimiento>): Observable<Movimiento> {
    return this.http.patch<Movimiento>(`${this.apiUrl}/${id}`, movimiento);
  }

  //Eliminar transacción
  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  getFilteredAndSum(filters = {}) {
    return this.getAll(filters).pipe(
      map(list => {
        const ingresos = list
          .filter(x => x.tipo === 'Ingreso')
          .reduce((sum, x) => sum + (x.monto || 0), 0);
        
        const gastos = list
          .filter(x => x.tipo === 'Gasto')
          .reduce((sum, x) => sum + (x.monto || 0), 0);
        
        const balance = ingresos - gastos;

        return {
          ingresos,
          gastos,
          balance,
          list
        };
      })
    );
  }


  getBalanceMensual(mes?: number, anio?: number): Observable<{
    ingresos: number;
    gastos: number;
    balance: number;
  }> {
    const user = this.auth.getCurrentUser();
    const now = new Date();
    const targetMes = mes ?? now.getMonth() + 1;
    const targetAnio = anio ?? now.getFullYear();

    // Crear fechas de inicio y fin del mes
    const fechaDesde = `${targetAnio}-${String(targetMes).padStart(2, '0')}-01`;
    const ultimoDia = new Date(targetAnio, targetMes, 0).getDate();
    const fechaHasta = `${targetAnio}-${String(targetMes).padStart(2, '0')}-${ultimoDia}`;

    const filters: any = { fechaDesde, fechaHasta };
    
    // Si no es admin, filtrar por usuario actual
    if (user && user.rol !== 'admin') {
      filters.usuarioId = user.id;
    }

    return this.getFilteredAndSum(filters).pipe(
      map(result => ({
        ingresos: result.ingresos,
        gastos: result.gastos,
        balance: result.balance
      }))
    );
  }


  getGastosPorCategoria(filters = {}): Observable<{ categoria: string; total: number }[]> {
    return this.getAll({ ...filters, tipo: 'Gasto' }).pipe(
      map(list => {
        const agrupado = list.reduce((acc, t) => {
          const cat = t.categoria || 'Sin categoría';
          if (!acc[cat]) {
            acc[cat] = 0;
          }
          acc[cat] += t.monto || 0;
          return acc;
        }, {} as Record<string, number>);

        return Object.entries(agrupado)
          .map(([categoria, total]) => ({ categoria, total }))
          .sort((a, b) => b.total - a.total);
      })
    );
  }
}
