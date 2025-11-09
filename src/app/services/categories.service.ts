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

  checkDuplicateByName(nombre: string, usuarioId: number, excludeId?: number): Observable<boolean> {
    return this.http.get<Categoria[]>(`${this.apiUrl}?nombre=${encodeURIComponent(nombre)}&usuarioId=${usuarioId}`).pipe(
      map(categories => {
        // Si hay un ID a excluir (modo edición), filtrarlo
        const duplicates = excludeId 
          ? categories.filter(c => c.id !== excludeId)
          : categories;
        return duplicates.length > 0;
      })
    );
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

  checkTransactionsForCategory(categoryId: number, categoryName: string): Observable<{ hasTransactions: boolean; count: number }> {
    // Buscar por nombre de categoría (ya que las transacciones usan el nombre)
    return this.http.get<any[]>(`${this.transactionsUrl}?categoria=${encodeURIComponent(categoryName)}`).pipe(
      map(transactions => ({
        hasTransactions: transactions.length > 0,
        count: transactions.length
      }))
    );
  }


  inactivate(id: number): Observable<Categoria> {
    return this.http.patch<Categoria>(`${this.apiUrl}/${id}`, { estado: false });
  }


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
