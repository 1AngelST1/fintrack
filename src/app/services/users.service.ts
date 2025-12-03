import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http'; // <--- Importar HttpHeaders
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Usuario } from '../shared/interfaces/usuario';

@Injectable({
  providedIn: 'root'
})
export class UsersService {
  private apiUrl = `${environment.apiUrl}/users`;

  constructor(private http: HttpClient) { }

  // --- HELPER PARA HEADERS ---
  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    let headers = new HttpHeaders();
    if (token) {
      // Si usas JWT, cambia 'Token' por 'Bearer'
      headers = headers.set('Authorization', `Token ${token}`);
    }
    return headers;
  }

  getAll(): Observable<Usuario[]> {
    const headers = this.getAuthHeaders();
    // Agregamos '/' al final: api/users/
    return this.http.get<Usuario[]>(`${this.apiUrl}/`, { headers });
  }

  getById(id: number): Observable<Usuario> {
    const headers = this.getAuthHeaders();
    return this.http.get<Usuario>(`${this.apiUrl}/${id}/`, { headers });
  }

  create(usuario: Partial<Usuario>): Observable<Usuario> {
    const headers = this.getAuthHeaders();
    return this.http.post<Usuario>(`${this.apiUrl}/`, usuario, { headers });
  }

  update(id: number, usuario: Partial<Usuario>): Observable<Usuario> {
    const headers = this.getAuthHeaders();
    return this.http.patch<Usuario>(`${this.apiUrl}/${id}/`, usuario, { headers });
  }

  delete(id: number): Observable<void> {
    const headers = this.getAuthHeaders();
    return this.http.delete<void>(`${this.apiUrl}/${id}/`, { headers });
  }
}