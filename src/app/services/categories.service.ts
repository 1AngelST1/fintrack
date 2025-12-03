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
  // [CORRECCIÓN 1] Agregamos la barra final '/' a todas las URLs base
  private apiUrl = `${environment.apiUrl}/categories/`;
  private transactionsUrl = `${environment.apiUrl}/transactions/`;
  private budgetsUrl = `${environment.apiUrl}/budgets/`;

  constructor(private http: HttpClient) { }

  getAll(): Observable<Categoria[]> {
    return this.http.get<Categoria[]>(this.apiUrl);
  }

  // [CORRECCIÓN 2] Ajustamos concatenación: `${this.apiUrl}${id}/` 
  // Esto genera: .../api/categories/1/ (con barra final)
  getById(id: number): Observable<Categoria> {
    return this.http.get<Categoria>(`${this.apiUrl}${id}/`);
  }

  getByUserId(usuarioId: number): Observable<Categoria[]> {
    return this.http.get<Categoria[]>(`${this.apiUrl}?usuarioId=${usuarioId}`);
  }

  checkDuplicateByName(nombre: string, usuarioId: number, excludeId?: number): Observable<boolean> {
    return this.http.get<Categoria[]>(`${this.apiUrl}?nombre=${encodeURIComponent(nombre)}&usuarioId=${usuarioId}`).pipe(
      map(categories => {
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

  // CREATE: Al tener apiUrl la barra final, el POST funciona correctamente
  create(categoria: Partial<Categoria>): Observable<Categoria> {
    return this.http.post<Categoria>(this.apiUrl, categoria);
  }

  // UPDATE: Aseguramos barra final .../id/
  update(id: number, categoria: Partial<Categoria>): Observable<Categoria> {
    return this.http.put<Categoria>(`${this.apiUrl}${id}/`, categoria);
  }

  checkTransactionsForCategory(categoryId: number, categoryName: string): Observable<{ hasTransactions: boolean; count: number }> {
    return this.http.get<any[]>(`${this.transactionsUrl}?categoria=${encodeURIComponent(categoryName)}`).pipe(
      map(transactions => ({
        hasTransactions: transactions.length > 0,
        count: transactions.length
      }))
    );
  }

  checkBudgetsForCategory(categoryId: number): Observable<{ hasBudgets: boolean; count: number }> {
    return this.http.get<any[]>(`${this.budgetsUrl}?categoriaId=${categoryId}`).pipe(
      map(budgets => ({
        hasBudgets: budgets.length > 0,
        count: budgets.length
      }))
    );
  }

  deleteBudgetsForCategory(categoryId: number): Observable<void> {
    return new Observable(observer => {
      this.http.get<any[]>(`${this.budgetsUrl}?categoriaId=${categoryId}`).subscribe({
        next: (budgets) => {
          if (budgets.length === 0) {
            observer.next();
            observer.complete();
            return;
          }

          let completed = 0;
          budgets.forEach(budget => {
            // DELETE: Aseguramos barra final
            this.http.delete(`${this.budgetsUrl}${budget.id}/`).subscribe({
              next: () => {
                completed++;
                if (completed === budgets.length) {
                  observer.next();
                  observer.complete();
                }
              },
              error: (err) => observer.error(err)
            });
          });
        },
        error: (err) => observer.error(err)
      });
    });
  }

  inactivate(id: number): Observable<Categoria> {
    // PATCH: Aseguramos barra final
    return this.http.patch<Categoria>(`${this.apiUrl}${id}/`, { estado: false });
  }

  deleteOrInactivate(id: number, categoryName: string): Observable<{ deleted: boolean; inactivated: boolean; message: string }> {
    return new Observable(observer => {
      this.checkTransactionsForCategory(id, categoryName).subscribe({
        next: ({ hasTransactions, count: txCount }) => {
          this.checkBudgetsForCategory(id).subscribe({
            next: ({ hasBudgets, count: budgetCount }) => {
              if (hasTransactions) {
                this.inactivate(id).subscribe({
                  next: () => {
                    observer.next({
                      deleted: false,
                      inactivated: true,
                      message: `Categoría inactivada. No se puede eliminar porque tiene ${txCount} transacción(es) asociada(s).`
                    });
                    observer.complete();
                  },
                  error: (err) => observer.error(err)
                });
              } else if (hasBudgets) {
                this.deleteBudgetsForCategory(id).subscribe({
                  next: () => {
                    this.delete(id).subscribe({
                      next: () => {
                        observer.next({
                          deleted: true,
                          inactivated: false,
                          message: `Categoría eliminada exitosamente. Se eliminaron ${budgetCount} presupuesto(s) asociado(s).`
                        });
                        observer.complete();
                      },
                      error: (err) => observer.error(err)
                    });
                  },
                  error: (err) => observer.error(err)
                });
              } else {
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
        },
        error: (err) => observer.error(err)
      });
    });
  }

  delete(id: number): Observable<void> {
    // DELETE: Aseguramos barra final
    return this.http.delete<void>(`${this.apiUrl}${id}/`);
  }
}