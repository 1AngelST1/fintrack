import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { Categoria } from '../shared/interfaces/categoria';

@Injectable({
  providedIn: 'root'
})
export class CategoriesService {
  private apiUrl = `${environment.apiUrl}/categories`;
  private transactionsUrl = `${environment.apiUrl}/transactions`;

  constructor(private http: HttpClient) { }

  getAll(): Observable<Categoria[]> {
    return this.http.get<Categoria[]>(this.apiUrl);
  }

  getById(id: number): Observable<Categoria> {
    return this.http.get<Categoria>(`${this.apiUrl}/${id}`);
  }

  getByUserId(usuarioId: number): Observable<Categoria[]> {
    return this.http.get<Categoria[]>(`${this.apiUrl}?usuarioId=${usuarioId}`);
  }

  getByTipo(tipo: 'ingreso' | 'gasto'): Observable<Categoria[]> {
    return this.http.get<Categoria[]>(`${this.apiUrl}?tipo=${tipo}`);
  }

  create(categoria: Partial<Categoria>): Observable<Categoria> {
    return this.http.post<Categoria>(this.apiUrl, categoria);
  }

  update(id: number, categoria: Partial<Categoria>): Observable<Categoria> {
    return this.http.put<Categoria>(`${this.apiUrl}/${id}`, categoria);
  }

  /**
   * Verifica si una categoría tiene transacciones asociadas
   * @param categoryId ID de la categoría
   * @param categoryName Nombre de la categoría
   * @returns Observable con objeto { hasTransactions: boolean, count: number }
   */
  checkTransactionsForCategory(categoryId: number, categoryName: string): Observable<{ hasTransactions: boolean; count: number }> {
    // Buscar por nombre de categoría (ya que las transacciones usan el nombre)
    return this.http.get<any[]>(`${this.transactionsUrl}?categoria=${encodeURIComponent(categoryName)}`).pipe(
      map(transactions => ({
        hasTransactions: transactions.length > 0,
        count: transactions.length
      }))
    );
  }

  /**
   * Inactiva una categoría en lugar de eliminarla
   * @param id ID de la categoría
   * @returns Observable<Categoria>
   */
  inactivate(id: number): Observable<Categoria> {
    return this.http.patch<Categoria>(`${this.apiUrl}/${id}`, { estado: false });
  }

  /**
   * Elimina o inactiva una categoría según tenga transacciones asociadas
   * @param id ID de la categoría
   * @param categoryName Nombre de la categoría
   * @returns Observable con el resultado
   */
  deleteOrInactivate(id: number, categoryName: string): Observable<{ deleted: boolean; inactivated: boolean; message: string }> {
    return new Observable(observer => {
      this.checkTransactionsForCategory(id, categoryName).subscribe({
        next: ({ hasTransactions, count }) => {
          if (hasTransactions) {
            // Si tiene transacciones, inactivar
            this.inactivate(id).subscribe({
              next: () => {
                observer.next({
                  deleted: false,
                  inactivated: true,
                  message: `Categoría inactivada. No se puede eliminar porque tiene ${count} transacción(es) asociada(s).`
                });
                observer.complete();
              },
              error: (err) => observer.error(err)
            });
          } else {
            // Si no tiene transacciones, eliminar
            this.delete(id).subscribe({
              next: () => {
                observer.next({
                  deleted: true,
                  inactivated: false,
                  message: 'Categoría eliminada exitosamente.'
                });
                observer.complete();
              },
              error: (err) => observer.error(err)
            });
          }
        },
        error: (err) => observer.error(err)
      });
    });
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
