import { Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpHeaders } from '@angular/common/http'; // <--- Importar HttpHeaders
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../environments/environment.production'; // Asegúrate que sea el environment correcto
import { Movimiento } from '../shared/interfaces/movimiento';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class TransactionsService {
  private apiUrl = `${environment.apiUrl}/transactions/`;

  constructor(
    private http: HttpClient,
    private auth: AuthService
  ) { }

  // --- HELPER: Convertir DD/MM/YYYY a YYYY-MM-DD ---
  private convertDate(dateString: string): string {
    if (!dateString) return '';
    if (dateString.includes('/')) {
        const parts = dateString.split('/');
        if (parts.length === 3) {
            return `${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`;
        }
    }
    return dateString;
  }

  // --- HELPER 
  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    let headers = new HttpHeaders();
    if (token) {
      headers = headers.set('Authorization', `Token ${token}`);
    }
    return headers;
  }

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

    // Mapeo de filtros para Django
    if (filters.usuarioId != null) {
      // Django suele esperar 'usuario' en lugar de 'usuarioId' si el campo en el modelo se llama 'usuario'
      params = params.set('usuario', String(filters.usuarioId)); 
    }
    if (filters.tipo) {
      params = params.set('tipo', filters.tipo);
    }
    if (filters.categoria) {
      params = params.set('categoria', filters.categoria);
    }
    if (filters.fechaDesde) {
      // Ajusta esto si usas django-filter (ej: fecha_after)
      params = params.set('fecha_after', filters.fechaDesde); 
    }
    if (filters.fechaHasta) {
      params = params.set('fecha_before', filters.fechaHasta); 
    }
    
    // Paginación estándar de DRF (page / page_size)
    if (filters.page) {
      params = params.set('page', String(filters.page));
    }

    const headers = this.getAuthHeaders(); // <--- OBTENER HEADERS

    return this.http.get<Movimiento[]>(this.apiUrl, { headers, params });
  }

  getById(id: number): Observable<Movimiento> {
    const headers = this.getAuthHeaders();
    return this.http.get<Movimiento>(`${this.apiUrl}${id}/`, { headers });
  }

  getByUserId(usuarioId: number): Observable<Movimiento[]> {
    return this.getAll({ usuarioId });
  }

  getByTipo(tipo: 'Ingreso' | 'Gasto'): Observable<Movimiento[]> {
    return this.getAll({ tipo });
  }

  getByCategoria(categoria: string): Observable<Movimiento[]> {
    return this.getAll({ categoria });
  }

  create(movimiento: Partial<Movimiento>): Observable<Movimiento> {
    const user = this.auth.getCurrentUser();
    if (user && !movimiento.usuarioId) {
      movimiento.usuarioId = user.id;
    }
    
    const headers = this.getAuthHeaders(); // <--- HEADERS
    return this.http.post<Movimiento>(this.apiUrl, movimiento, { headers });
  }

  update(id: number, movimiento: Partial<Movimiento>): Observable<Movimiento> {
    const headers = this.getAuthHeaders(); // <--- HEADERS
    return this.http.patch<Movimiento>(`${this.apiUrl}${id}/`, movimiento, { headers });
  }

  delete(id: number): Observable<void> {
    const headers = this.getAuthHeaders(); // <--- HEADERS
    return this.http.delete<void>(`${this.apiUrl}${id}/`, { headers });
  }

  // --- MÉTODOS PARA DASHBOARD Y ESTADÍSTICAS ---

  getFilteredAndSum(filters = {}) {
    // Este método llama internamente a getAll, que ya tiene los headers, así que está bien.
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

    const fechaDesde = `${targetAnio}-${String(targetMes).padStart(2, '0')}-01`;
    const ultimoDia = new Date(targetAnio, targetMes, 0).getDate();
    const fechaHasta = `${targetAnio}-${String(targetMes).padStart(2, '0')}-${ultimoDia}`;

    const filters: any = { fechaDesde, fechaHasta };
    
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

getGastosPorCategoria(filters = {}): Observable<any[]> {
    return this.getAll({ ...filters, tipo: 'Gasto' }).pipe(
      map(list => {
        const agrupado = list.reduce((acc, t) => {
          const cat = t.categoria || 'Sin categoría';
          if (!acc[cat]) acc[cat] = 0;
          acc[cat] += Number(t.monto) || 0;
          return acc;
        }, {} as Record<string, number>);

        return Object.entries(agrupado)
          .map(([categoria, total]) => ({ categoria, total }))
          .sort((a, b) => b.total - a.total);
      })
    );
  }

  getMonthlyEvolution(filters: any = {}): Observable<any[]> {
    return this.getAll(filters).pipe(
      map(list => {
        const grouped = list.reduce((acc, mov) => {
            const fechaStr = String(mov.fecha);
            // Extraer YYYY-MM
            const monthKey = fechaStr.length >= 7 ? fechaStr.substring(0, 7) : 'Sin fecha';

            if (!acc[monthKey]) {
                acc[monthKey] = { ingresos: 0, gastos: 0 };
            }

            const monto = Number(mov.monto) || 0;
            if (mov.tipo === 'Ingreso') {
                acc[monthKey].ingresos += monto;
            } else if (mov.tipo === 'Gasto') {
                acc[monthKey].gastos += monto;
            }
            return acc;
        }, {} as Record<string, { ingresos: number, gastos: number }>);
        
        return Object.entries(grouped)
            .map(([mes, data]) => ({ 
                mes, 
                ingresos: data.ingresos, 
                gastos: data.gastos 
            }))
            .sort((a, b) => a.mes.localeCompare(b.mes));
      })
    );
  }
}