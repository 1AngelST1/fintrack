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
  private budgetsUrl = `${environment.apiUrl}/budgets`;

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

  checkBudgetsForCategory(categoryId: number): Observable<{ hasBudgets: boolean; count: number }> {
    // Buscar presupuestos por categoriaId
    return this.http.get<any[]>(`${this.budgetsUrl}?categoriaId=${categoryId}`).pipe(
      map(budgets => ({
        hasBudgets: budgets.length > 0,
        count: budgets.length
      }))
    );
  }

  deleteBudgetsForCategory(categoryId: number): Observable<void> {
    // Obtener todos los presupuestos de esta categoría y eliminarlos
    return new Observable(observer => {
      this.http.get<any[]>(`${this.budgetsUrl}?categoriaId=${categoryId}`).subscribe({
        next: (budgets) => {
          if (budgets.length === 0) {
            observer.next();
            observer.complete();
            return;
          }

          // Eliminar cada presupuesto
          let completed = 0;
          budgets.forEach(budget => {
            this.http.delete(`${this.budgetsUrl}/${budget.id}`).subscribe({
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
    return this.http.patch<Categoria>(`${this.apiUrl}/${id}`, { estado: false });
  }


  deleteOrInactivate(id: number, categoryName: string): Observable<{ deleted: boolean; inactivated: boolean; message: string }> {
    return new Observable(observer => {
      // Primero verificar transacciones y presupuestos
      this.checkTransactionsForCategory(id, categoryName).subscribe({
        next: ({ hasTransactions, count: txCount }) => {
          this.checkBudgetsForCategory(id).subscribe({
            next: ({ hasBudgets, count: budgetCount }) => {
              if (hasTransactions) {
                // Si tiene transacciones, inactivar (sin eliminar presupuestos)
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
                // Si no tiene transacciones pero sí presupuestos, eliminar presupuestos primero
                this.deleteBudgetsForCategory(id).subscribe({
                  next: () => {
                    // Luego eliminar la categoría
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
                // No tiene transacciones ni presupuestos, eliminar directamente
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
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
