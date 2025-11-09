import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface Presupuesto {
  id?: number;
  usuarioId: number;
  categoriaId: number;
  categoria: string;
  monto: number;
  periodo: 'mensual' | 'anual';
  fechaInicio?: string;
  fechaFin?: string;
}

@Injectable({
  providedIn: 'root'
})
export class BudgetsService {
  private apiUrl = `${environment.apiUrl}/budgets`;

  constructor(private http: HttpClient) { }

  getAll(params?: any): Observable<Presupuesto[]> {
    return this.http.get<Presupuesto[]>(this.apiUrl, { params });
  }

  getById(id: number): Observable<Presupuesto> {
    return this.http.get<Presupuesto>(`${this.apiUrl}/${id}`);
  }

  getByCategoryAndUser(categoriaId: number, usuarioId: number): Observable<Presupuesto[]> {
    return this.http.get<Presupuesto[]>(`${this.apiUrl}?categoriaId=${categoriaId}&usuarioId=${usuarioId}`);
  }

  create(presupuesto: Partial<Presupuesto>): Observable<Presupuesto> {
    return this.http.post<Presupuesto>(this.apiUrl, presupuesto);
  }

  update(id: number, presupuesto: Partial<Presupuesto>): Observable<Presupuesto> {
    return this.http.put<Presupuesto>(`${this.apiUrl}/${id}`, presupuesto);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
