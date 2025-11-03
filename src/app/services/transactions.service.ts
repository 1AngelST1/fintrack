import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Movimiento } from '../shared/interfaces/movimiento';

@Injectable({
  providedIn: 'root'
})
export class TransactionsService {
  private apiUrl = `${environment.apiUrl}/movimientos`;

  constructor(private http: HttpClient) { }

  getAll(): Observable<Movimiento[]> {
    return this.http.get<Movimiento[]>(this.apiUrl);
  }

  getById(id: number): Observable<Movimiento> {
    return this.http.get<Movimiento>(`${this.apiUrl}/${id}`);
  }

  getByUserId(usuarioId: number): Observable<Movimiento[]> {
    return this.http.get<Movimiento[]>(`${this.apiUrl}?usuarioId=${usuarioId}`);
  }

  getByTipo(tipo: 'ingreso' | 'gasto'): Observable<Movimiento[]> {
    return this.http.get<Movimiento[]>(`${this.apiUrl}?tipo=${tipo}`);
  }

  getByCategoria(categoriaId: number): Observable<Movimiento[]> {
    return this.http.get<Movimiento[]>(`${this.apiUrl}?categoriaId=${categoriaId}`);
  }

  create(movimiento: Partial<Movimiento>): Observable<Movimiento> {
    return this.http.post<Movimiento>(this.apiUrl, movimiento);
  }

  update(id: number, movimiento: Partial<Movimiento>): Observable<Movimiento> {
    return this.http.put<Movimiento>(`${this.apiUrl}/${id}`, movimiento);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
